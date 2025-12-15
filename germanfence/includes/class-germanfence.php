<?php
/**
 * Main GermanFence Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence {
    
    private static $instance = null;
    
    protected $admin;
    protected $antispam;
    protected $geo_blocking;
    protected $phrase_blocking;
    protected $statistics;
    protected $form_detector;
    protected $telemetry;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function __construct() {
        if (null !== self::$instance) {
            // Singleton pattern enforcement
            return;
        }
        $this->load_dependencies();
    }
    
    private function load_dependencies() {
        $this->admin = new GermanFence_Admin();
        $this->antispam = new GermanFence_AntiSpam();
        $this->geo_blocking = new GermanFence_GeoBlocking();
        $this->phrase_blocking = new GermanFence_PhraseBlocking();
        $this->statistics = new GermanFence_Statistics();
        $this->form_detector = new GermanFence_FormDetector();
        $this->telemetry = new GermanFence_Telemetry();
        
        // Update-Mail Blockierung laden
        $settings = get_option('germanfence_settings', array());
        if (!empty($settings['block_wp_update_emails']) && $settings['block_wp_update_emails'] === '1') {
            $this->block_update_emails();
        }
    }
    
    /**
     * Blockiert WordPress Update-E-Mails
     */
    private function block_update_emails() {
        // Blockiere Core-Update-E-Mails
        add_filter('auto_core_update_send_email', '__return_false');
        
        // Blockiere Plugin-Update-E-Mails
        add_filter('auto_plugin_update_send_email', '__return_false');
        
        // Blockiere Theme-Update-E-Mails
        add_filter('auto_theme_update_send_email', '__return_false');
        
        // Blockiere allgemeine Update-Benachrichtigungen
        add_filter('send_core_update_notification_email', '__return_false');
        add_filter('send_plugin_update_notification_email', '__return_false');
        add_filter('send_theme_update_notification_email', '__return_false');
    }
    
    public function run() {
        GermanFence_Logger::log_hook('run() wird aufgerufen');
        
        // Initialize admin interface
        add_action('admin_menu', array($this->admin, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this->admin, 'enqueue_admin_assets'));
        GermanFence_Logger::log_hook('Admin-Hooks registriert');
        
        // Initialize form protection
        add_action('wp_enqueue_scripts', array($this->antispam, 'enqueue_frontend_scripts'));
        GermanFence_Logger::log_hook('Frontend-Scripts-Hook registriert');
        
        // Hook into form submissions
        add_filter('preprocess_comment', array($this, 'validate_submission'), 1);
        add_filter('wpcf7_validate', array($this, 'validate_cf7_submission'), 10, 2);
        // Elementor wird durch FormDetector gehandhabt
        add_action('wp_ajax_nopriv_germanfence_validate', array($this, 'ajax_validate'));
        add_action('wp_ajax_germanfence_validate', array($this, 'ajax_validate'));
        GermanFence_Logger::log_hook('Validierungs-Hooks registriert');
        
        // Generic form hook
        add_action('wp_loaded', array($this->form_detector, 'detect_and_protect_forms'));
        GermanFence_Logger::log_hook('Form-Detector-Hook registriert');
        
        // Initialize AJAX Handler
        new GermanFence_Ajax();
        GermanFence_Logger::log_hook('AJAX-Handler initialisiert');
        
        // Telemetrie Cron-Job
        add_action('germanfence_send_telemetry', array($this, 'process_telemetry_queue'));
        GermanFence_Logger::log_hook('Telemetrie-Cron registriert');
    }
    
    /**
     * Verarbeitet die Telemetrie-Queue (via wp_cron)
     */
    public function process_telemetry_queue() {
        if ($this->telemetry) {
            $this->telemetry->process_queue();
        }
    }
    
    public function validate_submission($commentdata) {
        // Prüfen ob Kommentar-Bot-Blockierung aktiviert ist
        $settings = get_option('germanfence_settings', array());
        if (empty($settings['block_comment_bots']) || $settings['block_comment_bots'] !== '1') {
            return $commentdata; // Kommentar-Schutz deaktiviert
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WordPress comment form handles nonce verification
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            wp_die($validation['message'], 'Spam Detected', array('response' => 403));
        }
        
        return $commentdata;
    }
    
    public function validate_cf7_submission($result, $tag) {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Contact Form 7 handles nonce verification
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[CF7] 🚫 Validierung fehlgeschlagen: ' . $validation['reason']);
            $result->invalidate($tag, $validation['message']);
        }
        
        return $result;
    }
    
    public function ajax_validate() {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Public AJAX endpoint for form validation
        $validation = $this->perform_validation($_POST);
        wp_send_json($validation);
    }
    
    /**
     * Cache für Validierungsergebnis (verhindert mehrfaches Logging pro Request)
     * WICHTIG: Statische Variablen gelten pro PHP-Request, nicht pro Instanz
     */
    private static $validation_cache = null;
    private static $validation_logged = false;
    
    public function perform_validation($data) {
        // Wenn bereits validiert in diesem Request, gecachtes Ergebnis zurückgeben
        if (self::$validation_cache !== null) {
            GermanFence_Logger::log('[VALIDATION] ♻️ Cache-Hit: ' . (self::$validation_cache['valid'] ? 'LEGITIM' : 'BLOCKIERT'));
            return self::$validation_cache;
        }
        
        $ip = $this->get_client_ip();
        $settings = get_option('germanfence_settings', array());
        
        GermanFence_Logger::log('[VALIDATION] 🔍 Neue Validierung - IP: ' . $ip);
        
        // Führe alle Checks durch
        $result = $this->do_validation_checks($data, $ip, $settings);
        
        // WICHTIG: Logging erfolgt HIER zentral - NUR EINMAL pro Request
        if (!self::$validation_logged) {
            self::$validation_logged = true; // ZUERST setzen, dann loggen
            
            if ($result['valid']) {
                $this->statistics->log_legitimate($ip);
                GermanFence_Logger::log('[VALIDATION] ✅ LEGITIM geloggt');
            } else {
                // Block loggen mit dem spezifischen Grund
                $block_type = $result['block_type'] ?? 'unknown';
                $block_reason = $result['reason'] ?? 'Unknown reason';
                $country = $result['country'] ?? null;
                
                $this->statistics->log_block($block_type, $ip, $block_reason, $country);
                GermanFence_Logger::log('[VALIDATION] 🚫 BLOCKIERT - Type: ' . $block_type . ', Reason: ' . $block_reason);
            }
        }
        
        // Cache das Ergebnis
        self::$validation_cache = $result;
        
        return $result;
    }
    
    /**
     * Cache zurücksetzen (für Unit Tests)
     */
    public static function reset_validation_cache() {
        self::$validation_cache = null;
        self::$validation_logged = false;
    }
    
    /**
     * Führt alle Validierungs-Checks durch
     * WICHTIG: Logging erfolgt NICHT hier, sondern zentral in perform_validation
     */
    private function do_validation_checks($data, $ip, $settings) {
        // TEST-MODUS
        if (isset($settings['test_mode_block_all']) && $settings['test_mode_block_all'] === '1') {
            return array('valid' => false, 'message' => '🧪 TEST-MODUS aktiv', 'reason' => 'Test-Modus aktiviert', 'block_type' => 'test_mode');
        }
        
        // Nonce Check
        if (!isset($data['gs_nonce']) || !wp_verify_nonce($data['gs_nonce'], 'germanfence_nonce')) {
            return array('valid' => false, 'message' => 'Sicherheitsprüfung fehlgeschlagen', 'reason' => 'Invalid nonce', 'block_type' => 'nonce');
        }
        
        // Check submission rate (Rate Limiting) - nur wenn Basisschutz aktiviert
        if (!empty($settings['basic_protection_enabled'])) {
            $rate_check = $this->antispam->check_submission_rate($ip);
            if (!$rate_check['valid']) {
                $rate_check['block_type'] = 'rate_limit';
                return $rate_check;
            }
        }
        
        // Check for duplicate submissions - nur wenn Basisschutz aktiviert
        if (!empty($settings['basic_protection_enabled'])) {
            $duplicate_check = $this->antispam->check_duplicate_submission($data);
            if (!$duplicate_check['valid']) {
                $duplicate_check['block_type'] = 'duplicate';
                return $duplicate_check;
            }
        }
        
        // Honeypot
        if (!empty($settings['honeypot_enabled'])) {
            $honeypot_check = $this->antispam->check_honeypot($data);
            if (!$honeypot_check['valid']) {
                $honeypot_check['block_type'] = 'honeypot';
                return $honeypot_check;
            }
        }
        
        // Timestamp
        if (!empty($settings['timestamp_enabled'])) {
            $timestamp_check = $this->antispam->check_timestamp($data);
            if (!$timestamp_check['valid']) {
                $timestamp_check['block_type'] = 'timestamp';
                return $timestamp_check;
            }
        }
        
        // JavaScript, User-Agent und HTTP Headers - Teil des Basisschutzes
        if (!empty($settings['basic_protection_enabled'])) {
            // JavaScript Check
            $js_check = $this->antispam->check_javascript($data);
            if (!$js_check['valid']) {
                $js_check['block_type'] = 'javascript';
                return $js_check;
            }
            
            // User-Agent Check
            $ua_check = $this->antispam->check_user_agent();
            if (!$ua_check['valid']) {
                $ua_check['block_type'] = 'user_agent';
                return $ua_check;
            }
            
            // HTTP Headers Check
            $header_check = $this->antispam->check_http_headers();
            if (!$header_check['valid']) {
                $header_check['block_type'] = 'headers';
                return $header_check;
            }
        }
        
        // GEO Blocking
        if (!empty($settings['geo_blocking_enabled'])) {
            $geo_check = $this->geo_blocking->check_country($ip);
            if (!$geo_check['valid']) {
                $geo_check['block_type'] = 'geo';
                return $geo_check;
            }
        }
        
        // URL Limit Check
        if (!empty($settings['url_limit_enabled'])) {
            $url_check = $this->antispam->check_url_limit($data);
            if (!$url_check['valid']) {
                $url_check['block_type'] = 'url_limit';
                return $url_check;
            }
        }
        
        // Domain Blocking Check
        if (!empty($settings['domain_blocking_enabled'])) {
            $domain_check = $this->antispam->check_blocked_domains($data);
            if (!$domain_check['valid']) {
                $domain_check['block_type'] = 'domain_blocked';
                return $domain_check;
            }
        }
        
        // Phrase Blocking
        if (!empty($settings['phrase_blocking_enabled'])) {
            $phrase_check = $this->phrase_blocking->check_phrases($data);
            if (!$phrase_check['valid']) {
                $phrase_check['block_type'] = 'phrase';
                return $phrase_check;
            }
        }
        
        // Typing Speed
        if (!empty($settings['typing_speed_check'])) {
            $typing_check = $this->antispam->check_typing_speed($data);
            if (!$typing_check['valid']) {
                $typing_check['block_type'] = 'typing_speed';
                return $typing_check;
            }
        }
        
        // Alle Checks bestanden
        return array('valid' => true, 'message' => 'Valid submission');
    }
    
    private function get_client_ip() {
        $ip = '';
        
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = sanitize_text_field(wp_unslash($_SERVER['HTTP_CLIENT_IP']));
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']));
        } elseif (isset($_SERVER['REMOTE_ADDR'])) {
            $ip = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']));
        }
        
        return $ip;
    }
}


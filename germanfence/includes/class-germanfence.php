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
    }
    
    public function validate_submission($commentdata) {
        // Prüfen ob Kommentar-Bot-Blockierung aktiviert ist
        $settings = get_option('germanfence_settings', array());
        if (empty($settings['block_comment_bots']) || $settings['block_comment_bots'] !== '1') {
            return $commentdata; // Kommentar-Schutz deaktiviert
        }
        
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            wp_die($validation['message'], 'Spam Detected', array('response' => 403));
        }
        
        return $commentdata;
    }
    
    public function validate_cf7_submission($result, $tag) {
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            $result->invalidate($tag, $validation['message']);
        }
        
        return $result;
    }
    
    public function ajax_validate() {
        $validation = $this->perform_validation($_POST);
        wp_send_json($validation);
    }
    
    public function perform_validation($data) {
        // Query Monitor Timer starten
        $timer_total = microtime(true);
        
        $ip = $this->get_client_ip();
        $settings = get_option('germanfence_settings', array());
        
        GermanFence_Logger::log('[VALIDATION] 🔍 perform_validation() aufgerufen - IP: ' . $ip . ', POST-Keys: ' . implode(', ', array_keys($data)));
        
        // TEST-MODUS
        if (isset($settings['test_mode_block_all']) && $settings['test_mode_block_all'] === '1') {
            $this->statistics->log_block('test_mode', $ip, 'Test-Modus aktiviert');
            $this->log_timing('gs_validation', $timer_total);
            return array('valid' => false, 'message' => '🧪 TEST-MODUS aktiv', 'reason' => 'Test mode');
        }
        
        // Nonce Check
        $t = microtime(true);
        if (!isset($data['gs_nonce']) || !wp_verify_nonce($data['gs_nonce'], 'germanfence_nonce')) {
            $this->log_timing('gs_nonce', $t);
            $this->statistics->log_block('nonce', $ip, 'Invalid nonce');
            $this->log_timing('gs_validation', $timer_total);
            return array('valid' => false, 'message' => 'Sicherheitsprüfung fehlgeschlagen', 'reason' => 'Invalid nonce');
        }
        $this->log_timing('gs_nonce', $t);
        
        // Check submission rate (Rate Limiting)
        $rate_check = $this->antispam->check_submission_rate($ip);
        if (!$rate_check['valid']) {
            $this->statistics->log_block('rate_limit', $ip, $rate_check['reason']);
            return $rate_check;
        }
        
        // Check for duplicate submissions
        $duplicate_check = $this->antispam->check_duplicate_submission($data);
        if (!$duplicate_check['valid']) {
            $this->statistics->log_block('duplicate', $ip, $duplicate_check['reason']);
            return $duplicate_check;
        }
        
        // Honeypot
        if (!empty($settings['honeypot_enabled'])) {
            $t = microtime(true);
            $honeypot_check = $this->antispam->check_honeypot($data);
            $this->log_timing('gs_honeypot', $t);
            if (!$honeypot_check['valid']) {
                $this->statistics->log_block('honeypot', $ip, $honeypot_check['reason']);
                $this->log_timing('gs_validation', $timer_total);
                return $honeypot_check;
            }
        }
        
        // Timestamp
        if (!empty($settings['timestamp_enabled'])) {
            $t = microtime(true);
            $timestamp_check = $this->antispam->check_timestamp($data);
            $this->log_timing('gs_timestamp', $t);
            if (!$timestamp_check['valid']) {
                $this->statistics->log_block('timestamp', $ip, $timestamp_check['reason']);
                $this->log_timing('gs_validation', $timer_total);
                return $timestamp_check;
            }
        }
        
        // JavaScript
        if (!empty($settings['javascript_check'])) {
            $t = microtime(true);
            $js_check = $this->antispam->check_javascript($data);
            $this->log_timing('gs_javascript', $t);
            if (!$js_check['valid']) {
                $this->statistics->log_block('javascript', $ip, $js_check['reason']);
                $this->log_timing('gs_validation', $timer_total);
                return $js_check;
            }
        }
        
        // User-Agent
        if (!empty($settings['user_agent_check'])) {
            $t = microtime(true);
            $ua_check = $this->antispam->check_user_agent();
            $this->log_timing('gs_useragent', $t);
            if (!$ua_check['valid']) {
                $this->statistics->log_block('user_agent', $ip, $ua_check['reason']);
                $this->log_timing('gs_validation', $timer_total);
                return $ua_check;
            }
        }
        
        // HTTP Headers
        $t = microtime(true);
        $header_check = $this->antispam->check_http_headers();
        $this->log_timing('gs_headers', $t);
        if (!$header_check['valid']) {
            $this->statistics->log_block('headers', $ip, $header_check['reason']);
            $this->log_timing('gs_validation', $timer_total);
            return $header_check;
        }
        
        // GEO Blocking
        if (!empty($settings['geo_blocking_enabled'])) {
            $t = microtime(true);
            $geo_check = $this->geo_blocking->check_country($ip);
            $this->log_timing('gs_geo', $t);
            if (!$geo_check['valid']) {
                $this->statistics->log_block('geo', $ip, $geo_check['reason'], $geo_check['country']);
                $this->log_timing('gs_validation', $timer_total);
                return $geo_check;
            }
        }
        
        // Phrase Blocking
        if (!empty($settings['phrase_blocking_enabled'])) {
            $t = microtime(true);
            $phrase_check = $this->phrase_blocking->check_phrases($data);
            $this->log_timing('gs_phrase', $t);
            if (!$phrase_check['valid']) {
                $this->statistics->log_block('phrase', $ip, $phrase_check['reason']);
                $this->log_timing('gs_validation', $timer_total);
                return $phrase_check;
            }
        }
        
        // Typing Speed
        if (!empty($settings['typing_speed_check'])) {
            $t = microtime(true);
            $typing_check = $this->antispam->check_typing_speed($data);
            $this->log_timing('gs_typing', $t);
            if (!$typing_check['valid']) {
                $this->statistics->log_block('typing_speed', $ip, $typing_check['reason']);
                $this->log_timing('gs_validation', $timer_total);
                return $typing_check;
            }
        }
        
        // Log Legitimate
        $t = microtime(true);
        $this->statistics->log_legitimate($ip);
        $this->log_timing('gs_log_stats', $t);
        
        $this->log_timing('gs_validation', $timer_total);
        return array('valid' => true, 'message' => 'Valid submission');
    }
    
    private function get_client_ip() {
        $ip = '';
        
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        return $ip;
    }
    
    /**
     * Log Timing für Query Monitor & Debug-Log
     */
    private function log_timing($name, $start_time) {
        $duration = (microtime(true) - $start_time) * 1000; // ms
        
        // Query Monitor Integration
        do_action('qm/lap', 'germanfence/' . $name, $duration);
        
        // Debug-Log
        GermanFence_Logger::log('[TIMING] ' . $name . ': ' . number_format($duration, 2) . 'ms');
    }
}


<?php
/**
 * Anti-Spam Class - Optimiert mit Best Practices
 * Inspiriert von WP Armour und anderen führenden Anti-Spam-Lösungen
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_AntiSpam {
    
    private $settings;
    private $session_key = 'gs_session_token';
    
    public function __construct() {
        $this->settings = get_option('germanfence_settings', array());
    }
    
    /**
     * Enqueue frontend scripts
     */
    public function enqueue_frontend_scripts() {
        GermanFence_Logger::log('[FRONTEND] enqueue_frontend_scripts() aufgerufen - is_admin: ' . (is_admin() ? 'JA' : 'NEIN'));
        
        if (!$this->should_protect_page()) {
            GermanFence_Logger::log('[FRONTEND] should_protect_page() = false, Scripts werden NICHT geladen');
            return;
        }
        
        GermanFence_Logger::log('[FRONTEND] ✅ Scripts werden geladen');
        $settings = get_option('germanfence_settings', array());
        $position = $settings['script_position'] ?? 'footer';
        $defer = !empty($settings['defer_scripts']);
        
        // Script in Footer laden (true) oder Header (false)
        $in_footer = ($position === 'footer' || $position === 'body');
        
        wp_enqueue_script(
            'germanfence-frontend',
            GERMANFENCE_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            GERMANFENCE_VERSION,
            $in_footer
        );
        
        // Defer-Attribut hinzufügen
        if ($defer) {
            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'germanfence-frontend') {
                    return str_replace(' src', ' defer src', $tag);
                }
                return $tag;
            }, 10, 2);
        }
        
        wp_localize_script('germanfence-frontend', 'germanfence', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'timestamp' => time(),
            'honeypot' => $this->generate_honeypot_field_name(),
            'sessionToken' => $this->generate_session_token(),
            'nonce' => wp_create_nonce('germanfence_nonce'),
        ));
        
        wp_enqueue_style(
            'germanfence-frontend',
            GERMANFENCE_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            GERMANFENCE_VERSION
        );
    }
    
    /**
     * Check if current page should be protected
     */
    private function should_protect_page() {
        return !is_admin();
    }
    
    /**
     * Generate random honeypot field name (rotiert stündlich)
     */
    private function generate_honeypot_field_name() {
        $hour = date('YmdH');
        $cached_key = 'germanfence_honeypot_' . $hour;
        $cached = get_transient($cached_key);
        
        if ($cached) {
            return $cached;
        }
        
        // Verschiedene realistische Feldnamen
        $field_names = array(
            'website_url', 'homepage_link', 'user_website', 'site_url',
            'contact_url', 'company_site', 'web_address', 'url_field',
            'business_url', 'personal_site'
        );
        
        $field_name = $field_names[array_rand($field_names)] . '_' . substr(md5($hour . wp_salt()), 0, 6);
        set_transient($cached_key, $field_name, HOUR_IN_SECONDS);
        
        return $field_name;
    }
    
    /**
     * Generate session token (pro Session)
     */
    private function generate_session_token() {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }
        
        if (!isset($_SESSION[$this->session_key])) {
            $_SESSION[$this->session_key] = wp_generate_password(32, false);
        }
        
        return $_SESSION[$this->session_key];
    }
    
    /**
     * Check honeypot field - Erweiterte Prüfung
     */
    public function check_honeypot($data) {
        // Hole aktuellen und vorherigen Honeypot-Namen (für Zeitüberlappung)
        $current_hour = date('YmdH');
        $previous_hour = date('YmdH', strtotime('-1 hour'));
        
        $current_honeypot = get_transient('germanfence_honeypot_' . $current_hour);
        $previous_honeypot = get_transient('germanfence_honeypot_' . $previous_hour);
        
        // Prüfe beide Honeypots
        $honeypots = array_filter(array($current_honeypot, $previous_honeypot));
        
        foreach ($honeypots as $honeypot_field) {
            if (isset($data[$honeypot_field])) {
                // Feld existiert - prüfe ob ausgefüllt
                if (!empty($data[$honeypot_field])) {
                    return array(
                        'valid' => false,
                        'message' => 'Spam erkannt: Honeypot-Feld ausgefüllt',
                        'reason' => 'Honeypot field filled: ' . $honeypot_field
                    );
                }
                // Feld existiert und ist leer - gut!
                return array(
                    'valid' => true,
                    'message' => 'Honeypot check passed'
                );
            }
        }
        
        // Honeypot-Feld fehlt komplett - verdächtig!
        if (!empty($this->settings['honeypot_enabled'])) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Schutzfeld fehlt',
                'reason' => 'Honeypot field missing'
            );
        }
        
        return array(
            'valid' => true,
            'message' => 'Honeypot not required'
        );
    }
    
    /**
     * Check timestamp - Erweiterte Prüfung mit Toleranz
     */
    public function check_timestamp($data) {
        if (!isset($data['gs_timestamp'])) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Zeitstempel fehlt',
                'reason' => 'Missing timestamp'
            );
        }
        
        $form_timestamp = intval($data['gs_timestamp']);
        $current_time = time();
        $elapsed = $current_time - $form_timestamp;
        
        // Prüfe auf manipulierte Timestamps
        if ($form_timestamp > $current_time + 10) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Ungültiger Zeitstempel',
                'reason' => 'Future timestamp detected'
            );
        }
        
        $min_time = $this->settings['timestamp_min'] ?? 3;
        $max_time = $this->settings['timestamp_max'] ?? 3600;
        
        // Zu schnell (Bot)
        if ($elapsed < $min_time) {
            return array(
                'valid' => false,
                'message' => 'Unsere Anti-Spam-Routine hat eine zu schnelle Anfrage erkannt. Bitte warten Sie ' . $min_time . ' Sekunden, bevor Sie das Formular absenden. Dies schützt uns vor automatisierten Spam-Bots.',
                'reason' => 'Form submitted too fast: ' . $elapsed . 's (min: ' . $min_time . 's)'
            );
        }
        
        // Zu langsam (abgelaufen)
        if ($elapsed > $max_time) {
            return array(
                'valid' => false,
                'message' => 'Formular ist abgelaufen. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
                'reason' => 'Form expired: ' . $elapsed . 's (max: ' . $max_time . 's)'
            );
        }
        
        return array(
            'valid' => true,
            'message' => 'Timestamp check passed'
        );
    }
    
    /**
     * Check JavaScript - Gelockert für legitime Benutzer
     */
    public function check_javascript($data) {
        if (!isset($data['gs_js_token']) || empty($data['gs_js_token'])) {
            // Statt direkt zu blockieren, prüfen wir andere Indikatoren
            // Wenn Mausbewegungen oder Tastendrücke vorhanden sind, ist es wahrscheinlich ein Mensch
            if (isset($data['gs_mouse_movements']) && intval($data['gs_mouse_movements']) > 5) {
                return array('valid' => true, 'message' => 'JavaScript check bypassed (mouse movements)');
            }
            if (isset($data['gs_key_presses']) && intval($data['gs_key_presses']) > 3) {
                return array('valid' => true, 'message' => 'JavaScript check bypassed (key presses)');
            }
            
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: JavaScript nicht aktiviert',
                'reason' => 'JavaScript not enabled'
            );
        }
        
        // Token vorhanden - Basic Validation
        return array(
            'valid' => true,
            'message' => 'JavaScript check passed'
        );
    }
    
    /**
     * Check Tippgeschwindigkeit - Erkennt Bot-Muster
     */
    public function check_typing_speed($data) {
        // Wenn keine Daten vorhanden, überspringen
        if (!isset($data['gs_typing_speed']) || !isset($data['gs_typing_keys'])) {
            return array('valid' => true, 'message' => 'Typing speed check skipped');
        }
        
        $avg_speed = intval($data['gs_typing_speed']);
        $num_keys = intval($data['gs_typing_keys']);
        $key_repeat = isset($data['gs_key_repeat']) ? $data['gs_key_repeat'] === '1' : false;
        $typing_variance = isset($data['gs_typing_variance']) ? intval($data['gs_typing_variance']) : 999;
        
        // Zu wenige Tastendrücke für Analyse
        if ($num_keys < 5) {
            return array('valid' => true, 'message' => 'Not enough typing data');
        }
        
        // KEY-REPEAT-ERKENNUNG: Taste wurde gedrückt gehalten (z.B. "sssssssssss")
        if ($key_repeat) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Unnatürliches Tippverhalten',
                'reason' => 'Key-repeat pattern detected (key held down)'
            );
        }
        
        // BOT-MUSTER: Extrem schnelles Tippen (< 30ms durchschnittlich)
        // Menschliche Tipper: 100-300ms zwischen Tasten
        // Key-Repeat: 30-60ms (daher Schwelle erhöht)
        if ($avg_speed < 30 && $num_keys > 10) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Unnatürliche Tippgeschwindigkeit',
                'reason' => 'Bot typing detected: avg ' . $avg_speed . 'ms (human: 100-300ms)'
            );
        }
        
        // BOT-MUSTER: Perfekt gleichmäßiges Tippen (sehr niedrige Varianz)
        // Menschen haben natürliche Varianz in ihrer Tippgeschwindigkeit
        // Key-Repeat und Bots haben sehr gleichmäßige Intervalle
        if ($typing_variance < 15 && $num_keys > 15 && $avg_speed < 80) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Unnatürlich gleichmäßiges Tippen',
                'reason' => 'Robotic typing pattern: variance ' . $typing_variance . 'ms, avg ' . $avg_speed . 'ms'
            );
        }
        
        // BOT-MUSTER: avg_speed = 0 bei vielen Tastendrücken
        if ($avg_speed === 0 && $num_keys > 5) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Unnatürliche Tippgeschwindigkeit',
                'reason' => 'Perfect typing intervals detected'
            );
        }
        
        return array(
            'valid' => true,
            'message' => 'Typing speed check passed'
        );
    }
    
    /**
     * Check User-Agent - Erweiterte Bot-Erkennung
     */
    public function check_user_agent() {
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';
        
        if (empty($user_agent)) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Kein User-Agent',
                'reason' => 'Empty user agent'
            );
        }
        
        // Bekannte Bot-Patterns (erweitert)
        $bot_patterns = array(
            // Standard Bots
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            
            // Programming Languages
            'python', 'java', 'perl', 'ruby', 'php',
            
            // Libraries
            'libwww', 'mechanize', 'httpclient', 'requests', 'urllib',
            'axios', 'node-fetch', 'got',
            
            // Headless Browsers (oft für Scraping)
            'headless', 'phantom', 'selenium', 'puppeteer',
            
            // Spam-spezifische
            'masscan', 'zgrab', 'nmap', 'nikto', 'sqlmap',
            'acunetix', 'netsparker', 'burp',
        );
        
        $user_agent_lower = strtolower($user_agent);
        
        foreach ($bot_patterns as $pattern) {
            if (strpos($user_agent_lower, $pattern) !== false) {
                // Ausnahme für legitime Bots (Googlebot, etc.)
                $legit_bots = array('googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider');
                
                foreach ($legit_bots as $legit) {
                    if (strpos($user_agent_lower, $legit) !== false) {
                        return array(
                            'valid' => true,
                            'message' => 'Legitimate bot detected'
                        );
                    }
                }
                
                return array(
                    'valid' => false,
                    'message' => 'Spam erkannt: Bot User-Agent',
                    'reason' => 'Bot user agent detected: ' . $pattern
                );
            }
        }
        
        // Prüfe auf verdächtig kurze User-Agents
        if (strlen($user_agent) < 20) {
            return array(
                'valid' => false,
                'message' => 'Spam erkannt: Ungültiger User-Agent',
                'reason' => 'Suspiciously short user agent'
            );
        }
        
        return array(
            'valid' => true,
            'message' => 'User-Agent check passed'
        );
    }
    
    /**
     * Check HTTP Headers - Zusätzliche Validierung
     */
    public function check_http_headers() {
        // Prüfe auf fehlende Standard-Header
        $required_headers = array('HTTP_ACCEPT', 'HTTP_ACCEPT_LANGUAGE');
        
        foreach ($required_headers as $header) {
            if (!isset($_SERVER[$header]) || empty($_SERVER[$header])) {
                return array(
                    'valid' => false,
                    'message' => 'Spam erkannt: Fehlende HTTP-Header',
                    'reason' => 'Missing header: ' . $header
                );
            }
        }
        
        // Prüfe auf verdächtige Referer
        if (isset($_SERVER['HTTP_REFERER'])) {
            $referer = sanitize_text_field(wp_unslash($_SERVER['HTTP_REFERER']));
            $site_url = get_site_url();
            
            // Referer sollte von eigener Seite sein oder leer
            if (!empty($referer) && strpos($referer, $site_url) === false) {
                // Externe Referer sind verdächtig für Formulare
                return array(
                    'valid' => false,
                    'message' => 'Spam erkannt: Ungültiger Referer',
                    'reason' => 'External referer: ' . $referer
                );
            }
        }
        
        return array(
            'valid' => true,
            'message' => 'HTTP headers check passed'
        );
    }
    
    /**
     * Check submission rate (Rate Limiting pro IP)
     */
    public function check_submission_rate($ip) {
        $rate_limit_key = 'gs_rate_limit_' . md5($ip);
        $submissions = get_transient($rate_limit_key);
        
        if ($submissions === false) {
            $submissions = 0;
        }
        
        // Max 5 Submissions pro Minute
        $max_submissions = 5;
        $time_window = 60; // Sekunden
        
        if ($submissions >= $max_submissions) {
            return array(
                'valid' => false,
                'message' => 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
                'reason' => 'Rate limit exceeded: ' . $submissions . ' submissions in ' . $time_window . 's'
            );
        }
        
        // Increment counter
        set_transient($rate_limit_key, $submissions + 1, $time_window);
        
        return array(
            'valid' => true,
            'message' => 'Rate limit check passed'
        );
    }
    
    /**
     * Check for duplicate submissions
     */
    public function check_duplicate_submission($data) {
        // Erstelle Hash aus Formular-Daten
        $content_hash = md5(serialize($data));
        $duplicate_key = 'gs_submission_' . $content_hash;
        
        if (get_transient($duplicate_key)) {
            return array(
                'valid' => false,
                'message' => 'Duplikat erkannt. Diese Nachricht wurde bereits gesendet.',
                'reason' => 'Duplicate submission detected'
            );
        }
        
        // Markiere als gesendet für 5 Minuten
        set_transient($duplicate_key, true, 5 * MINUTE_IN_SECONDS);
        
        return array(
            'valid' => true,
            'message' => 'Duplicate check passed'
        );
    }
    
    /**
     * Check if content looks like spam
     */
    private function looks_like_spam($content) {
        // URLs prüfen
        if (preg_match_all('/https?:\/\//i', $content) > 3) {
            return true;
        }
        
        // Excessive special characters
        $special_chars = preg_match_all('/[^a-zA-Z0-9\s]/', $content);
        if ($special_chars > strlen($content) * 0.3) {
            return true;
        }
        
        // Repeated characters
        if (preg_match('/(.)\1{10,}/', $content)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Add honeypot to form
     */
    public function add_honeypot_field() {
        $field_name = $this->generate_honeypot_field_name();
        
        return sprintf(
            '<input type="text" name="%s" value="" class="gs-honeypot" tabindex="-1" autocomplete="new-password" aria-hidden="true">',
            esc_attr($field_name)
        );
    }
    
    /**
     * Add timestamp field
     */
    public function add_timestamp_field() {
        return sprintf(
            '<input type="hidden" name="gs_timestamp" value="%d" class="gs-timestamp">',
            time()
        );
    }
    
    /**
     * Add JavaScript token field
     */
    public function add_js_token_field() {
        return '<input type="hidden" name="gs_js_token" value="" class="gs-js-token">';
    }
    
    /**
     * Add nonce field
     */
    public function add_nonce_field() {
        return wp_nonce_field('germanfence_nonce', 'gs_nonce', true, false);
    }
    
    /**
     * Get all protection fields HTML
     */
    public function get_protection_fields() {
        $html = '';
        
        if (!empty($this->settings['honeypot_enabled'])) {
            $html .= $this->add_honeypot_field();
        }
        
        if (!empty($this->settings['timestamp_enabled'])) {
            $html .= $this->add_timestamp_field();
        }
        
        if (!empty($this->settings['javascript_check'])) {
            $html .= $this->add_js_token_field();
        }
        
        $html .= $this->add_nonce_field();
        
        return $html;
    }
    
    /**
     * Check URL limit
     */
    public function check_url_limit($data) {
        $max_urls = intval($this->settings['url_limit_max'] ?? 1);
        
        // Collect all text content
        $content = $this->collect_all_content($data);
        
        // Count URLs (http:// and https://)
        $url_count = preg_match_all('/https?:\/\//i', $content);
        
        if ($url_count > $max_urls) {
            return array(
                'valid' => false,
                'message' => 'Ihre Nachricht enthält zu viele Links (' . $url_count . '). Maximal erlaubt: ' . $max_urls,
                'reason' => 'URL limit exceeded: ' . $url_count . ' (max: ' . $max_urls . ')'
            );
        }
        
        return array(
            'valid' => true,
            'message' => 'URL limit check passed'
        );
    }
    
    /**
     * Check for blocked domains
     */
    public function check_blocked_domains($data) {
        $blocked_domains = $this->settings['blocked_domains'] ?? '';
        
        if (empty($blocked_domains)) {
            return array(
                'valid' => true,
                'message' => 'No domains blocked'
            );
        }
        
        // Parse blocked domains (komma-getrennt)
        $blocked_list = array_map('trim', explode(',', $blocked_domains));
        $blocked_list = array_filter($blocked_list);
        
        // Collect all text content
        $content = $this->collect_all_content($data);
        
        // Extract all domains from URLs
        preg_match_all('/https?:\/\/([a-z0-9.-]+)/i', $content, $matches);
        $found_domains = $matches[1];
        
        foreach ($found_domains as $domain) {
            foreach ($blocked_list as $blocked) {
                // Check if domain ends with blocked TLD
                if (stripos($domain, $blocked) !== false) {
                    return array(
                        'valid' => false,
                        'message' => 'URLs mit der Domain-Endung "' . $blocked . '" sind nicht erlaubt',
                        'reason' => 'Blocked domain detected: ' . $domain . ' (matches: ' . $blocked . ')'
                    );
                }
            }
        }
        
        return array(
            'valid' => true,
            'message' => 'Domain check passed'
        );
    }
    
    /**
     * Collect all content from form data
     */
    private function collect_all_content($data) {
        $content = array();
        
        // Skip system fields
        $skip_fields = array(
            'gs_timestamp', 'gs_js_token', '_wpnonce', '_wp_http_referer',
            'action', 'submit', 'germanfence_nonce', 'gs_nonce'
        );
        
        foreach ($data as $key => $value) {
            // Skip system fields
            if (in_array($key, $skip_fields) || strpos($key, 'gs_') === 0) {
                continue;
            }
            
            // Handle arrays
            if (is_array($value)) {
                $content[] = implode(' ', $value);
            } else {
                $content[] = $value;
            }
        }
        
        return implode(' ', $content);
    }
}

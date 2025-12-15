<?php
/**
 * Security & Code Protection Class
 * 
 * @package GermanShield
 * @copyright 2024-2025 meindl webdesign. All rights reserved.
 * @license Proprietary
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class GermanFence_Security {
    
    private static $instance = null;
    private $integrity_hash;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->integrity_hash = $this->calculate_integrity_hash();
        $this->init_protection();
    }
    
    /**
     * Initialize protection mechanisms
     */
    private function init_protection() {
        // Verhindere direkten Dateizugriff
        add_action('init', array($this, 'check_direct_access'), 1);
        
        // Verhindere Code-Injection
        add_action('plugins_loaded', array($this, 'check_code_injection'), 1);
        
        // Plugin-Integrity-Check
        add_action('admin_init', array($this, 'verify_plugin_integrity'));
    }
    
    /**
     * Check for direct file access attempts
     */
    public function check_direct_access() {
        // Prüfe ob WordPress geladen ist
        if (!defined('ABSPATH')) {
            $this->log_security_event('direct_access_attempt');
            die('Access denied. German Shield © meindl webdesign');
        }
    }
    
    /**
     * Check for code injection attempts
     */
    public function check_code_injection() {
        // DEAKTIVIERT - War zu aggressiv
        return;
        
        // Prüfe REQUEST auf verdächtige Patterns
        $suspicious_patterns = array(
            'eval\s*\(',
            'base64_decode',
            'gzinflate',
            'str_rot13',
            'system\s*\(',
            'exec\s*\(',
            'passthru',
            'shell_exec',
            '\$_GET\[',
            '\$_POST\[',
            '\$_REQUEST\[',
        );
        
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing -- Security scanner checks all input
        $check_vars = array_merge($_GET, $_POST, $_REQUEST);
        
        foreach ($check_vars as $key => $value) {
            if (is_string($value)) {
                foreach ($suspicious_patterns as $pattern) {
                    if (preg_match('/' . $pattern . '/i', $value)) {
                        $this->log_security_event('code_injection_attempt', $pattern);
                        wp_die('Security violation detected. This incident has been logged.');
                    }
                }
            }
        }
    }
    
    /**
     * Verify plugin file integrity
     */
    public function verify_plugin_integrity() {
        // Nur im Admin-Bereich prüfen
        if (!is_admin()) {
            return;
        }
        
        // Prüfe alle 24 Stunden
        $last_check = get_transient('germanfence_integrity_check');
        if ($last_check !== false) {
            return;
        }
        
        $current_hash = $this->calculate_integrity_hash();
        $stored_hash = get_option('germanfence_integrity_hash');
        
        // Beim ersten Mal den Hash speichern
        if (!$stored_hash) {
            update_option('germanfence_integrity_hash', $current_hash);
            set_transient('germanfence_integrity_check', true, DAY_IN_SECONDS);
            return;
        }
        
        // Hash vergleichen
        if ($current_hash !== $stored_hash) {
            $this->log_security_event('file_modification_detected');
            
            // Admin-Notice anzeigen
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p><strong>German Shield Security Alert:</strong> Plugin-Dateien wurden modifiziert! Dies könnte ein Sicherheitsrisiko darstellen.</p></div>';
            });
        }
        
        set_transient('germanfence_integrity_check', true, DAY_IN_SECONDS);
    }
    
    /**
     * Calculate plugin file integrity hash
     */
    private function calculate_integrity_hash() {
        $files_to_check = array(
            GERMANFENCE_PLUGIN_DIR . 'german-shield.php',
            GERMANFENCE_PLUGIN_DIR . 'includes/class-german-shield.php',
            GERMANFENCE_PLUGIN_DIR . 'includes/class-antispam.php',
            GERMANFENCE_PLUGIN_DIR . 'includes/class-geo-blocking.php',
        );
        
        $combined_hash = '';
        foreach ($files_to_check as $file) {
            if (file_exists($file)) {
                $combined_hash .= md5_file($file);
            }
        }
        
        return md5($combined_hash);
    }
    
    /**
     * Obfuscate sensitive data
     */
    public static function obfuscate($data) {
        // Einfache XOR-basierte Obfuscation
        $key = 'GS-' . GERMANFENCE_VERSION . '-MW';
        $result = '';
        $data = (string) $data;
        $key_length = strlen($key);
        
        for ($i = 0; $i < strlen($data); $i++) {
            $result .= chr(ord($data[$i]) ^ ord($key[$i % $key_length]));
        }
        
        return base64_encode($result);
    }
    
    /**
     * Deobfuscate data
     */
    public static function deobfuscate($data) {
        $data = base64_decode($data);
        $key = 'GS-' . GERMANFENCE_VERSION . '-MW';
        $result = '';
        $key_length = strlen($key);
        
        for ($i = 0; $i < strlen($data); $i++) {
            $result .= chr(ord($data[$i]) ^ ord($key[$i % $key_length]));
        }
        
        return $result;
    }
    
    /**
     * Verify license for protected features
     */
    public static function check_license_for_feature($feature) {
        $license_manager = new GermanFence_License();
        $license_info = $license_manager->get_license_info();
        
        if (!$license_info['is_valid']) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Log security events
     */
    private function log_security_event($event_type, $details = '') {
        global $wpdb;
        $table = $wpdb->prefix . 'germanfence_stats';
        
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table for security logging
        $wpdb->insert(
            $table,
            array(
                'type' => 'security_event',
                'ip_address' => isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown',
                'reason' => $event_type . ': ' . $details,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s')
        );
        
        // Log auch in WordPress Error-Log
        // Log wird weg gelassen - sollte kein Debug-Output in Production sein
    }
    
    /**
     * Anti-tampering check
     */
    public static function verify_execution_context() {
        // Prüfe ob die Ausführung aus WordPress kommt
        if (!defined('WPINC')) {
            die('German Shield - Unauthorized access. © meindl webdesign');
        }
        
        // Prüfe Nonce wenn im Admin
        if (is_admin() && defined('DOING_AJAX') && DOING_AJAX) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Checking if nonce exists, not verifying it
            // AJAX-Calls sollten Nonce haben
            if (!isset($_REQUEST['nonce']) && !isset($_REQUEST['_wpnonce'])) {
                // Manche WordPress Core AJAX-Calls haben keine Nonce, erlauben
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * Encrypt sensitive settings
     */
    public static function encrypt_setting($value) {
        if (!function_exists('openssl_encrypt')) {
            // Fallback auf einfache Obfuscation
            return self::obfuscate($value);
        }
        
        $key = wp_salt('auth');
        $iv = substr(wp_salt('secure_auth'), 0, 16);
        
        $encrypted = openssl_encrypt($value, 'AES-256-CBC', $key, 0, $iv);
        return base64_encode($encrypted);
    }
    
    /**
     * Decrypt sensitive settings
     */
    public static function decrypt_setting($value) {
        if (!function_exists('openssl_decrypt')) {
            // Fallback auf einfache Deobfuscation
            return self::deobfuscate($value);
        }
        
        $key = wp_salt('auth');
        $iv = substr(wp_salt('secure_auth'), 0, 16);
        
        $decrypted = openssl_decrypt(base64_decode($value), 'AES-256-CBC', $key, 0, $iv);
        return $decrypted;
    }
}

// Initialize Security
GermanFence_Security::get_instance();


<?php
/**
 * Logger Class - Ausführliches Debug-Logging
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Logger {
    
    private static $log_file;
    
    public static function init() {
        self::$log_file = WP_CONTENT_DIR . '/germanfence-debug.log';
    }
    
    public static function log($message, $context = array()) {
        if (!self::$log_file) {
            self::init();
        }
        
        $timestamp = current_time('Y-m-d H:i:s');
        $context_str = !empty($context) ? ' | Context: ' . json_encode($context) : '';
        $log_entry = "[{$timestamp}] {$message}{$context_str}\n";
        
        // Nur bei WP_DEBUG loggen
        if (defined('WP_DEBUG') && WP_DEBUG) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Only logs when WP_DEBUG is enabled
            error_log($log_entry, 3, self::$log_file);
        }
    }
    
    public static function log_admin($message, $context = array()) {
        self::log('[ADMIN] ' . $message, $context);
    }
    
    public static function log_save($message, $context = array()) {
        self::log('[SAVE] ' . $message, $context);
    }
    
    public static function log_validation($message, $context = array()) {
        self::log('[VALIDATION] ' . $message, $context);
    }
    
    public static function log_hook($message, $context = array()) {
        self::log('[HOOK] ' . $message, $context);
    }
    
    public static function log_error($message, $context = array()) {
        self::log('[ERROR] ' . $message, $context);
    }
    
    public static function clear_log() {
        if (!self::$log_file) {
            self::init();
        }
        
        if (file_exists(self::$log_file)) {
            unlink(self::$log_file);
        }
        
        self::log('=== LOG CLEARED ===');
    }
    
    public static function get_log() {
        if (!self::$log_file) {
            self::init();
        }
        
        if (file_exists(self::$log_file)) {
            return file_get_contents(self::$log_file);
        }
        
        return 'Keine Log-Datei vorhanden.';
    }
}

// Initialize logger
GermanFence_Logger::init();


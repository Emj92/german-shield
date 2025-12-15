<?php
/**
 * AJAX Handler Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Ajax {
    
    public function __construct() {
        // Auto-Save AJAX
        add_action('wp_ajax_germanfence_auto_save', array($this, 'auto_save'));
        
        // Clear Debug Log AJAX
        add_action('wp_ajax_germanfence_clear_log', array($this, 'clear_debug_log'));
    }
    
    /**
     * Auto-Save Settings
     */
    public function auto_save() {
        try {
            // Nonce prüfen
            if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'germanfence_admin')) {
                GermanFence_Logger::log('[AJAX] Nonce ungültig!');
                wp_send_json_error('Ungültiger Nonce');
                return;
            }
            
            if (!current_user_can('manage_options')) {
                GermanFence_Logger::log('[AJAX] Keine Berechtigung!');
                wp_send_json_error('Keine Berechtigung');
                return;
            }
            
            GermanFence_Logger::log('[AJAX] Auto-Save gestartet');
            
            // Hole aktuelle Einstellungen
            $settings = get_option('germanfence_settings', array());
            
            // Update einzelnes Feld
            if (isset($_POST['field']) && isset($_POST['value'])) {
                $field = sanitize_text_field(wp_unslash($_POST['field']));
                
                // Phrasen sind ein Array
                if ($field === 'blocked_phrases_text' || $field === 'blocked_phrases') {
                    $value = sanitize_textarea_field(wp_unslash($_POST['value']));
                    $phrases = array_filter(array_map('trim', explode(',', $value)));
                    $settings['blocked_phrases'] = $phrases;
                    GermanFence_Logger::log('[AJAX] Phrasen aktualisiert: ' . count($phrases) . ' Phrasen');
                }
                // Blockierte Länder (JSON Array)
                elseif ($field === 'blocked_countries') {
                    // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- JSON decoded and sanitized below
                    $value = wp_unslash($_POST['value']);
                    GermanFence_Logger::log('[AJAX] Länder-JSON empfangen: ' . $value);
                    
                    $countries = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($countries)) {
                        $settings['blocked_countries'] = array_map('sanitize_text_field', $countries);
                        GermanFence_Logger::log('[AJAX] Länder aktualisiert: ' . count($countries) . ' Länder: ' . implode(', ', $countries));
                    } else {
                        $settings['blocked_countries'] = array();
                        GermanFence_Logger::log('[AJAX] Länder geleert (JSON Error: ' . json_last_error_msg() . ')');
                    }
                } else {
                    $value = sanitize_text_field(wp_unslash($_POST['value']));
                    
                    // Boolean-Werte - SPEICHERE explizit '0' für false, NICHT unset!
                    if ($value === 'true' || $value === '1') {
                        $settings[$field] = '1';
                    } elseif ($value === 'false' || $value === '0') {
                        $settings[$field] = '0';  // WICHTIG: Speichere '0', nicht unset!
                    } else {
                        $settings[$field] = $value;
                    }
                    
                    GermanFence_Logger::log('[AJAX] Feld aktualisiert: ' . $field . ' = ' . $value . ' (gespeichert als: ' . $settings[$field] . ')');
                }
            }
            
            // Speichern
            update_option('germanfence_settings', $settings);
            
            wp_send_json_success(array(
                'message' => 'Gespeichert',
                'timestamp' => current_time('H:i:s'),
                'field' => $field,
                'value' => isset($settings[$field]) ? $settings[$field] : 'array'
            ));
            
        } catch (Exception $e) {
            GermanFence_Logger::log('[AJAX] FEHLER: ' . $e->getMessage());
            wp_send_json_error('Fehler: ' . $e->getMessage());
        }
    }
    
    /**
     * Clear Debug Log
     */
    public function clear_debug_log() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        GermanFence_Logger::clear_log();
        
        wp_send_json_success(array('message' => 'Debug-Log geleert'));
    }
}


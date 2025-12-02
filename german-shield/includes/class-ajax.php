<?php
/**
 * AJAX Handler Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class German_Shield_Ajax {
    
    public function __construct() {
        // Auto-Save AJAX
        add_action('wp_ajax_german_shield_auto_save', array($this, 'auto_save'));
        
        // Clear Debug Log AJAX
        add_action('wp_ajax_german_shield_clear_log', array($this, 'clear_debug_log'));
    }
    
    /**
     * Auto-Save Settings
     */
    public function auto_save() {
        try {
            // Nonce prüfen (ohne die)
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'german_shield_admin')) {
                German_Shield_Logger::log('[AJAX] Nonce ungültig!');
                wp_send_json_error('Ungültiger Nonce');
                return;
            }
            
            if (!current_user_can('manage_options')) {
                German_Shield_Logger::log('[AJAX] Keine Berechtigung!');
                wp_send_json_error('Keine Berechtigung');
                return;
            }
            
            German_Shield_Logger::log('[AJAX] Auto-Save gestartet');
            
            // Hole aktuelle Einstellungen
            $settings = get_option('german_shield_settings', array());
            
            // Update einzelnes Feld
            if (isset($_POST['field']) && isset($_POST['value'])) {
                $field = sanitize_text_field($_POST['field']);
                
                // Phrasen sind ein Array
                if ($field === 'blocked_phrases_text' || $field === 'blocked_phrases') {
                    $value = sanitize_textarea_field($_POST['value']);
                    $phrases = array_filter(array_map('trim', explode(',', $value)));
                    $settings['blocked_phrases'] = $phrases;
                    German_Shield_Logger::log('[AJAX] Phrasen aktualisiert: ' . count($phrases) . ' Phrasen');
                }
                // Blockierte Länder (JSON Array)
                elseif ($field === 'blocked_countries') {
                    $value = stripslashes($_POST['value']);
                    German_Shield_Logger::log('[AJAX] Länder-JSON empfangen: ' . $value);
                    
                    $countries = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($countries)) {
                        $settings['blocked_countries'] = array_map('sanitize_text_field', $countries);
                        German_Shield_Logger::log('[AJAX] Länder aktualisiert: ' . count($countries) . ' Länder: ' . implode(', ', $countries));
                    } else {
                        $settings['blocked_countries'] = array();
                        German_Shield_Logger::log('[AJAX] Länder geleert (JSON Error: ' . json_last_error_msg() . ')');
                    }
                } else {
                    $value = sanitize_text_field($_POST['value']);
                    
                    // Boolean-Werte - SPEICHERE explizit '0' für false, NICHT unset!
                    if ($value === 'true' || $value === '1') {
                        $settings[$field] = '1';
                    } elseif ($value === 'false' || $value === '0') {
                        $settings[$field] = '0';  // WICHTIG: Speichere '0', nicht unset!
                    } else {
                        $settings[$field] = $value;
                    }
                    
                    German_Shield_Logger::log('[AJAX] Feld aktualisiert: ' . $field . ' = ' . $value . ' (gespeichert als: ' . $settings[$field] . ')');
                }
            }
            
            // Speichern
            update_option('german_shield_settings', $settings);
            
            wp_send_json_success(array(
                'message' => 'Gespeichert',
                'timestamp' => current_time('H:i:s'),
                'field' => $field,
                'value' => isset($settings[$field]) ? $settings[$field] : 'array'
            ));
            
        } catch (Exception $e) {
            German_Shield_Logger::log('[AJAX] FEHLER: ' . $e->getMessage());
            wp_send_json_error('Fehler: ' . $e->getMessage());
        }
    }
    
    /**
     * Clear Debug Log
     */
    public function clear_debug_log() {
        check_ajax_referer('german_shield_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        German_Shield_Logger::clear_log();
        
        wp_send_json_success(array('message' => 'Debug-Log geleert'));
    }
}


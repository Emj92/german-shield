<?php
/**
 * License Class - Lizenzverwaltung
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_License {
    
    private $api_url = 'https://portal.germanshield.com/api'; // Später anpassen
    
    public function __construct() {
        add_action('admin_notices', array($this, 'show_license_notice'));
        add_action('wp_ajax_germanfence_activate_premium', array($this, 'ajax_activate_premium'));
        add_action('wp_ajax_germanfence_deactivate_premium', array($this, 'ajax_deactivate_premium'));
    }
    
    /**
     * Lizenz aktivieren
     */
    public function activate_license($license_key) {
        GermanFence_Logger::log('[LICENSE] Aktiviere Lizenz: ' . substr($license_key, 0, 10) . '...');
        
        $site_url = get_site_url();
        
        // Validiere Lizenzschlüssel-Format
        if (!preg_match('/^GS-\d{4}-\d{4}-\d{4}-\d{4}$/', $license_key)) {
            return array(
                'success' => false,
                'message' => 'Ungültiges Lizenzschlüssel-Format. Format: GS-XXXX-XXXX-XXXX-XXXX'
            );
        }
        
        // TEMPORÄR: Lokale Aktivierung bis API fertig ist
        // TODO: Später durch echten API-Call ersetzen
        $valid_keys = array(
            'GS-4723-2947-1494-4551', // Test-Lizenz
        );
        
        if (in_array($license_key, $valid_keys)) {
            // Lizenz speichern
            update_option('germanfence_license', array(
                'key' => $license_key,
                'status' => 'active',
                'expires_at' => date('Y-m-d H:i:s', strtotime('+1 year')),
                'api_key' => wp_generate_password(32, false),
                'activated_at' => current_time('mysql'),
                'site_url' => $site_url,
            ));
            
            GermanFence_Logger::log('[LICENSE] Lizenz erfolgreich aktiviert (lokal)');
            
            return array(
                'success' => true,
                'message' => 'Lizenz erfolgreich aktiviert! (Gültig bis ' . date('d.m.Y', strtotime('+1 year')) . ')'
            );
        }
        
        // Fallback: Versuche API-Call (wenn Portal läuft)
        $response = wp_remote_post($this->api_url . '/license/activate', array(
            'body' => json_encode(array(
                'license_key' => $license_key,
                'site_url' => $site_url,
                'site_name' => get_bloginfo('name'),
                'plugin_version' => GERMANFENCE_VERSION,
            )),
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'timeout' => 5,
            'sslverify' => false,
        ));
        
        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            
            if (!empty($body['success'])) {
                update_option('germanfence_license', array(
                    'key' => $license_key,
                    'status' => 'active',
                    'expires_at' => $body['expires_at'] ?? null,
                    'api_key' => $body['api_key'] ?? null,
                    'activated_at' => current_time('mysql'),
                ));
                
                GermanFence_Logger::log('[LICENSE] Lizenz erfolgreich aktiviert (API)');
                
                return array(
                    'success' => true,
                    'message' => 'Lizenz erfolgreich aktiviert!'
                );
            }
        }
        
        return array(
            'success' => false,
            'message' => 'Ungültiger Lizenzschlüssel. Bitte überprüfen Sie Ihre Eingabe.'
        );
    }
    
    /**
     * Lizenz deaktivieren
     */
    public function deactivate_license() {
        $license = get_option('germanfence_license', array());
        
        if (empty($license['key'])) {
            return array(
                'success' => false,
                'message' => 'Keine aktive Lizenz gefunden'
            );
        }
        
        GermanFence_Logger::log('[LICENSE] Deaktiviere Lizenz');
        
        // API-Call
        wp_remote_post($this->api_url . '/license/deactivate', array(
            'body' => json_encode(array(
                'license_key' => $license['key'],
                'site_url' => get_site_url(),
            )),
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'timeout' => 15,
        ));
        
        // Lizenz lokal löschen
        delete_option('germanfence_license');
        
        return array(
            'success' => true,
            'message' => 'Lizenz deaktiviert'
        );
    }
    
    /**
     * Lizenz-Status prüfen
     */
    public function check_license() {
        $license = get_option('germanfence_license', array());
        
        if (empty($license['key'])) {
            return array(
                'is_valid' => false,
                'status' => 'none',
                'message' => 'Keine Lizenz aktiviert'
            );
        }
        
        // Prüfe Ablaufdatum
        if (!empty($license['expires_at'])) {
            $expires = strtotime($license['expires_at']);
            if ($expires < time()) {
                return array(
                    'is_valid' => false,
                    'status' => 'expired',
                    'message' => 'Lizenz abgelaufen'
                );
            }
        }
        
        return array(
            'is_valid' => true,
            'status' => 'active',
            'message' => 'Lizenz aktiv',
            'expires_at' => $license['expires_at'] ?? null
        );
    }
    
    /**
     * Admin-Notice für Lizenz
     */
    public function show_license_notice() {
        $screen = get_current_screen();
        if ($screen->id !== 'toplevel_page_germanfence') {
            return;
        }
        
        $license_status = $this->check_license();
        
        // Prüfe auch Free-Version
        $free_manager = new GermanFence_Free_License();
        $is_free_active = $free_manager->is_free_active();
        
        if (!$license_status['is_valid'] && !$is_free_active) {
            ?>
            <div class="notice notice-warning">
                <p>
                    <strong>German Shield:</strong> 
                    <?php echo esc_html($license_status['message']); ?>
                    <a href="<?php echo admin_url('admin.php?page=germanfence&tab=license'); ?>">
                        Jetzt aktivieren
                    </a>
                </p>
            </div>
            <?php
        }
    }
    
    /**
     * Lizenz-Info für API (inkl. Free-Version Check)
     */
    public function get_license_info() {
        $license = get_option('germanfence_license', array());
        $status = $this->check_license();
        
        // WICHTIG: Auch Free-Version prüfen
        $free_manager = new GermanFence_Free_License();
        $is_free_active = $free_manager->is_free_active();
        $free_email = $free_manager->get_verified_email();
        
        // is_valid ist TRUE wenn Premium-Lizenz ODER Free-Version aktiv ist
        $is_valid = $status['is_valid'] || $is_free_active;
        
        GermanFence_Logger::log('[LICENSE-INFO] Premium valid: ' . ($status['is_valid'] ? 'JA' : 'NEIN') . ', Free active: ' . ($is_free_active ? 'JA' : 'NEIN') . ', Final valid: ' . ($is_valid ? 'JA' : 'NEIN'));
        
        return array(
            'has_license' => !empty($license['key']) || $is_free_active,
            'status' => $status['status'],
            'is_valid' => $is_valid,
            'expires_at' => $license['expires_at'] ?? null,
            'api_key' => $license['api_key'] ?? null,
            'is_free' => $is_free_active,
            'free_email' => $free_email,
        );
    }
    
    /**
     * AJAX Handler für Premium-Lizenz-Aktivierung
     */
    public function ajax_activate_premium() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        $license_key = sanitize_text_field($_POST['license_key'] ?? '');
        
        $result = $this->activate_license($license_key);
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    /**
     * AJAX Handler für Premium-Lizenz-Deaktivierung
     */
    public function ajax_deactivate_premium() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        $result = $this->deactivate_license();
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
}


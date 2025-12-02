<?php
/**
 * Free License Manager - E-Mail Verifizierung für kostenlose Version
 */

if (!defined('ABSPATH')) {
    exit;
}

class German_Shield_Free_License {
    
    private $table_name;
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'german_shield_free_users';
        
        // AJAX Handler
        add_action('wp_ajax_german_shield_register_free', array($this, 'ajax_register_free'));
        add_action('wp_ajax_nopriv_german_shield_register_free', array($this, 'ajax_register_free'));
        add_action('wp_ajax_german_shield_activate_free_key', array($this, 'ajax_activate_free_key'));
        add_action('wp_ajax_german_shield_deactivate_free', array($this, 'ajax_deactivate_free'));
        
        // Verification Handler
        add_action('admin_init', array($this, 'handle_verification'));
    }
    
    /**
     * Registriert einen neuen Free-User
     */
    public function register_email($email) {
        global $wpdb;
        
        // E-Mail validieren
        if (!is_email($email)) {
            return array('success' => false, 'message' => 'Ungültige E-Mail-Adresse');
        }
        
        // Prüfen ob E-Mail bereits registriert
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE email = %s",
            $email
        ));
        
        if ($existing) {
            if ($existing->is_verified) {
                return array('success' => false, 'message' => 'Diese E-Mail ist bereits verifiziert');
            } else {
                // Bestätigungsmail erneut senden
                $this->send_verification_email($email, $existing->verification_token);
                return array('success' => true, 'message' => 'Bestätigungsmail wurde erneut gesendet!');
            }
        }
        
        // Neuen Token generieren
        $token = bin2hex(random_bytes(32));
        
        // In Datenbank speichern
        $result = $wpdb->insert(
            $this->table_name,
            array(
                'email' => $email,
                'verification_token' => $token,
                'is_verified' => 0,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%d', '%s')
        );
        
        if (!$result) {
            return array('success' => false, 'message' => 'Fehler beim Speichern');
        }
        
        // Bestätigungsmail senden
        $sent = $this->send_verification_email($email, $token);
        
        if ($sent) {
            return array('success' => true, 'message' => 'Bestätigungsmail wurde gesendet! Bitte prüfe dein Postfach.');
        } else {
            return array('success' => false, 'message' => 'Fehler beim Versenden der E-Mail');
        }
    }
    
    /**
     * Sendet Verifizierungs-E-Mail
     */
    private function send_verification_email($email, $token) {
        $verification_url = admin_url('admin.php?page=german-shield&tab=license&verify_token=' . $token);
        
        $subject = '🛡️ German Shield - E-Mail bestätigen';
        
        $message = "Hallo!\n\n";
        $message .= "Danke für deine Registrierung bei German Shield!\n\n";
        $message .= "Bitte bestätige deine E-Mail-Adresse, um die kostenlose Version zu aktivieren:\n\n";
        $message .= $verification_url . "\n\n";
        $message .= "Der Link ist 24 Stunden gültig.\n\n";
        $message .= "---\n\n";
        $message .= "Nach der Bestätigung erhältst du automatisch einen FREE-LICENSE-KEY,\n";
        $message .= "mit dem du German Shield auch auf weiteren Domains aktivieren kannst.\n\n";
        $message .= "Der Key wird dir nach der Verifizierung im Plugin angezeigt.\n\n";
        $message .= "---\n\n";
        $message .= "Viel Erfolg mit German Shield!\n";
        $message .= "Dein GermanProWeb Team\n\n";
        $message .= "Website: https://german-shield.de";
        
        $headers = array('Content-Type: text/plain; charset=UTF-8');
        
        return wp_mail($email, $subject, $message, $headers);
    }
    
    /**
     * Verifiziert einen Token
     */
    public function verify_token($token) {
        global $wpdb;
        
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE verification_token = %s",
            $token
        ));
        
        if (!$user) {
            return array('success' => false, 'message' => 'Ungültiger Verifizierungslink');
        }
        
        if ($user->is_verified) {
            return array('success' => false, 'message' => 'Diese E-Mail wurde bereits verifiziert');
        }
        
        // Prüfe ob Token älter als 24 Stunden
        $created = strtotime($user->created_at);
        $now = current_time('timestamp');
        
        if (($now - $created) > 86400) {
            return array('success' => false, 'message' => 'Der Verifizierungslink ist abgelaufen (24 Stunden)');
        }
        
        // Free-License-Key generieren
        $license_key = 'GS-FREE-' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));
        
        // Verifizieren
        $result = $wpdb->update(
            $this->table_name,
            array(
                'is_verified' => 1,
                'verified_at' => current_time('mysql'),
                'license_key' => $license_key
            ),
            array('id' => $user->id),
            array('%d', '%s', '%s'),
            array('%d')
        );
        
        if ($result !== false) {
            // Speichere verifizierte E-Mail in Options (als String '1' für WordPress-Kompatibilität)
            update_option('german_shield_free_email', $user->email);
            update_option('german_shield_free_verified', '1');
            update_option('german_shield_free_license_key', $license_key);
            
            German_Shield_Logger::log('[FREE-LICENSE] E-Mail verifiziert: ' . $user->email . ' | Key: ' . $license_key);
            German_Shield_Logger::log('[FREE-LICENSE] Option gespeichert: ' . get_option('german_shield_free_verified'));
            
            return array(
                'success' => true, 
                'message' => 'E-Mail erfolgreich verifiziert! Du kannst jetzt die kostenlose Version nutzen.',
                'license_key' => $license_key
            );
        }
        
        return array('success' => false, 'message' => 'Fehler bei der Verifizierung');
    }
    
    /**
     * Prüft ob Free-Lizenz aktiv ist
     */
    public function is_free_active() {
        $verified = get_option('german_shield_free_verified', false);
        
        // WordPress speichert manchmal als String '1' oder als Boolean true
        $is_active = ($verified === true || $verified === '1' || $verified === 1);
        
        German_Shield_Logger::log('[FREE-LICENSE] Prüfe Status: ' . ($is_active ? 'AKTIV' : 'INAKTIV') . ' (Wert: ' . var_export($verified, true) . ')');
        
        return $is_active;
    }
    
    /**
     * Gibt verifizierte E-Mail zurück
     */
    public function get_verified_email() {
        return get_option('german_shield_free_email', '');
    }
    
    /**
     * AJAX Handler für Registrierung
     */
    public function ajax_register_free() {
        check_ajax_referer('german_shield_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        $email = sanitize_email($_POST['email'] ?? '');
        
        $result = $this->register_email($email);
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    /**
     * AJAX Handler für Key-Aktivierung
     */
    public function ajax_activate_free_key() {
        check_ajax_referer('german_shield_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        $key = sanitize_text_field($_POST['license_key'] ?? '');
        
        $result = $this->activate_with_key($key);
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    /**
     * AJAX Handler für Deaktivierung
     */
    public function ajax_deactivate_free() {
        check_ajax_referer('german_shield_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        $result = $this->deactivate_free();
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    /**
     * Handle Verification in Admin
     */
    public function handle_verification() {
        if (isset($_GET['page']) && $_GET['page'] === 'german-shield' && isset($_GET['verify_token'])) {
            $token = sanitize_text_field($_GET['verify_token']);
            $result = $this->verify_token($token);
            
            if ($result['success']) {
                // WICHTIG: Cache leeren damit neue Werte sofort verfügbar sind
                wp_cache_delete('german_shield_free_verified', 'options');
                wp_cache_delete('german_shield_free_email', 'options');
                
                German_Shield_Logger::log('[FREE-LICENSE] Verifizierung erfolgreich, Cache geleert, Redirect zu License-Tab');
                
                // Redirect nach Verifizierung um Token aus URL zu entfernen
                wp_redirect(admin_url('admin.php?page=german-shield&tab=license&verified=1'));
                exit;
            } else {
                add_action('admin_notices', function() use ($result) {
                    echo '<div class="notice notice-error is-dismissible"><p><strong>❌ ' . esc_html($result['message']) . '</strong></p></div>';
                });
            }
        }
        
        // Zeige Success-Nachricht nach Redirect
        if (isset($_GET['verified']) && $_GET['verified'] === '1') {
            // WICHTIG: Cache nochmal leeren
            wp_cache_delete('german_shield_free_verified', 'options');
            wp_cache_delete('german_shield_free_email', 'options');
            
            add_action('admin_notices', function() {
                echo '<div class="notice notice-success is-dismissible"><p><strong>✅ E-Mail erfolgreich verifiziert! German Shield ist jetzt aktiviert.</strong></p></div>';
            });
            
            German_Shield_Logger::log('[FREE-LICENSE] Zeige Success-Notice, Status: ' . ($this->is_free_active() ? 'AKTIV' : 'INAKTIV'));
        }
    }
    
    /**
     * Aktiviert Free-Lizenz mit Key
     */
    public function activate_with_key($key) {
        global $wpdb;
        
        // Key validieren
        $key = sanitize_text_field($key);
        
        if (empty($key) || strlen($key) < 10) {
            return array('success' => false, 'message' => 'Ungültiger License-Key');
        }
        
        // Prüfe ob Key existiert und verifiziert ist
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE license_key = %s AND is_verified = 1",
            $key
        ));
        
        if (!$user) {
            return array('success' => false, 'message' => 'License-Key nicht gefunden oder nicht verifiziert');
        }
        
        // Aktivieren
        update_option('german_shield_free_email', $user->email);
        update_option('german_shield_free_verified', '1');
        update_option('german_shield_free_license_key', $key);
        
        // Cache leeren
        wp_cache_delete('german_shield_free_verified', 'options');
        wp_cache_delete('german_shield_free_email', 'options');
        wp_cache_delete('german_shield_free_license_key', 'options');
        
        German_Shield_Logger::log('[FREE-LICENSE] Mit Key aktiviert: ' . $key . ' | E-Mail: ' . $user->email);
        
        return array('success' => true, 'message' => 'Free-License erfolgreich aktiviert!');
    }
    
    /**
     * Gibt aktuellen License-Key zurück
     */
    public function get_license_key() {
        return get_option('german_shield_free_license_key', '');
    }
    
    /**
     * Deaktiviert Free-Lizenz
     */
    public function deactivate_free() {
        delete_option('german_shield_free_email');
        delete_option('german_shield_free_verified');
        delete_option('german_shield_free_license_key');
        
        // Cache leeren
        wp_cache_delete('german_shield_free_verified', 'options');
        wp_cache_delete('german_shield_free_email', 'options');
        wp_cache_delete('german_shield_free_license_key', 'options');
        
        German_Shield_Logger::log('[FREE-LICENSE] Kostenlose Version deaktiviert');
        
        return array('success' => true, 'message' => 'Kostenlose Version deaktiviert');
    }
    
    /**
     * Debug-Info für Free-Lizenz
     */
    public function get_debug_info() {
        global $wpdb;
        
        $verified_option = get_option('german_shield_free_verified', 'NICHT GESETZT');
        $email_option = get_option('german_shield_free_email', 'NICHT GESETZT');
        
        $users = $wpdb->get_results("SELECT * FROM {$this->table_name}");
        
        return array(
            'option_verified' => $verified_option,
            'option_email' => $email_option,
            'is_active' => $this->is_free_active(),
            'users_in_db' => $users
        );
    }
}


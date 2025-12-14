<?php
/**
 * Free License Manager - E-Mail Verifizierung für kostenlose Version
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Free_License {
    
    private $table_name;
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'germanfence_free_users';
        
        // AJAX Handler
        add_action('wp_ajax_germanfence_register_free', array($this, 'ajax_register_free'));
        add_action('wp_ajax_nopriv_germanfence_register_free', array($this, 'ajax_register_free'));
        add_action('wp_ajax_germanfence_activate_free_key', array($this, 'ajax_activate_free_key'));
        add_action('wp_ajax_germanfence_deactivate_free', array($this, 'ajax_deactivate_free'));
        
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
        
        // ZUERST: Prüfen ob E-Mail bereits im Portal registriert ist
        $portal_check = $this->check_email_in_portal($email);
        if ($portal_check['exists'] && $portal_check['verified']) {
            return array('success' => false, 'message' => 'E-Mail bereits verifiziert. Falls du dein Plugin erneut aktivieren möchtest, findest du den Key in den E-Mails oder in deinem Portal.');
        }
        
        // Prüfen ob E-Mail bereits lokal registriert
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE email = %s",
            $email
        ));
        
        if ($existing) {
            if ($existing->is_verified) {
                return array('success' => false, 'message' => 'E-Mail bereits verifiziert. Falls du dein Plugin erneut aktivieren möchtest, findest du den Key in den E-Mails oder in deinem Portal.');
            } else {
                // Bestätigungsmail erneut senden (mit bestehendem Key)
                $this->send_verification_email($email, $existing->verification_token, $existing->license_key);
                return array('success' => true, 'message' => 'Bestätigungsmail wurde erneut gesendet!');
            }
        }
        
        // Neuen Token und License Key generieren
        $token = bin2hex(random_bytes(32));
        $license_key = 'GS-FREE-' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));
        
        // In Datenbank speichern
        $result = $wpdb->insert(
            $this->table_name,
            array(
                'email' => $email,
                'verification_token' => $token,
                'is_verified' => 0,
                'license_key' => $license_key,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%d', '%s', '%s')
        );
        
        if (!$result) {
            return array('success' => false, 'message' => 'Fehler beim Speichern');
        }
        
        // Bestätigungsmail senden
        $sent = $this->send_verification_email($email, $token, $license_key);
        
        if ($sent) {
            return array('success' => true, 'message' => 'Bestätigungsmail wurde gesendet! Bitte prüfe dein Postfach.');
        } else {
            return array('success' => false, 'message' => 'Fehler beim Versenden der E-Mail');
        }
    }
    
    /**
     * Sendet Verifizierungs-E-Mail
     */
    private function send_verification_email($email, $token, $license_key = '') {
        $verification_url = admin_url('admin.php?page=germanfence&tab=license&verify_token=' . $token);
        $portal_url = 'https://portal.germanfence.de/login';
        $password_reset_url = 'https://portal.germanfence.de/register?email=' . urlencode($email) . '&setPassword=true';
        
        $subject = '🛡️ GermanFence - E-Mail bestätigen';
        
        $message = "Hallo!\n\n";
        $message .= "Danke für deine Registrierung bei GermanFence!\n\n";
        $message .= "Bitte bestätige deine E-Mail-Adresse, um die kostenlose Version zu aktivieren:\n\n";
        $message .= "👉 " . $verification_url . "\n\n";
        $message .= "Der Link ist 24 Stunden gültig.\n\n";
        $message .= "══════════════════════════════════════════\n\n";
        
        if ($license_key) {
            $message .= "🔑 DEIN FREE-LICENSE-KEY:\n\n";
            $message .= $license_key . "\n\n";
            $message .= "• Nutze diesen Key um GermanFence auf weiteren Domains zu aktivieren\n";
            $message .= "• Der Key wird nach der Verifizierung auch im Plugin angezeigt\n";
            $message .= "• Speichere ihn sicher ab!\n\n";
            $message .= "══════════════════════════════════════════\n\n";
        }
        
        $message .= "🌐 PORTAL-ZUGANG:\n\n";
        $message .= "Ab jetzt kannst du dich im GermanFence Portal einloggen:\n";
        $message .= "👉 " . $portal_url . "\n\n";
        $message .= "Falls du noch kein Passwort gesetzt hast, kannst du es hier erstellen:\n";
        $message .= "👉 " . $password_reset_url . "\n\n";
        $message .= "══════════════════════════════════════════\n\n";
        $message .= "Viel Erfolg mit GermanFence!\n";
        $message .= "Dein GermanFence Team 🇩🇪\n\n";
        $message .= "Website: https://germanfence.de\n";
        $message .= "Support: support@germanfence.de";
        
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
        
        // Nutze existierenden License Key oder generiere neuen falls nicht vorhanden
        $license_key = $user->license_key;
        if (empty($license_key)) {
            $license_key = 'GS-FREE-' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));
        }
        
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
            update_option('germanfence_free_email', $user->email);
            update_option('germanfence_free_verified', '1');
            update_option('germanfence_free_license_key', $license_key);
            
            GermanFence_Logger::log('[FREE-LICENSE] E-Mail verifiziert: ' . $user->email . ' | Key: ' . $license_key);
            GermanFence_Logger::log('[FREE-LICENSE] Option gespeichert: ' . get_option('germanfence_free_verified'));
            
            // Registriere License auch im Portal (damit sie in der DB erscheint)
            $this->sync_license_to_portal($user->email, $license_key, $this->get_current_domain());
            
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
        $verified = get_option('germanfence_free_verified', false);
        
        // WordPress speichert manchmal als String '1' oder als Boolean true
        $is_active = ($verified === true || $verified === '1' || $verified === 1);
        
        GermanFence_Logger::log('[FREE-LICENSE] Prüfe Status: ' . ($is_active ? 'AKTIV' : 'INAKTIV'));
        
        return $is_active;
    }
    
    /**
     * Gibt verifizierte E-Mail zurück
     */
    public function get_verified_email() {
        return get_option('germanfence_free_email', '');
    }
    
    /**
     * AJAX Handler für Registrierung
     */
    public function ajax_register_free() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
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
        check_ajax_referer('germanfence_admin', 'nonce');
        
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
        check_ajax_referer('germanfence_admin', 'nonce');
        
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
        if (isset($_GET['page']) && $_GET['page'] === 'germanfence' && isset($_GET['verify_token'])) {
            $token = sanitize_text_field($_GET['verify_token']);
            $result = $this->verify_token($token);
            
            if ($result['success']) {
                // WICHTIG: Cache leeren damit neue Werte sofort verfügbar sind
                wp_cache_delete('germanfence_free_verified', 'options');
                wp_cache_delete('germanfence_free_email', 'options');
                
                GermanFence_Logger::log('[FREE-LICENSE] Verifizierung erfolgreich, Cache geleert, Redirect zu License-Tab');
                
                // Redirect nach Verifizierung um Token aus URL zu entfernen - Toast-Meldung über JS
                wp_safe_redirect(admin_url('admin.php?page=germanfence&tab=license&verified=1'));
                exit;
            } else {
                // Fehler über URL-Parameter für Toast-Meldung
                wp_safe_redirect(admin_url('admin.php?page=germanfence&tab=license&verify_error=' . rawurlencode($result['message'])));
                exit;
            }
        }
        
        // Toast-Meldungen werden jetzt über JavaScript gehandhabt (admin.js)
        // Keine WP admin_notices mehr verwenden!
    }
    
    /**
     * Aktiviert Lizenz mit Key (FREE, PRO, manuell generiert - alle Formate)
     */
    public function activate_with_key($key) {
        global $wpdb;
        
        // Key validieren und normalisieren
        $key = strtoupper(trim(sanitize_text_field($key)));
        
        if (empty($key) || strlen($key) < 8) {
            return array('success' => false, 'message' => 'Ungültiger License-Key (zu kurz)');
        }
        
        // Akzeptiere ALLE Key-Formate:
        // - GS-FREE-XXXX (Free-Keys)
        // - GS-PRO-XXXX, GS-SINGLE-XXXX, GS-FREELANCER-XXXX, GS-AGENCY-XXXX (Pro-Keys)
        // - Beliebige andere alphanumerische Keys mit Bindestrichen
        if (!preg_match('/^[A-Z0-9][A-Z0-9\-]{6,}[A-Z0-9]$/', $key)) {
            return array('success' => false, 'message' => 'Ungültiges Key-Format. Nur Buchstaben, Zahlen und Bindestriche erlaubt.');
        }
        
        // Erst lokal prüfen ob Key existiert (für FREE-Keys)
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE license_key = %s AND is_verified = 1",
            $key
        ));
        
        // Wenn lokal gefunden, E-Mail übernehmen
        // Wenn NICHT lokal gefunden, versuche von API zu holen (PRO-Keys)
        $email = '';
        if ($user) {
            $email = $user->email;
        }
        
        // Key-Typ bestimmen
        $key_type = 'CUSTOM';
        if (strpos($key, 'GS-FREE-') === 0) {
            $key_type = 'FREE';
        } elseif (strpos($key, 'GS-PRO-') === 0 || strpos($key, 'GS-SINGLE-') === 0 || 
                  strpos($key, 'GS-FREELANCER-') === 0 || strpos($key, 'GS-AGENCY-') === 0) {
            $key_type = 'PRO';
        }
        
        // Key aktivieren
        update_option('germanfence_free_email', $email);
        update_option('germanfence_free_verified', '1');
        update_option('germanfence_free_license_key', $key);
        
        // Bei PRO-Keys auch in die Premium-Settings speichern
        if ($key_type === 'PRO') {
            $settings = get_option('germanfence_settings', array());
            $settings['license_key'] = $key;
            update_option('germanfence_settings', $settings);
            
            // License-Cache leeren für Revalidierung
            delete_transient('germanfence_license_data');
            
            // SOFORT API-Validierung durchführen um Features zu laden
            require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-license.php';
            $license = new GermanFence_License();
            $validation = $license->validate_license($key);
            
            // Email aus API-Response holen wenn nicht lokal gefunden
            if (empty($email) && isset($validation['license']['userEmail'])) {
                $email = $validation['license']['userEmail'];
            }
            
            GermanFence_Logger::log('[LICENSE] API-Validierung nach Aktivierung: ' . json_encode($validation));
        }
        
        // Cache leeren
        wp_cache_delete('germanfence_free_verified', 'options');
        wp_cache_delete('germanfence_free_email', 'options');
        wp_cache_delete('germanfence_free_license_key', 'options');
        
        GermanFence_Logger::log('[LICENSE] Mit Key aktiviert: ' . $key . ' | Typ: ' . $key_type . ' | E-Mail: ' . $email);
        
        // Registriere FREE-License auch im Portal (damit sie in der DB erscheint)
        if ($key_type === 'FREE') {
            $this->sync_license_to_portal($email, $key, $this->get_current_domain());
        }
        
        // Erfolgs-Nachricht mit Lizenztyp
        $type_names = array(
            'FREE' => 'FREE',
            'PRO' => 'PRO',
            'SINGLE' => 'SINGLE',
            'FREELANCER' => 'FREELANCER',
            'AGENCY' => 'AGENCY',
            'CUSTOM' => 'CUSTOM'
        );
        
        // Detaillierter Typ für spezielle Keys
        $detailed_type = $key_type;
        if (strpos($key, 'GS-SINGLE-') === 0) $detailed_type = 'SINGLE';
        elseif (strpos($key, 'GS-FREELANCER-') === 0) $detailed_type = 'FREELANCER';
        elseif (strpos($key, 'GS-AGENCY-') === 0) $detailed_type = 'AGENCY';
        
        $type_display = isset($type_names[$detailed_type]) ? $type_names[$detailed_type] : $detailed_type;
        $success_msg = '✅ ' . $type_display . '-Lizenz erfolgreich aktiviert!';
        
        return array('success' => true, 'message' => $success_msg);
    }
    
    /**
     * Gibt aktuellen License-Key zurück
     */
    public function get_license_key() {
        return get_option('germanfence_free_license_key', '');
    }
    
    /**
     * Deaktiviert Free-Lizenz
     */
    public function deactivate_free() {
        // Hole Lizenzschlüssel BEVOR er gelöscht wird
        $license_key = get_option('germanfence_free_license_key', '');
        
        // Domain aus Portal entfernen
        if (!empty($license_key)) {
            $this->remove_domain_from_portal($license_key);
        }
        
        delete_option('germanfence_free_email');
        delete_option('germanfence_free_verified');
        delete_option('germanfence_free_license_key');
        
        // Cache leeren
        wp_cache_delete('germanfence_free_verified', 'options');
        wp_cache_delete('germanfence_free_email', 'options');
        wp_cache_delete('germanfence_free_license_key', 'options');
        
        GermanFence_Logger::log('[FREE-LICENSE] Kostenlose Version deaktiviert');
        
        return array('success' => true, 'message' => 'Kostenlose Version deaktiviert');
    }
    
    /**
     * Entfernt die aktuelle Domain aus dem Portal
     */
    private function remove_domain_from_portal($license_key) {
        $domain = get_site_url();
        
        GermanFence_Logger::log('[FREE-LICENSE] Entferne Domain aus Portal: ' . $domain);
        
        $response = wp_remote_post('https://app.germanfence.de/api/licenses/domains/remove', array(
            'timeout' => 15,
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'licenseKey' => $license_key,
                'domain' => $domain,
            )),
        ));
        
        if (is_wp_error($response)) {
            GermanFence_Logger::log('[FREE-LICENSE] Fehler beim Entfernen der Domain: ' . $response->get_error_message());
            return false;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!empty($body['success'])) {
            GermanFence_Logger::log('[FREE-LICENSE] ✅ Domain erfolgreich aus Portal entfernt');
            return true;
        }
        
        GermanFence_Logger::log('[FREE-LICENSE] Domain-Entfernung fehlgeschlagen: ' . ($body['error'] ?? 'Unbekannter Fehler'));
        return false;
    }
    
    /**
     * Debug-Info für Free-Lizenz
     */
    public function get_debug_info() {
        global $wpdb;
        
        $verified_option = get_option('germanfence_free_verified', 'NICHT GESETZT');
        $email_option = get_option('germanfence_free_email', 'NICHT GESETZT');
        
        $users = $wpdb->get_results("SELECT * FROM {$this->table_name}");
        
        return array(
            'option_verified' => $verified_option,
            'option_email' => $email_option,
            'is_active' => $this->is_free_active(),
            'users_in_db' => $users
        );
    }
    
    /**
     * Synchronisiert FREE-License mit Portal-Datenbank
     */
    private function sync_license_to_portal($email, $license_key, $domain = '') {
        $portal_url = 'https://portal.germanfence.de/api/licenses/register-free';
        
        $data = array(
            'email' => $email,
            'licenseKey' => $license_key,
            'domain' => $domain
        );
        
        $args = array(
            'method' => 'POST',
            'timeout' => 10,
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data)
        );
        
        GermanFence_Logger::log('[FREE-LICENSE-SYNC] Sende an Portal: ' . $portal_url);
        GermanFence_Logger::log('[FREE-LICENSE-SYNC] Daten: ' . json_encode($data));
        
        $response = wp_remote_post($portal_url, $args);
        
        if (is_wp_error($response)) {
            GermanFence_Logger::log('[FREE-LICENSE-SYNC] ❌ Fehler: ' . $response->get_error_message());
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        GermanFence_Logger::log('[FREE-LICENSE-SYNC] ✅ Response: ' . $body);
        
        return isset($result['success']) && $result['success'];
    }
    
    /**
     * Gibt aktuelle Domain zurück
     */
    private function get_current_domain() {
        $site_url = get_site_url();
        $parsed = wp_parse_url( $site_url );
        return isset($parsed['host']) ? $parsed['host'] : '';
    }
    
    /**
     * Prüft ob E-Mail bereits im Portal registriert und verifiziert ist
     */
    private function check_email_in_portal($email) {
        $portal_url = 'https://portal.germanfence.de/api/auth/check-email?email=' . urlencode($email);
        
        $args = array(
            'method' => 'GET',
            'timeout' => 10,
            'headers' => array(
                'Content-Type' => 'application/json'
            )
        );
        
        GermanFence_Logger::log('[FREE-LICENSE] Prüfe Email im Portal: ' . $email);
        
        $response = wp_remote_get($portal_url, $args);
        
        if (is_wp_error($response)) {
            GermanFence_Logger::log('[FREE-LICENSE] Portal-Check Fehler: ' . $response->get_error_message());
            // Bei Fehler: Weiter machen (nicht blockieren)
            return array('exists' => false, 'verified' => false);
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        GermanFence_Logger::log('[FREE-LICENSE] Portal-Check Response: ' . $body);
        
        // Wenn User existiert und verifiziert ist
        if (isset($result['exists']) && $result['exists'] && isset($result['verified']) && $result['verified']) {
            return array('exists' => true, 'verified' => true);
        }
        
        return array('exists' => false, 'verified' => false);
    }
}


<?php
/**
 * Telemetry Class - DSGVO-konform
 * 
 * Sendet ANONYMISIERTE Daten zum Admin-Portal zur Muster-Erkennung.
 * 
 * Datenschutz:
 * - Daten werden NUR in Deutschland verarbeitet (Hetzner)
 * - Nur zur Gefahrenabwehr und Spam-Muster-Erkennung
 * - Keine persönlichen/sensiblen Daten
 * - Opt-in erforderlich
 * - Jederzeit widerrufbar
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Telemetry {
    
    private $portal_url = 'https://app.germanfence.de';
    private $enabled = false;
    
    public function __construct() {
        $settings = get_option('germanfence_settings', array());
        $this->enabled = isset($settings['telemetry_enabled']) && $settings['telemetry_enabled'] === '1';
    }
    
    /**
     * Sendet ein anonymisiertes Block-Event zum Portal
     */
    public function send_block_event($type, $ip, $reason, $country = null, $form_data = null) {
        // Prüfe ob Telemetrie aktiviert ist
        if (!$this->enabled) {
            GermanFence_Logger::log('[TELEMETRY] Nicht aktiviert - Event wird nicht gesendet');
            return;
        }
        
        GermanFence_Logger::log('[TELEMETRY] Sende Event: ' . $type);
        
        try {
            // Anonymisiere Daten
            $telemetry_data = array(
                'ip_hash' => $this->hash_ip($ip),
                'country_code' => $country,
                'block_method' => $type,
                'block_reason' => $this->sanitize_reason($reason),
                'email_domain_hash' => $this->extract_and_hash_email_domain($form_data),
                'spam_domains' => $this->extract_spam_domains($form_data),
                'user_agent_hash' => $this->hash_user_agent(),
                'plugin_version' => GERMANFENCE_VERSION,
                'site_url_hash' => hash('sha256', get_site_url()),
            );
            
            // SOFORT senden (non-blocking) - wp_cron ist unzuverlässig
            $this->send_immediately($telemetry_data);
            
        } catch (Exception $e) {
            GermanFence_Logger::log('[TELEMETRY] Fehler: ' . $e->getMessage());
        }
    }
    
    /**
     * Sendet Telemetrie-Daten SOFORT (non-blocking)
     */
    private function send_immediately($telemetry_data) {
        // Non-blocking HTTP POST
        $response = wp_remote_post($this->portal_url . '/api/telemetry', array(
            'timeout' => 0.5, // Kurzes Timeout für non-blocking
            'blocking' => false, // Non-blocking!
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-Plugin-Version' => GERMANFENCE_VERSION,
            ),
            'body' => json_encode($telemetry_data),
        ));
        
        GermanFence_Logger::log('[TELEMETRY] ✅ Event gesendet (non-blocking)');
    }
    
    /**
     * Sendet alle Events aus der Queue (Legacy - wird via wp_cron aufgerufen)
     */
    public function process_queue() {
        $queue = get_option('germanfence_telemetry_queue', array());
        
        if (empty($queue)) {
            return;
        }
        
        GermanFence_Logger::log('[TELEMETRY] Verarbeite Queue: ' . count($queue) . ' Events');
        
        foreach ($queue as $telemetry_data) {
            $response = wp_remote_post($this->portal_url . '/api/telemetry', array(
                'timeout' => 10,
                'blocking' => true,
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-Plugin-Version' => GERMANFENCE_VERSION,
                ),
                'body' => json_encode($telemetry_data),
            ));
            
            if (is_wp_error($response)) {
                GermanFence_Logger::log('[TELEMETRY] Fehler beim Senden: ' . $response->get_error_message());
            } else {
                $code = wp_remote_retrieve_response_code($response);
                $body = wp_remote_retrieve_body($response);
                GermanFence_Logger::log('[TELEMETRY] Gesendet! HTTP ' . $code . ' - ' . $body);
            }
        }
        
        // Queue leeren
        delete_option('germanfence_telemetry_queue');
        GermanFence_Logger::log('[TELEMETRY] Queue geleert');
    }
    
    /**
     * Hasht IP-Adresse (SHA-256, nicht umkehrbar)
     */
    private function hash_ip($ip) {
        // Verwende Salt für zusätzliche Sicherheit
        $salt = get_option('germanfence_telemetry_salt');
        
        // Generiere Salt wenn nicht vorhanden
        if (!$salt) {
            $salt = wp_generate_password(32, false);
            add_option('germanfence_telemetry_salt', $salt, '', 'no'); // Nicht exportieren
        }
        
        return hash('sha256', $ip . $salt);
    }
    
    /**
     * Extrahiert und hasht nur die Domain einer E-Mail
     */
    private function extract_and_hash_email_domain($form_data) {
        if (empty($form_data)) {
            return null;
        }
        
        // Suche nach E-Mail-Adressen in Form-Daten
        $pattern = '/[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/';
        preg_match_all($pattern, is_array($form_data) ? json_encode($form_data) : $form_data, $matches);
        
        if (!empty($matches[1])) {
            // Nimm nur die erste Domain und hashe sie
            $domain = strtolower($matches[1][0]);
            return hash('sha256', $domain);
        }
        
        return null;
    }
    
    /**
     * Extrahiert verdächtige Domains aus Form-Daten und User-Agent
     */
    private function extract_spam_domains($form_data) {
        if (empty($form_data)) {
            return null;
        }
        
        $domains = array();
        $text = is_array($form_data) ? json_encode($form_data) : $form_data;
        
        // Pattern für URLs
        $pattern = '/https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/';
        preg_match_all($pattern, $text, $matches);
        
        if (!empty($matches[1])) {
            // Nur unique Domains, lowercase
            $domains = array_unique(array_map('strtolower', $matches[1]));
            
            // Limitiere auf max. 5 Domains
            $domains = array_slice($domains, 0, 5);
        }
        
        return !empty($domains) ? $domains : null;
    }
    
    /**
     * Hasht User-Agent
     */
    private function hash_user_agent() {
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        
        if (empty($user_agent)) {
            return null;
        }
        
        return hash('sha256', $user_agent);
    }
    
    /**
     * Bereinigt Block-Grund (entfernt persönliche Daten)
     */
    private function sanitize_reason($reason) {
        if (empty($reason)) {
            return null;
        }
        
        // Entferne potenzielle IP-Adressen
        $reason = preg_replace('/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/', '[IP]', $reason);
        
        // Entferne E-Mail-Adressen
        $reason = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[EMAIL]', $reason);
        
        // Limitiere Länge
        return substr($reason, 0, 255);
    }
    
    /**
     * Aktiviert Telemetrie (Opt-in)
     */
    public function enable() {
        $settings = get_option('germanfence_settings', array());
        $settings['telemetry_enabled'] = '1';
        $settings['telemetry_opted_in_at'] = current_time('mysql');
        update_option('germanfence_settings', $settings);
        
        $this->enabled = true;
        
        GermanFence_Logger::log('[TELEMETRY] Aktiviert - Opt-in erteilt');
    }
    
    /**
     * Deaktiviert Telemetrie (Opt-out)
     */
    public function disable() {
        $settings = get_option('germanfence_settings', array());
        $settings['telemetry_enabled'] = '0';
        $settings['telemetry_opted_out_at'] = current_time('mysql');
        update_option('germanfence_settings', $settings);
        
        $this->enabled = false;
        
        GermanFence_Logger::log('[TELEMETRY] Deaktiviert - Opt-out');
    }
    
    /**
     * Prüft ob Telemetrie aktiviert ist
     */
    public function is_enabled() {
        return $this->enabled;
    }
}

<?php
/**
 * License Management & Feature Control
 * 
 * Verwaltet Lizenzprüfung und Feature-Freischaltung basierend auf Pakettyp
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_License {
    
    private static $instance = null;
    private $license_data = null;
    private $api_url = 'https://portal.germanfence.de/api/plugin/validate-license';
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Prüft ob ein Feature verfügbar ist
     */
    public function has_feature($feature) {
        $license = $this->get_license_data();
        
        // Wenn keine Lizenz vorhanden, FREE Features erlauben
        if (!$license || !isset($license['features'])) {
            return $this->is_free_feature($feature);
        }
        
        return isset($license['features'][$feature]) && $license['features'][$feature] === true;
    }
    
    /**
     * Prüft ob ein Feature zum FREE Paket gehört
     */
    private function is_free_feature($feature) {
        $free_features = array(
            'honeypot',
            'timestampCheck',
            'javascriptCheck',
            'commentBlocker',
            'wpMailBlocker',
            'dashboardCleanup',
        );
        
        return in_array($feature, $free_features);
    }
    
    /**
     * Holt Lizenz-Daten (cached)
     */
    public function get_license_data() {
        if ($this->license_data !== null) {
            return $this->license_data;
        }
        
        // Aus Transient laden (24h Cache)
        $cached = get_transient('germanfence_license_data');
        if ($cached !== false) {
            $this->license_data = $cached;
            return $cached;
        }
        
        // Von API laden
        $this->license_data = $this->validate_license();
        return $this->license_data;
    }
    
    /**
     * Validiert Lizenz bei der API
     */
    public function validate_license($force = false) {
        $settings = get_option('germanfence_settings', array());
        $license_key = isset($settings['license_key']) ? trim($settings['license_key']) : '';
        
        // Keine Lizenz = FREE Version
        if (empty($license_key)) {
            $free_data = array(
                'valid' => true,
                'license' => array(
                    'packageType' => 'FREE',
                ),
                'features' => array(
                    'honeypot' => true,
                    'timestampCheck' => true,
                    'javascriptCheck' => true,
                    'commentBlocker' => true,
                    'wpMailBlocker' => true,
                    'dashboardCleanup' => true,
                    'honeypotAdvanced' => false,
                    'userAgentScan' => false,
                    'geoBlocking' => false,
                    'phraseBlocking' => false,
                    'typingSpeedAnalysis' => false,
                    'statistics' => false,
                    'prioritySupport' => false,
                    'whiteLabel' => false,
                ),
            );
            
            set_transient('germanfence_license_data', $free_data, DAY_IN_SECONDS);
            return $free_data;
        }
        
        // API-Anfrage
        $response = wp_remote_post($this->api_url, array(
            'timeout' => 15,
            'body' => json_encode(array(
                'licenseKey' => $license_key,
                'domain' => home_url(),
                'siteTitle' => get_bloginfo('name'),
                'wpVersion' => get_bloginfo('version'),
                'phpVersion' => phpversion(),
            )),
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
        ));
        
        if (is_wp_error($response)) {
            // Bei Fehler: Letzten gültigen Status verwenden oder FREE
            $last_valid = get_option('germanfence_last_valid_license');
            return $last_valid ? $last_valid : $this->get_free_license_data();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['valid'])) {
            return $this->get_free_license_data();
        }
        
        // Cache für 24h
        set_transient('germanfence_license_data', $data, DAY_IN_SECONDS);
        
        // Letzten gültigen Status speichern
        if ($data['valid']) {
            update_option('germanfence_last_valid_license', $data);
        }
        
        return $data;
    }
    
    /**
     * Gibt FREE Lizenz-Daten zurück
     */
    private function get_free_license_data() {
        return array(
            'valid' => true,
            'license' => array(
                'packageType' => 'FREE',
            ),
            'features' => array(
                'honeypot' => true,
                'timestampCheck' => true,
                'javascriptCheck' => true,
                'commentBlocker' => true,
                'wpMailBlocker' => true,
                'dashboardCleanup' => true,
                'honeypotAdvanced' => false,
                'userAgentScan' => false,
                'geoBlocking' => false,
                'phraseBlocking' => false,
                'typingSpeedAnalysis' => false,
                'statistics' => false,
                'prioritySupport' => false,
                'whiteLabel' => false,
            ),
        );
    }
    
    /**
     * Gibt Pakettyp zurück
     */
    public function get_package_type() {
        $license = $this->get_license_data();
        return isset($license['license']['packageType']) ? $license['license']['packageType'] : 'FREE';
    }
    
    /**
     * Prüft ob Lizenz gültig ist
     */
    public function is_valid() {
        $license = $this->get_license_data();
        return isset($license['valid']) && $license['valid'] === true;
    }
    
    /**
     * Zeigt Admin-Notice wenn Feature nicht verfügbar
     */
    public function show_upgrade_notice($feature_name) {
        $package = $this->get_package_type();
        
        if ($package === 'FREE') {
            $upgrade_url = 'https://germanfence.de/#pricing';
            echo '<div class="notice notice-info is-dismissible">';
            echo '<p><strong>🔒 ' . esc_html($feature_name) . '</strong> ist ein Premium-Feature.</p>';
            echo '<p><a href="' . esc_url($upgrade_url) . '" target="_blank" class="button button-primary">Jetzt upgraden ab 29€/Jahr</a></p>';
            echo '</div>';
        }
    }
    
    /**
     * Cache leeren (z.B. nach Lizenz-Eingabe)
     */
    public function clear_cache() {
        delete_transient('germanfence_license_data');
        $this->license_data = null;
    }
}

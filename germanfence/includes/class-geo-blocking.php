<?php
/**
 * GEO Blocking - Komplett neu, simpel, stabil
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_GeoBlocking {
    
    public function __construct() {
        // JS/CSS einbinden
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
    }
    
    /**
     * Lade JS/CSS
     */
    public function enqueue_assets($hook) {
        if ($hook !== 'toplevel_page_germanfence') {
            return;
        }
        
        wp_enqueue_script(
            'germanfence-geo',
            GERMANFENCE_PLUGIN_URL . 'assets/js/geo-blocking.js',
            array('jquery'),
            filemtime(GERMANFENCE_PLUGIN_DIR . 'assets/js/geo-blocking.js'),
            true
        );
    }
    
    /**
     * Prüft, ob das Land blockiert werden soll
     */
    public function check_country($ip) {
        // Feature-Check
        $license = GermanFence_License::get_instance();
        if (!$license->has_feature('geoBlocking')) {
            return array('valid' => true);
        }
        
        // Einstellungen laden
        $settings = get_option('germanfence_settings', array());
        
        // Wenn GEO Blocking deaktiviert ist, alles erlauben
        if (empty($settings['geo_blocking_enabled']) || $settings['geo_blocking_enabled'] !== '1') {
            return array('valid' => true);
        }
        
        // Modus holen (blacklist oder whitelist)
        $mode = isset($settings['geo_blocking_mode']) ? $settings['geo_blocking_mode'] : 'blacklist';
        
        // Länder-Liste holen
        $countries = isset($settings['blocked_countries']) ? $settings['blocked_countries'] : array();
        
        // Wenn keine Länder ausgewählt sind
        if (empty($countries)) {
            // Blacklist: alles erlauben (keine Länder blockiert)
            // Whitelist: alles blockieren (keine Länder erlaubt)
            return $mode === 'whitelist' ? array(
                'valid' => false,
                'message' => 'Anfragen aus diesem Land sind nicht erlaubt.',
                'reason' => 'Land nicht in Whitelist'
            ) : array('valid' => true);
        }
        
        // Land des Benutzers ermitteln
        $country_code = $this->get_country_from_ip($ip);
        
        // Wenn Land nicht ermittelt werden konnte, erlauben (fail-open)
        if (empty($country_code)) {
            return array('valid' => true);
        }
        
        // Prüfen basierend auf Modus
        $is_in_list = in_array($country_code, $countries);
        
        if ($mode === 'whitelist') {
            // Whitelist: Nur erlaubte Länder durchlassen
            if (!$is_in_list) {
                return array(
                    'valid' => false,
                    'message' => 'Anfragen aus diesem Land sind nicht erlaubt.',
                    'reason' => 'Land nicht in Whitelist: ' . $country_code,
                    'country' => $country_code
                );
            }
        } else {
            // Blacklist: Blockierte Länder abweisen
            if ($is_in_list) {
                return array(
                    'valid' => false,
                    'message' => 'Anfragen aus diesem Land sind nicht erlaubt.',
                    'reason' => 'Land blockiert: ' . $country_code,
                    'country' => $country_code
                );
            }
        }
        
        return array('valid' => true);
    }
    
    /**
     * Ermittelt das Land aus der IP-Adresse
     */
    private function get_country_from_ip($ip) {
        // Prüfe auf lokale IPs
        if ($this->is_local_ip($ip)) {
            return null; // Lokale IPs nicht blockieren
        }
        
        // Verwende kostenlosen ip-api.com Service (max 45 Requests/Minute)
        $api_url = 'http://ip-api.com/json/' . $ip . '?fields=countryCode';
        
        $response = wp_remote_get($api_url, array(
            'timeout' => 2,
            'sslverify' => false
        ));
        
        if (is_wp_error($response)) {
            // Bei Fehler: erlauben (fail-open)
            return null;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['countryCode']) && !empty($data['countryCode'])) {
            return strtoupper($data['countryCode']);
        }
        
        return null;
    }
    
    /**
     * Prüft ob es sich um eine lokale IP handelt
     */
    private function is_local_ip($ip) {
        if (empty($ip)) {
            return true;
        }
        
        // IPv4 private ranges
        $private_ranges = array(
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16',
            '127.0.0.0/8',
            '169.254.0.0/16',
            'localhost',
            '::1'
        );
        
        foreach ($private_ranges as $range) {
            if ($ip === $range || strpos($ip, '127.0.0.') === 0 || 
                strpos($ip, '10.') === 0 || strpos($ip, '192.168.') === 0 ||
                strpos($ip, '172.16.') === 0 || $ip === 'localhost' || $ip === '::1') {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Render GEO Tab Content
     */
    public function render_tab($settings, $license_info) {
        $is_locked = empty($license_info['is_valid']);
        ?>
        <div class="germanfence-tab-content" id="tab-geo">
            <div class="germanfence-section">
                <h2>🌍 GEO Blocking</h2>
                    
                    <!-- Toggle mit Modus-Buttons (Auto-Save) -->
                    <div style="background: #fff; padding: 25px; border: 1px solid #c3cbd5; border-radius: 6px; margin-bottom: 30px;">
                        <div class="germanfence-setting" style="border: none; padding: 0; margin: 0;">
                            <label class="germanfence-toggle <?php echo $is_locked ? 'germanfence-toggle-locked' : ''; ?>" id="geo-main-toggle">
                                <input type="checkbox" name="geo_blocking_enabled" value="1" <?php checked($settings['geo_blocking_enabled'] === '1'); ?> <?php echo $is_locked ? 'disabled' : ''; ?>>
                                <span class="toggle-slider"></span>
                                <?php if ($is_locked): ?>
                                    <span class="toggle-lock-icon">🔒</span>
                                <?php endif; ?>
                            </label>
                            <div class="setting-info">
                                <h3 style="margin: 0 0 5px 0;">GEO Blocking aktivieren</h3>
                                <p style="margin: 0 0 15px 0;">Blockiere Anfragen aus bestimmten Ländern.</p>
                                
                                <!-- Modus-Buttons (klein, inline) - IMMER SICHTBAR -->
                                <div id="geo-mode-buttons" style="display:flex; gap: 10px; margin-top: 15px; <?php echo $is_locked ? 'opacity: 0.6; pointer-events: none;' : ''; ?>">
                                    <!-- Blacklist (Ausschließlich) -->
                                    <label class="geo-mode-option <?php echo (!isset($settings['geo_blocking_mode']) || $settings['geo_blocking_mode'] === 'blacklist') ? 'active blacklist' : ''; ?>" data-mode="blacklist" style="flex: 1; padding: 10px 15px; border: 2px solid #F06292; border-radius: 6px; cursor: pointer; transition: all 0.2s; <?php echo (!isset($settings['geo_blocking_mode']) || $settings['geo_blocking_mode'] === 'blacklist') ? 'background: rgba(240, 98, 146, 0.1); box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.2);' : 'background: #f9f9f9;'; ?>">
                                        <input type="radio" name="geo_blocking_mode" value="blacklist" <?php checked(isset($settings['geo_blocking_mode']) ? $settings['geo_blocking_mode'] : 'blacklist', 'blacklist'); ?> <?php echo $is_locked ? 'disabled' : ''; ?> style="display: none;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">🚫</span>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; color: #F06292; font-size: 13px; margin-bottom: 2px;">Ausschließlich</div>
                                                <div style="color: #646970; font-size: 11px;">Ausgewählte Länder blockieren</div>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <!-- Whitelist (Einschließlich) -->
                                    <label class="geo-mode-option <?php echo (isset($settings['geo_blocking_mode']) && $settings['geo_blocking_mode'] === 'whitelist') ? 'active whitelist' : ''; ?>" data-mode="whitelist" style="flex: 1; padding: 10px 15px; border: 2px solid #22D6DD; border-radius: 6px; cursor: pointer; transition: all 0.2s; <?php echo (isset($settings['geo_blocking_mode']) && $settings['geo_blocking_mode'] === 'whitelist') ? 'background: rgba(34, 214, 221, 0.1); box-shadow: 0 0 0 2px rgba(34, 214, 221, 0.2);' : 'background: #f9f9f9;'; ?>">
                                        <input type="radio" name="geo_blocking_mode" value="whitelist" <?php checked(isset($settings['geo_blocking_mode']) ? $settings['geo_blocking_mode'] : 'blacklist', 'whitelist'); ?> <?php echo $is_locked ? 'disabled' : ''; ?> style="display: none;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">✅</span>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; color: #22D6DD; font-size: 13px; margin-bottom: 2px;">Einschließlich</div>
                                                <div style="color: #646970; font-size: 11px;">Nur ausgewählte Länder erlauben</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Länder-Auswahl (Auto-Save wie alles andere) - IMMER SICHTBAR -->
                    <div id="geo-countries-section">
                        <?php 
                        $current_mode = isset($settings['geo_blocking_mode']) ? $settings['geo_blocking_mode'] : 'blacklist';
                        $mode_color = $current_mode === 'whitelist' ? '#22D6DD' : '#F06292';
                        $mode_text = $current_mode === 'whitelist' ? 'Erlaubte Länder' : 'Blockierte Länder';
                        $mode_desc = $current_mode === 'whitelist' ? 'Nur diese Länder dürfen Formulare absenden.' : 'Diese Länder können keine Formulare absenden.';
                        ?>
                        <div id="geo-countries-wrapper" style="background: #ffffff; padding: 25px; border: 3px solid <?php echo $mode_color; ?>; border-radius: 9px; transition: border-color 0.3s;">
                            <h3 style="margin: 0 0 10px 0; color: <?php echo $mode_color; ?>;" id="geo-countries-title"><?php echo $mode_text; ?></h3>
                            <p style="color: #646970; margin: 0 0 15px 0;" id="geo-countries-desc"><?php echo $mode_desc; ?></p>
                            
                            <!-- Suchleiste -->
                            <div style="margin-bottom: 15px;">
                                <input type="text" id="country-search" placeholder="🔍 Land suchen..." style="width: 100%; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 14px;" <?php echo $is_locked ? 'disabled' : ''; ?>>
                            </div>
                            
                            <div class="country-grid" id="geo-country-grid" style="max-height: 500px; overflow-y: auto; padding: 10px; background: #fff; border: 1px solid #dcdcde; border-radius: 4px; <?php echo $is_locked ? 'opacity: 0.7;' : ''; ?>">
                                <?php
                                $countries = $this->get_country_list();
                                $blocked = $settings['blocked_countries'] ?? array();
                                foreach ($countries as $code => $name):
                                    $is_blocked = in_array($code, $blocked);
                                ?>
                                <label class="country-item <?php echo $is_blocked ? 'blocked' : ''; ?>" data-country="<?php echo esc_attr($code); ?>" data-country-name="<?php echo esc_attr(strtolower($name)); ?>">
                                    <input type="checkbox" name="blocked_countries[]" value="<?php echo esc_attr($code); ?>" <?php checked($is_blocked); ?> <?php echo $is_locked ? 'disabled' : ''; ?>>
                                    <span class="country-flag"><?php echo $this->get_flag_emoji($code); ?></span>
                                    <span class="country-code"><?php echo esc_html($code); ?></span>
                                </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        <?php
    }
    
    private function get_flag_emoji($code) {
        // Konvertiere Ländercode zu Flaggen-Bild (funktioniert auf allen Systemen)
        $code = strtoupper($code);
        if ($code === 'LOCAL') {
            return '<span style="font-size: 16px;">🏠</span>';
        }
        
        // Verwende Flagpedia CDN für zuverlässige Flaggen-Anzeige
        $code_lower = strtolower($code);
        return '<img src="https://flagcdn.com/w20/' . esc_attr($code_lower) . '.png" 
                     srcset="https://flagcdn.com/w40/' . esc_attr($code_lower) . '.png 2x" 
                     width="20" height="15" 
                     alt="' . esc_attr($code) . '" 
                     style="vertical-align: middle; border-radius: 2px; display: inline-block;">';
    }
    
    private function get_country_list() {
        return array(
            'AF' => 'Afghanistan', 'AL' => 'Albanien', 'DZ' => 'Algerien', 'AS' => 'Amerikanisch-Samoa',
            'AD' => 'Andorra', 'AO' => 'Angola', 'AI' => 'Anguilla', 'AQ' => 'Antarktis',
            'AG' => 'Antigua und Barbuda', 'AR' => 'Argentinien', 'AM' => 'Armenien', 'AW' => 'Aruba',
            'AU' => 'Australien', 'AT' => 'Österreich', 'AZ' => 'Aserbaidschan', 'BS' => 'Bahamas',
            'BH' => 'Bahrain', 'BD' => 'Bangladesch', 'BB' => 'Barbados', 'BY' => 'Belarus',
            'BE' => 'Belgien', 'BZ' => 'Belize', 'BJ' => 'Benin', 'BM' => 'Bermuda',
            'BT' => 'Bhutan', 'BO' => 'Bolivien', 'BA' => 'Bosnien und Herzegowina', 'BW' => 'Botswana',
            'BR' => 'Brasilien', 'BN' => 'Brunei', 'BG' => 'Bulgarien', 'BF' => 'Burkina Faso',
            'BI' => 'Burundi', 'KH' => 'Kambodscha', 'CM' => 'Kamerun', 'CA' => 'Kanada',
            'CV' => 'Kap Verde', 'KY' => 'Kaimaninseln', 'CF' => 'Zentralafrikanische Republik', 'TD' => 'Tschad',
            'CL' => 'Chile', 'CN' => 'China', 'CO' => 'Kolumbien', 'KM' => 'Komoren',
            'CG' => 'Kongo', 'CD' => 'Demokratische Republik Kongo', 'CR' => 'Costa Rica', 'CI' => 'Elfenbeinküste',
            'HR' => 'Kroatien', 'CU' => 'Kuba', 'CY' => 'Zypern', 'CZ' => 'Tschechien',
            'DK' => 'Dänemark', 'DJ' => 'Dschibuti', 'DM' => 'Dominica', 'DO' => 'Dominikanische Republik',
            'EC' => 'Ecuador', 'EG' => 'Ägypten', 'SV' => 'El Salvador', 'GQ' => 'Äquatorialguinea',
            'ER' => 'Eritrea', 'EE' => 'Estland', 'ET' => 'Äthiopien', 'FJ' => 'Fidschi',
            'FI' => 'Finnland', 'FR' => 'Frankreich', 'GA' => 'Gabun', 'GM' => 'Gambia',
            'GE' => 'Georgien', 'DE' => 'Deutschland', 'GH' => 'Ghana', 'GR' => 'Griechenland',
            'GD' => 'Grenada', 'GT' => 'Guatemala', 'GN' => 'Guinea', 'GW' => 'Guinea-Bissau',
            'GY' => 'Guyana', 'HT' => 'Haiti', 'HN' => 'Honduras', 'HK' => 'Hong Kong',
            'HU' => 'Ungarn', 'IS' => 'Island', 'IN' => 'Indien', 'ID' => 'Indonesien',
            'IR' => 'Iran', 'IQ' => 'Irak', 'IE' => 'Irland', 'IL' => 'Israel',
            'IT' => 'Italien', 'JM' => 'Jamaika', 'JP' => 'Japan', 'JO' => 'Jordanien',
            'KZ' => 'Kasachstan', 'KE' => 'Kenia', 'KI' => 'Kiribati', 'KP' => 'Nordkorea',
            'KR' => 'Südkorea', 'KW' => 'Kuwait', 'KG' => 'Kirgisistan', 'LA' => 'Laos',
            'LV' => 'Lettland', 'LB' => 'Libanon', 'LS' => 'Lesotho', 'LR' => 'Liberia',
            'LY' => 'Libyen', 'LI' => 'Liechtenstein', 'LT' => 'Litauen', 'LU' => 'Luxemburg',
            'MK' => 'Nordmazedonien', 'MG' => 'Madagaskar', 'MW' => 'Malawi', 'MY' => 'Malaysia',
            'MV' => 'Malediven', 'ML' => 'Mali', 'MT' => 'Malta', 'MH' => 'Marshallinseln',
            'MR' => 'Mauretanien', 'MU' => 'Mauritius', 'MX' => 'Mexiko', 'FM' => 'Mikronesien',
            'MD' => 'Moldau', 'MC' => 'Monaco', 'MN' => 'Mongolei', 'ME' => 'Montenegro',
            'MA' => 'Marokko', 'MZ' => 'Mosambik', 'MM' => 'Myanmar', 'NA' => 'Namibia',
            'NR' => 'Nauru', 'NP' => 'Nepal', 'NL' => 'Niederlande', 'NZ' => 'Neuseeland',
            'NI' => 'Nicaragua', 'NE' => 'Niger', 'NG' => 'Nigeria', 'NO' => 'Norwegen',
            'OM' => 'Oman', 'PK' => 'Pakistan', 'PW' => 'Palau', 'PS' => 'Palästina',
            'PA' => 'Panama', 'PG' => 'Papua-Neuguinea', 'PY' => 'Paraguay', 'PE' => 'Peru',
            'PH' => 'Philippinen', 'PL' => 'Polen', 'PT' => 'Portugal', 'QA' => 'Katar',
            'RO' => 'Rumänien', 'RU' => 'Russland', 'RW' => 'Ruanda', 'WS' => 'Samoa',
            'SM' => 'San Marino', 'ST' => 'São Tomé und Príncipe', 'SA' => 'Saudi-Arabien', 'SN' => 'Senegal',
            'RS' => 'Serbien', 'SC' => 'Seychellen', 'SL' => 'Sierra Leone', 'SG' => 'Singapur',
            'SK' => 'Slowakei', 'SI' => 'Slowenien', 'SB' => 'Salomonen', 'SO' => 'Somalia',
            'ZA' => 'Südafrika', 'SS' => 'Südsudan', 'ES' => 'Spanien', 'LK' => 'Sri Lanka',
            'SD' => 'Sudan', 'SR' => 'Suriname', 'SZ' => 'Eswatini', 'SE' => 'Schweden',
            'CH' => 'Schweiz', 'SY' => 'Syrien', 'TW' => 'Taiwan', 'TJ' => 'Tadschikistan',
            'TZ' => 'Tansania', 'TH' => 'Thailand', 'TL' => 'Osttimor', 'TG' => 'Togo',
            'TO' => 'Tonga', 'TT' => 'Trinidad und Tobago', 'TN' => 'Tunesien', 'TR' => 'Türkei',
            'TM' => 'Turkmenistan', 'TV' => 'Tuvalu', 'UG' => 'Uganda', 'UA' => 'Ukraine',
            'AE' => 'Vereinigte Arabische Emirate', 'GB' => 'Vereinigtes Königreich', 'US' => 'Vereinigte Staaten', 'UY' => 'Uruguay',
            'UZ' => 'Usbekistan', 'VU' => 'Vanuatu', 'VA' => 'Vatikanstadt', 'VE' => 'Venezuela',
            'VN' => 'Vietnam', 'YE' => 'Jemen', 'ZM' => 'Sambia', 'ZW' => 'Simbabwe'
        );
    }
}

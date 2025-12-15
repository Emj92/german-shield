<?php
/**
 * Admin Interface Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Admin {
    
    public function __construct() {
        // AJAX Handler für Log-Löschen
        add_action('wp_ajax_germanfence_clear_log', array($this, 'ajax_clear_log'));
        
        // AJAX Handler für History-Löschen
        add_action('wp_ajax_germanfence_clear_history', array($this, 'ajax_clear_history'));
        
        // WordPress Admin Footer entfernen (nur auf GermanFence-Seiten)
        add_action('admin_init', array($this, 'remove_admin_footer'));
    }
    
    public function remove_admin_footer() {
        // Prüfen ob wir auf einer GermanFence-Seite sind
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Checking page parameter for admin styling only
        if (isset($_GET['page']) && strpos(sanitize_text_field(wp_unslash($_GET['page'])), 'germanfence') !== false) {
            add_filter('admin_footer_text', '__return_false');
            add_filter('update_footer', '__return_false');
        }
    }
    
    public function ajax_clear_log() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        GermanFence_Logger::clear_log();
        wp_send_json_success('Log erfolgreich geleert');
    }
    
    /**
     * AJAX Handler: History löschen
     */
    public function ajax_clear_history() {
        // Nonce prüfen
        if (!isset($_POST['nonce'])) {
            wp_send_json_error(array('message' => 'Nonce fehlt'));
            return;
        }
        
        if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'germanfence_admin')) {
            wp_send_json_error(array('message' => 'Sicherheitsprüfung fehlgeschlagen'));
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Keine Berechtigung'));
            return;
        }
        
        try {
            // Lösche Datenbank-Einträge
            global $wpdb;
            $table_name = esc_sql($wpdb->prefix . 'germanfence_stats');
            
            // Verwende DELETE statt TRUNCATE
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- $table_name is escaped with esc_sql()
            $wpdb->query("DELETE FROM `{$table_name}`");
            
            // Lösche History-Datei
            $upload_dir = wp_upload_dir();
            $history_dir = $upload_dir['basedir'] . '/germanfence';
            $history_file = $history_dir . '/history.log';
            
            if (file_exists($history_file)) {
                wp_delete_file($history_file);
            }
            
            wp_send_json_success(array('message' => 'Verlauf erfolgreich gelöscht'));
        } catch (Exception $e) {
            wp_send_json_error(array('message' => 'Fehler: ' . $e->getMessage()));
        }
    }
    
    /**
     * Verbessert Blockgründe für bessere Lesbarkeit (max 5-6 Wörter)
     */
    private function format_block_reason($reason) {
        // Mapping für bessere Beschreibungen
        $mappings = array(
            // Test Mode
            'test_mode:' => '🧪 Test-Modus aktiv',
            
            // Nonce
            'nonce: Invalid nonce' => '🔒 Sicherheitsprüfung fehlgeschlagen',
            
            // Rate Limit
            'rate_limit: Rate limit exceeded' => '⏱️ Zu viele Anfragen',
            
            // Duplicate
            'duplicate: Duplicate submission detected' => '📋 Doppelte Anfrage',
            
            // Honeypot
            'honeypot: Honeypot field filled' => '🍯 Honeypot ausgelöst',
            'honeypot: Honeypot field missing' => '🍯 Schutzfeld fehlt',
            
            // Timestamp
            'timestamp: Missing timestamp' => '⏰ Zeitstempel fehlt',
            'timestamp: Future timestamp detected' => '⏰ Ungültiger Zeitstempel',
            'timestamp: Form submitted too fast' => '⏰ Formular zu schnell',
            'timestamp: Form expired' => '⏰ Formular abgelaufen',
            
            // JavaScript
            'javascript: JavaScript not enabled' => '🔒 JavaScript deaktiviert',
            'JavaScript not enabled' => '🔒 JavaScript deaktiviert',
            'javascript: Missing JS Token' => '🔒 JS-Token fehlt',
            'javascript: Invalid JS Token' => '🔒 JS-Token ungültig',
            
            // User Agent
            'user_agent: Empty user agent' => '🤖 Kein User-Agent',
            'user_agent: Bot user agent detected' => '🤖 Bot erkannt',
            'user_agent: Suspiciously short user agent' => '🤖 Verdächtiger User-Agent',
            
            // HTTP Headers
            'headers: Missing header' => '📡 Header fehlt',
            'headers: External referer' => '📡 Externer Referer',
            
            // GEO Blocking
            'geo: Land nicht in Whitelist' => '🌍 Land nicht erlaubt',
            'geo: Land blockiert' => '🌍 Land blockiert',
            
            // URL Limit
            'url_limit: URL limit exceeded' => '🔗 Zu viele URLs',
            
            // Domain Blocking
            'domain_blocked: Blocked domain detected' => '🚫 Domain blockiert',
            
            // Phrase Blocking
            'phrase: Blocked phrase detected' => '📝 Blockierte Phrase',
            
            // Typing Speed
            'typing_speed: Bot typing detected' => '⌨️ Bot-Tippgeschwindigkeit',
            'typing_speed: Perfect typing intervals detected' => '⌨️ Perfekte Intervalle'
        );
        
        // Direkte Treffer
        foreach ($mappings as $pattern => $replacement) {
            if (stripos($reason, $pattern) !== false) {
                return $replacement;
            }
        }
        
        // Spezielle Fälle mit Details (extrahiere wichtige Infos)
        
        // Phrase Blocking - zeige die blockierte Phrase
        if (preg_match('/phrase.*Blocked phrase detected: (.+)/', $reason, $matches)) {
            return '📝 Phrase: "' . substr($matches[1], 0, 15) . '"';
        }
        
        // Domain Blocking - zeige die Domain
        if (preg_match('/domain_blocked.*Blocked domain detected: ([a-z0-9.-]+)/', $reason, $matches)) {
            return '🚫 Domain: ' . $matches[1];
        }
        
        // GEO Blocking - zeige Ländercode
        if (preg_match('/geo.*Land nicht in Whitelist: ([A-Z]{2})/', $reason, $matches)) {
            return '🌍 Land ' . $matches[1] . ' blockiert';
        }
        
        if (preg_match('/geo.*Land blockiert: ([A-Z]{2})/', $reason, $matches)) {
            return '🌍 Land ' . $matches[1] . ' blockiert';
        }
        
        // User Agent - zeige Bot-Pattern
        if (preg_match('/user_agent.*Bot user agent detected: ([a-z]+)/', $reason, $matches)) {
            return '🤖 Bot: ' . $matches[1];
        }
        
        // URL Limit - zeige Anzahl
        if (preg_match('/url_limit.*exceeded: (\d+)/', $reason, $matches)) {
            return '🔗 ' . $matches[1] . ' URLs gefunden';
        }
        
        // Rate Limit - zeige Anzahl
        if (preg_match('/rate_limit.*exceeded: (\d+) submissions/', $reason, $matches)) {
            return '⏱️ ' . $matches[1] . ' Anfragen/Min';
        }
        
        // Timestamp - zeige Sekunden
        if (preg_match('/timestamp.*too fast: (\d+)s/', $reason, $matches)) {
            return '⏰ Nach ' . $matches[1] . 's abgeschickt';
        }
        
        // Fallback: Ersten 35 Zeichen
        return mb_substr($reason, 0, 35) . (mb_strlen($reason) > 35 ? '...' : '');
    }
    
    public function add_admin_menu() {
        GermanFence_Logger::log_admin('add_admin_menu() wird aufgerufen');
        
        // Hauptmenü mit eigenem Logo (nur Icon)
        $icon_url = GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence-icon.png';
        add_menu_page(
            'GermanFence',
            'GermanFence',
            'manage_options',
            'germanfence',
            array($this, 'render_admin_page'),
            $icon_url,
            76
        );
        
        // Hover-Submenü-Einträge
        add_submenu_page(
            'germanfence',
            'Dashboard',
            '📊 Dashboard',
            'manage_options',
            'germanfence',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'Anti-Spam',
            '🛡️ Anti-Spam',
            'manage_options',
            'germanfence&tab=antispam',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'GEO Blocking',
            '🌍 GEO Blocking',
            'manage_options',
            'germanfence&tab=geo',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'Phrasen',
            '🚫 Phrasen',
            'manage_options',
            'germanfence&tab=phrases',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'WordPress Spam',
            '🔕 WordPress Spam',
            'manage_options',
            'germanfence&tab=notices',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'Sicherheit',
            '🔒 Sicherheit',
            'manage_options',
            'germanfence&tab=security',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'Einstellungen',
            '⚙️ Einstellungen',
            'manage_options',
            'germanfence&tab=settings',
            array($this, 'render_admin_page')
        );
        
        // CSS für Icon-Skalierung + Hover-Menü
        add_action('admin_head', array($this, 'add_menu_icon_css'));
        
        GermanFence_Logger::log_admin('Admin-Menü erfolgreich registriert');
    }
    
    public function add_menu_icon_css() {
        ?>
        <style>
            /* GermanFence Logo im Menü skalieren */
            #adminmenu #toplevel_page_germanfence .wp-menu-image img {
                width: 17px !important;
                height: 21px !important;
                padding: 6px 0 !important;
            }
            
            /* Hover-Effekt */
            #adminmenu #toplevel_page_germanfence:hover .wp-menu-image img {
                opacity: 1 !important;
            }
            
            /* Menüpunkt normale Höhe - KEIN extra Platz */
            #adminmenu #toplevel_page_germanfence {
                margin-bottom: 0 !important;
            }
            
            /* Submenü standardmäßig versteckt */
            #adminmenu #toplevel_page_germanfence .wp-submenu {
                display: none !important;
                position: fixed !important;
                left: 160px !important;
                top: auto !important;
                background: #23282d !important;
                border-radius: 6px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                padding: 10px 0 !important;
                min-width: 200px !important;
                z-index: 99999 !important;
            }
            
            /* Hover-Menü wie Elementor - erweiterte Hover-Zone */
            #adminmenu #toplevel_page_germanfence:hover .wp-submenu,
            #adminmenu #toplevel_page_germanfence .wp-submenu:hover {
                display: block !important;
            }
            
            /* Hover-Bereich erweitern */
            #adminmenu #toplevel_page_germanfence .wp-submenu::before {
                content: '';
                position: absolute;
                left: -50px;
                top: 0;
                bottom: 0;
                width: 50px;
            }
            
            /* Submenü-Items stylen */
            #adminmenu #toplevel_page_germanfence .wp-submenu li a {
                padding: 10px 15px !important;
                color: #c3c4c7 !important;
                transition: all 0.2s ease !important;
            }
            
            #adminmenu #toplevel_page_germanfence .wp-submenu li a:hover {
                background: #22D6DD !important;
                color: #fff !important;
                padding-left: 20px !important;
            }
        </style>
        <?php
    }
    
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_germanfence') {
            return;
        }
        
        GermanFence_Logger::log_admin('enqueue_admin_assets() wird aufgerufen');
        
        wp_enqueue_style(
            'germanfence-admin',
            GERMANFENCE_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            GERMANFENCE_VERSION
        );
        
        wp_enqueue_script(
            'germanfence-admin',
            GERMANFENCE_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            GERMANFENCE_VERSION . '-' . time(), // Cache-Buster!
            true
        );
        
        wp_localize_script('germanfence-admin', 'germanfenceAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('germanfence_admin'),
            'pluginUrl' => GERMANFENCE_PLUGIN_URL,
        ));
        
        GermanFence_Logger::log_admin('Admin-Assets geladen (JS aktiviert mit Cache-Buster)');
    }
    
    public function render_admin_page() {
        GermanFence_Logger::log_admin('render_admin_page() wird aufgerufen');
        
        $saved = false;
        
        // Aktiven Tab aus URL-Parameter holen
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Tab parameter for UI display only
        $active_tab = isset($_GET['tab']) ? sanitize_text_field(wp_unslash($_GET['tab'])) : 'dashboard';

        // DEBUG: Zeige rohe POST-Daten oben (nur temporär)
        if (!empty($_POST)) {
            GermanFence_Logger::log_admin('POST-Daten empfangen', array('count' => count($_POST), 'keys' => array_keys($_POST)));
            echo '<div class="notice notice-info" style="margin: 20px 20px 0 0;"><p><strong>GermanFence Debug:</strong> POST-Daten empfangen (' . count($_POST) . ' Felder).</p></div>';
        }

        // Speichern verarbeiten
        if (isset($_POST['germanfence_save_settings'])) {
            // Nonce-Verifikation
            if (!isset($_POST['germanfence_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['germanfence_nonce'])), 'germanfence_settings')) {
                wp_die('Sicherheitsprüfung fehlgeschlagen. Bitte versuchen Sie es erneut.');
            }
            GermanFence_Logger::log_save('Save-Button wurde geklickt');
            $this->save_settings();
            $saved = true;
            GermanFence_Logger::log_save('Einstellungen wurden gespeichert');
        }
        
        $settings = get_option('germanfence_settings', array());
        GermanFence_Logger::log_admin('Einstellungen geladen', array('count' => count($settings)));
        
        $statistics = new GermanFence_Statistics();
        $stats = $statistics->get_stats();
        GermanFence_Logger::log_admin('Statistiken geladen');
        
        $form_stats = new GermanFence_FormStats();
        $detected_forms = $form_stats->get_detected_forms();
        GermanFence_Logger::log_admin('Formulare erkannt', array('total' => $detected_forms['total']));
        
        $license_manager = new GermanFence_License();
        $license_info = $license_manager->get_license_info();
        $license_status = $license_manager->check_license();
        
        // WICHTIG: Prüfe ob es eine ECHTE PRO-Lizenz ist (nicht FREE!)
        $package_type = isset($license_info['package_type']) ? $license_info['package_type'] : 'FREE';
        $is_pro_license = in_array($package_type, array('SINGLE', 'FREELANCER', 'AGENCY'));
        $is_license_valid = !empty($license_status['valid']) && $is_pro_license;

        $free_manager = new GermanFence_Free_License();
        
        // WICHTIG: Immer frisch aus DB laden, nicht cachen
        wp_cache_delete('germanfence_free_verified', 'options');
        wp_cache_delete('germanfence_free_email', 'options');
        
        $is_free_active = $free_manager->is_free_active();
        $free_email = $free_manager->get_verified_email();
        
        GermanFence_Logger::log_admin('[LICENSE-CHECK] Package: ' . $package_type . ', Free aktiv: ' . ($is_free_active ? 'JA' : 'NEIN') . ', Email: ' . $free_email . ', PRO License: ' . ($is_license_valid ? 'JA' : 'NEIN'));

        // Rechtstexte anzeigen wenn ?show=agb/datenschutz/impressum
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Show parameter for legal page display only
        if (isset($_GET['show']) && in_array(sanitize_text_field(wp_unslash($_GET['show'])), array('agb', 'datenschutz', 'impressum'), true)) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Show parameter for legal page display only
            $legal_page = sanitize_text_field(wp_unslash($_GET['show']));
            $legal_file = GERMANFENCE_PLUGIN_DIR . 'includes/legal/' . $legal_page . '.php';
            
            if (file_exists($legal_file)) {
                echo '<div class="wrap">';
                include $legal_file;
                echo '</div>';
                return; // Stoppe restliche Ausgabe
            }
        }

        ?>
        <?php if ($saved): ?>
        <div class="notice notice-success is-dismissible" style="margin: 20px 20px 0 0;">
            <p><strong>Einstellungen erfolgreich gespeichert!</strong></p>
        </div>
        <?php endif; ?>
        
        <div class="germanfence-wrapper">
            <div class="germanfence-header">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h1 style="color: #1d2327; margin: 0;">
                        <img src="<?php echo esc_url( GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence-logo.png' ); ?>" alt="GermanFence Light" class="germanfence-logo-img" style="height: 60px; width: auto; margin-right: 15px;">
                        GermanFence <span style="color: #22D6DD; font-weight: 400;">Light</span>
                        <span class="germanfence-version">v<?php echo esc_html( GERMANFENCE_VERSION ); ?></span>
                    </h1>
                    
                    <!-- Theme & Language Switcher -->
                    <div class="germanfence-header-controls" style="display: flex; gap: 15px; align-items: center;">
                        <!-- Theme Switcher -->
                        <button id="germanfence-theme-toggle" class="header-control-btn" title="Theme wechseln">
                            <span class="theme-icon-light" style="font-size: 24px;">☀️</span>
                            <span class="theme-icon-dark" style="font-size: 24px; display: none;">🌙</span>
                        </button>
                        
                        <!-- Language Switcher -->
                        <button id="germanfence-language-toggle" class="header-control-btn" title="Sprache wechseln">
                            <span class="language-flag" style="font-size: 16px; display: inline-block;">🇩🇪</span>
                            <span class="language-code" style="font-size: 15px; font-weight: 700; margin-left: 3px; display: inline-block;">EN</span>
                        </button>
                    </div>
                    
                    <?php
                    // Spruch des Tages
                    $daily_quotes = array(
                        "Der Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden.",
                        "Qualität ist kein Zufall, sie ist immer das Ergebnis angestrengten Denkens.",
                        "Wer aufhört, besser zu werden, hat aufgehört, gut zu sein.",
                        "Exzellenz ist kein Ziel, sondern eine Lebenseinstellung.",
                        "Sicherheit ist kein Produkt, sondern ein Prozess.",
                        "Perfektion ist nicht erreichbar, aber wenn wir nach ihr streben, können wir Exzellenz erreichen.",
                        "Der Unterschied zwischen Gewöhnlichem und Außergewöhnlichem ist das kleine Extra.",
                        "Investiere in Qualität. Es zahlt die besten Zinsen.",
                        "Wer Sicherheit der Freiheit vorzieht, ist zu Recht ein Sklave.",
                        "Deutsche Ingenieurskunst: Präzision trifft Leidenschaft.",
                        "Vertrauen braucht Jahre zum Aufbau, Sekunden zum Bruch und eine Ewigkeit zur Reparatur.",
                        "Was wir heute tun, entscheidet darüber, wie die Welt morgen aussieht.",
                        "Qualität bedeutet, es richtig zu machen, auch wenn niemand zusieht.",
                        "Sicherheit ist der Grundstein digitaler Freiheit.",
                        "Innovation entsteht dort, wo Mut auf Qualität trifft.",
                        "Wer nichts verändern will, wird auch das verlieren, was er bewahren möchte.",
                        "Perfektion ist keine Kleinigkeit, aber Kleinigkeiten machen Perfektion aus.",
                        "Deutsche Qualität: Ein Versprechen, das wir täglich einlösen.",
                        "Schutz ist nicht teuer – es ist unbezahlbar.",
                        "Wer die Sicherheit vernachlässigt, öffnet dem Chaos die Tür.",
                    );
                    
                    // Täglicher Index basierend auf Datum
                    $day_of_year = gmdate('z');
                    $quote_index = $day_of_year % count($daily_quotes);
                    $todays_quote = $daily_quotes[$quote_index];
                    ?>
                    
                    <div class="germanfence-quote-of-day">
                        <div style="font-size: 15px; color: #22D6DD; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 5px; text-transform: uppercase;">
                            💡 Spruch des Tages
                        </div>
                        <div style="font-size: 15px; color: #1d2327; font-style: italic; line-height: 1.4;">
                            "<?php echo esc_html($todays_quote); ?>"
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="germanfence-tabs">
                <button class="germanfence-tab <?php echo $active_tab === 'dashboard' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>" data-tab="dashboard" <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>>
                    📊 Dashboard
                    <?php if (!$is_free_active && !$is_license_valid): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'antispam' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>" data-tab="antispam" <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>>
                    🛡️ Formular-Schutz
                    <?php if (!$is_free_active && !$is_license_valid): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'geo' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>" data-tab="geo" <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>>
                    🌍 Geo & Content-Filter
                    <?php if (!$is_license_valid): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'notices' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>" data-tab="notices" <?php echo (!$is_free_active && !$is_license_valid) ? 'disabled' : ''; ?>>
                    💬 WP-Optimierung
                    <?php if (!$is_free_active && !$is_license_valid): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'security' ? 'active' : ''; ?> <?php echo (!$is_license_valid) ? 'disabled' : ''; ?>" data-tab="security" <?php echo (!$is_license_valid) ? 'disabled' : ''; ?>>
                    🔥 Sicherheit & Firewall
                    <?php if (!$is_license_valid): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'settings' ? 'active' : ''; ?>" data-tab="settings">
                    ⚙️ Einstellungen
                </button>
            </div>
            
            <form method="post" action="<?php echo esc_url(admin_url('admin.php?page=germanfence')); ?>">
                <?php wp_nonce_field('germanfence_settings', 'germanfence_nonce'); ?>
                
                <!-- Dashboard Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'dashboard' ? 'active' : ''; ?>" id="tab-dashboard">
                    
                    <?php if (!$is_free_active && !$is_license_valid): ?>
                        <div style="background: linear-gradient(135deg, rgba(216, 27, 96, 0.1) 0%, rgba(216, 27, 96, 0.05) 100%); padding: 40px; border-radius: 9px; border: 2px solid #D81B60; text-align: center; margin: 20px 0;">
                            <span style="font-size: 64px;">🔒</span>
                            <h2 style="margin: 20px 0 10px 0; color: #D81B60;">Plugin nicht aktiviert</h2>
                            <p style="margin: 0 0 25px 0; color: #1d2327; font-size: 15px;">
                                Bitte verifiziere deine E-Mail oder aktiviere einen API-Key, um GermanFence zu nutzen.
                            </p>
                            <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&tab=settings') ); ?>" 
                               style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #D81B60; color: #ffffff; text-decoration: none; border-radius: 9px; font-weight: 600; font-size: 15px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(216, 27, 96, 0.2);">
                                <span class="dashicons dashicons-admin-network" style="font-size: 20px;"></span>
                                Zur API-Key Verwaltung →
                            </a>
                        </div>
                    <?php else: ?>
                    
                    <div class="germanfence-stats-grid">
                        <div class="germanfence-stat-card">
                            <div class="stat-icon blocked">
                                <span class="dashicons dashicons-dismiss"></span>
                            </div>
                            <div class="stat-content">
                                <h3><?php echo number_format($stats['total_blocked']); ?></h3>
                                <p>Blockierte Anfragen</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-stat-card">
                            <div class="stat-icon legitimate">
                                <span class="dashicons dashicons-yes-alt"></span>
                            </div>
                            <div class="stat-content">
                                <h3><?php echo number_format($stats['total_legitimate']); ?></h3>
                                <p>Legitime Anfragen</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-stat-card">
                            <div class="stat-icon rate">
                                <span class="dashicons dashicons-chart-line"></span>
                            </div>
                            <div class="stat-content">
                                <h3><?php echo esc_html( $stats['block_rate'] ); ?>%</h3>
                                <p>Block-Rate</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-stat-card">
                            <div class="stat-icon today">
                                <span class="dashicons dashicons-calendar-alt"></span>
                            </div>
                            <div class="stat-content">
                                <h3><?php echo number_format($stats['today_blocked']); ?></h3>
                                <p>Heute blockiert</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-stat-card">
                            <div class="stat-icon forms">
                                <span class="dashicons dashicons-feedback"></span>
                            </div>
                            <div class="stat-content">
                                <h3><?php echo number_format($detected_forms['total']); ?></h3>
                                <p>Geschützte Formulare</p>
                    </div>
                        </div>
                    </div>
                    
                    <div class="germanfence-recent-blocks">
                        <?php 
                        // Zähle Anfragen für Filter-Buttons
                        $total_requests = count($stats['recent_all']);
                        $blocked_count = 0;
                        $legitimate_count = 0;
                        foreach ($stats['recent_all'] as $entry) {
                            if ($entry->type === 'blocked') {
                                $blocked_count++;
                            } else {
                                $legitimate_count++;
                            }
                        }
                        ?>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h2 style="margin: 0;">Letzte Anfragen <span style="color: #646970; font-size: 16px; font-weight: 500;">(<?php echo esc_html( $total_requests ); ?> Einträge)</span></h2>
                            
                            <!-- Filter Buttons -->
                            <div class="stats-filter-buttons" style="display: flex; gap: 10px;">
                                <button type="button" class="stats-filter-btn active" data-filter="all" style="padding: 8px 16px; border: 2px solid #22D6DD; background: #22D6DD; color: #fff; border-radius: 9px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    📊 Alle (<?php echo esc_html( $total_requests ); ?>)
                                </button>
                                <button type="button" class="stats-filter-btn" data-filter="blocked" style="padding: 8px 16px; border: 2px solid #F06292; background: transparent; color: #F06292; border-radius: 9px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    🚫 Geblockt (<?php echo esc_html( $blocked_count ); ?>)
                                </button>
                                <button type="button" class="stats-filter-btn" data-filter="legitimate" style="padding: 8px 16px; border: 2px solid #22D6DD; background: transparent; color: #22D6DD; border-radius: 9px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    ✅ Legitim (<?php echo esc_html( $legitimate_count ); ?>)
                                </button>
                                <button type="button" id="clear-history-btn" style="padding: 8px 16px; border: none; background: #D81B60; color: #ffffff; border-radius: 9px; font-weight: 600; font-size: 15px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(216, 27, 96, 0.2); margin-left: auto; display: inline-flex; align-items: center; gap: 6px;">
                                    <span class="dashicons dashicons-trash" style="font-size: 15px;"></span>
                                    Verlauf löschen
                                </button>
                            </div>
                        </div>
                        
                        <div style="max-height: 500px; overflow-y: auto; border: 1px solid #dcdcde; border-radius: 9px;">
                        <table class="germanfence-table">
                                <thead style="position: sticky; top: 0; background: #F2F5F8; z-index: 1;">
                                <tr>
                                    <th>Zeit</th>
                                        <th>Status</th>
                                    <th>IP-Adresse</th>
                                    <th>Land</th>
                                        <th>Details</th>
                                        <th>Aktion</th>
                                </tr>
                            </thead>
                                <tbody id="stats-table-body">
                                    <?php foreach ($stats['recent_all'] as $entry): ?>
                                    <tr class="stats-row" data-type="<?php echo esc_attr($entry->type); ?>" data-id="<?php echo esc_attr($entry->id); ?>" data-reason="<?php echo esc_attr($entry->reason ?? '-'); ?>" data-form-data="<?php echo esc_attr($entry->form_data ?? ''); ?>">
                                        <td><?php echo esc_html( gmdate('d.m.Y H:i', strtotime($entry->created_at)) ); ?></td>
                                        <td>
                                            <?php if ($entry->type === 'blocked'): ?>
                                                <span class="block-type-badge blocked" style="background: rgba(240, 98, 146, 0.1); color: #F06292; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 15px;">🚫 GEBLOCKT</span>
                                            <?php else: ?>
                                                <span class="block-type-badge legitimate" style="background: rgba(34, 214, 221, 0.1); color: #22D6DD; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 15px;">✅ LEGITIM</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php echo esc_html($entry->ip_address); ?></td>
                                        <td>
                                            <?php if ($entry->country): ?>
                                                <span style="font-size: 18px; margin-right: 5px;"><?php echo esc_html( $this->get_flag_emoji($entry->country) ); ?></span>
                                                <span><?php echo esc_html($entry->country); ?></span>
                                            <?php else: ?>
                                                <span style="color: #999;">-</span>
                                            <?php endif; ?>
                                        </td>
                                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            <?php echo esc_html($this->format_block_reason($entry->reason ?? '-')); ?>
                                        </td>
                                        <td>
                                            <button type="button" class="view-details-btn" data-id="<?php echo esc_attr($entry->id); ?>" style="padding: 6px 12px; background: #22D6DD; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 15px;">
                                                👁️ Details
                                            </button>
                                        </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- Anti-Spam Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'antispam' ? 'active' : ''; ?>" id="tab-antispam">
                    <?php if (!$is_free_active && !$is_license_valid): ?>
                        <div style="background: linear-gradient(135deg, rgba(216, 27, 96, 0.1) 0%, rgba(216, 27, 96, 0.05) 100%); padding: 40px; border-radius: 9px; border: 2px solid #D81B60; text-align: center; margin: 20px;">
                            <span style="font-size: 64px;">🔒</span>
                            <h2 style="margin: 20px 0 10px 0; color: #D81B60;">Plugin nicht aktiviert</h2>
                            <p style="margin: 0 0 25px 0; color: #1d2327; font-size: 15px;">
                                Bitte verifiziere deine E-Mail oder aktiviere einen API-Key, um GermanFence zu nutzen.
                            </p>
                            <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&tab=settings') ); ?>" 
                               style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #D81B60; color: #ffffff; text-decoration: none; border-radius: 9px; font-weight: 600; font-size: 15px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(216, 27, 96, 0.2);">
                                <span class="dashicons dashicons-admin-network" style="font-size: 20px;"></span>
                                Zur API-Key Verwaltung →
                            </a>
                        </div>
                    <?php else: ?>
                    
                    <!-- SEKTION 1: Honeypot & Basisschutz -->
                    <div class="germanfence-section">
                        <h2>🍯 Honeypot & Basisschutz</h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Unsichtbare Felder + grundlegende Schutz-Mechanismen gegen automatisierte Bots.
                        </p>
                        
                        <div class="germanfence-settings-grid">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="honeypot_enabled" value="1" <?php checked($settings['honeypot_enabled'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Honeypot aktivieren</h3>
                                    <p>Unsichtbares Feld, das nur Bots ausfüllen. Sehr effektiv und benutzerfreundlich.</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="basic_protection_enabled" value="1" <?php checked(isset($settings['basic_protection_enabled']) && $settings['basic_protection_enabled'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Basis-Schutz aktivieren</h3>
                                    <p>Rate-Limiting, Duplikat-Check, HTTP-Header, JavaScript-Prüfung und User-Agent-Erkennung (alle 5 auf einmal).</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Honeypot-Einstellungen -->
                        <div class="germanfence-subsetting" id="honeypot-settings" style="<?php echo $settings['honeypot_enabled'] !== '1' ? 'display:none;' : ''; ?> margin-top: 20px;">
                            <h3 style="margin-bottom: 20px;">Honeypot-Verwaltung</h3>
                            
                            <div class="setting-row" style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 10px;"><strong>Anzahl aktiver Honeypots:</strong></label>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <input 
                                        type="range" 
                                        name="honeypot_count" 
                                        id="honeypot-count-slider"
                                        min="1" 
                                        max="10" 
                                        value="<?php echo esc_attr($settings['honeypot_count'] ?? 3); ?>"
                                        style="flex: 1; max-width: 300px;"
                                    >
                                    <span id="honeypot-count-value" style="font-size: 18px; font-weight: 600; color: #22D6DD; min-width: 50px;">
                                        <?php echo esc_html($settings['honeypot_count'] ?? 3); ?>
                                    </span>
                                </div>
                                <p class="description" style="margin-top: 5px;">
                                    Mehr Honeypots = besserer Schutz, aber minimal höherer Performance-Impact
                                </p>
                            </div>
                            
                            <div class="setting-row">
                                <label style="display: block; margin-bottom: 15px;"><strong>Honeypot-Feldnamen:</strong></label>
                                <div id="honeypot-fields-list">
                                    <?php 
                                    $honeypot_fields = $settings['honeypot_fields'] ?? array();
                                    $honeypot_count = intval($settings['honeypot_count'] ?? 3);
                                    
                                    if (empty($honeypot_fields) || count($honeypot_fields) < $honeypot_count) {
                                        $default_names = array(
                                            'website_url', 'homepage_link', 'user_website', 'site_url',
                                            'contact_url', 'company_site', 'web_address', 'url_field',
                                            'business_url', 'personal_site'
                                        );
                                        $honeypot_fields = array();
                                        for ($i = 0; $i < $honeypot_count; $i++) {
                                            $base_name = $default_names[$i % count($default_names)];
                                            $honeypot_fields[] = $base_name . '_' . substr(md5(time() . $i), 0, 6);
                                        }
                                    }
                                    
                                    $honeypot_fields = array_slice($honeypot_fields, 0, $honeypot_count);
                                    
                                    foreach ($honeypot_fields as $index => $field_name): 
                                    ?>
                                    <div class="honeypot-field-item" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #ffffff; border: 1px solid #d9dde1; border-radius: 9px; margin-bottom: 10px;">
                                        <span style="min-width: 30px; font-weight: 600; color: #646970;">#<?php echo esc_html( $index + 1 ); ?></span>
                                        <input 
                                            type="text" 
                                            name="honeypot_fields[]" 
                                            value="<?php echo esc_attr($field_name); ?>"
                                            style="flex: 1; padding: 8px 12px; border: 1px solid #d9dde1; border-radius: 9px; font-family: monospace; background: #ffffff;"
                                            placeholder="feldname"
                                        >
                                        <button 
                                            type="button" 
                                            class="regenerate-honeypot-btn"
                                            data-index="<?php echo esc_attr( $index ); ?>"
                                            style="padding: 8px 12px; background: #22D6DD; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;"
                                            title="Neu generieren"
                                        >
                                            <span class="dashicons dashicons-update"></span>
                                        </button>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                                <p class="description" style="margin-top: 10px; max-width: 700px;">
                                    💡 <strong>Tipp:</strong> Benutze realistische Feldnamen wie "website_url" oder "contact_link". 
                                    Das <span class="dashicons dashicons-update" style="font-size: 15px;"></span> Symbol generiert einen neuen zufälligen Namen.
                                </p>
                            </div>
                            </div>
                        </div>
                        
                    <!-- SEKTION 2: Timestamp & Tippgeschwindigkeit -->
                    <div class="germanfence-section">
                        <h2>⏱️ Zeit-basierte Prüfungen</h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Analyse von Ausfüllzeit und Tippgeschwindigkeit zur Bot-Erkennung.
                        </p>
                        
                        <div class="germanfence-settings-grid">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="timestamp_enabled" value="1" <?php checked($settings['timestamp_enabled'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Timestamp-Prüfung</h3>
                                    <p>Blockiert Formulare, die zu schnell oder zu langsam ausgefüllt werden.</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="typing_speed_check" value="1" <?php checked(isset($settings['typing_speed_check']) && $settings['typing_speed_check'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Tippgeschwindigkeit-Analyse</h3>
                                    <p>Erkennt unnatürlich schnelle Bot-Eingaben durch Timing-Analyse.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Timestamp-Einstellungen -->
                        <div class="germanfence-subsetting" id="timestamp-settings" style="<?php echo $settings['timestamp_enabled'] !== '1' ? 'display:none;' : ''; ?> margin-top: 20px;">
                            <h3 style="margin-bottom: 20px;">Timestamp-Einstellungen</h3>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 10px;"><strong>Minimale Ausfüllzeit (Sekunden):</strong></label>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <input 
                                        type="number" 
                                        name="timestamp_min"
                                        min="1" 
                                        max="60" 
                                        value="<?php echo esc_attr($settings['timestamp_min'] ?? 3); ?>"
                                        style="width: 100px; padding: 10px; border: 1px solid #c3cbd5; border-radius: 9px; font-size: 15px;"
                                    >
                                    <span style="color: #646970;">Sekunden</span>
                                </div>
                                <p class="description" style="margin-top: 5px;">
                                    Formulare, die schneller ausgefüllt werden, werden blockiert. Empfohlen: 3-5 Sekunden
                                </p>
                            </div>
                            
                            <div class="setting-row">
                                <label style="display: block; margin-bottom: 10px;"><strong>Maximale Formular-Gültigkeit (Sekunden):</strong></label>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <input 
                                        type="number" 
                                        name="timestamp_max"
                                        min="60" 
                                        max="86400" 
                                        value="<?php echo esc_attr($settings['timestamp_max'] ?? 3600); ?>"
                                        style="width: 100px; padding: 10px; border: 1px solid #c3cbd5; border-radius: 9px; font-size: 15px;"
                                    >
                                    <span style="color: #646970;">Sekunden (<?php echo esc_html(round(($settings['timestamp_max'] ?? 3600) / 60)); ?> Min)</span>
                                </div>
                                <p class="description" style="margin-top: 5px;">
                                    Formulare, die nach dieser Zeit abgesendet werden, sind ungültig. Empfohlen: 3600 (1 Stunde)
                                </p>
                            </div>
                            </div>
                        </div>
                        
                    <!-- SEKTION 4: URL & Domain-Schutz -->
                    <div class="germanfence-section">
                        <h2>🔗 URL & Domain-Schutz</h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Schutz vor SEO-Spam durch Link-Limits und Blockierung verdächtiger Domain-Endungen.
                        </p>
                        
                        <div class="germanfence-settings-grid">
                            <!-- URL-Limit -->
                            <div style="border: none; padding: 0;">
                                <div class="germanfence-setting" style="border: none; padding: 0; margin-bottom: 20px;">
                                    <label class="germanfence-toggle">
                                        <input type="checkbox" name="url_limit_enabled" value="1" <?php checked(isset($settings['url_limit_enabled']) && $settings['url_limit_enabled'] === '1'); ?>>
                                        <span class="toggle-slider"></span>
                                    </label>
                                    <div class="setting-info">
                                        <h3>URL-Limit aktivieren</h3>
                                        <p>Blockiert Nachrichten mit zu vielen Links (effektiv gegen SEO-Spam)</p>
                                    </div>
                                </div>
                                    
                                <div id="url-limit-settings" style="<?php echo (isset($settings['url_limit_enabled']) && $settings['url_limit_enabled'] === '1') ? '' : 'display:none;'; ?>">
                                    <label style="display: block; margin-bottom: 10px;"><strong>Maximale Anzahl URLs:</strong></label>
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <input 
                                            type="range" 
                                            name="url_limit_max" 
                                            id="url-limit-slider"
                                            min="0" 
                                            max="5" 
                                            value="<?php echo esc_attr($settings['url_limit_max'] ?? 1); ?>"
                                            style="flex: 1; max-width: 200px;"
                                        >
                                        <span id="url-limit-value" style="font-size: 18px; font-weight: 600; color: #22D6DD; min-width: 50px;">
                                            <?php echo esc_html($settings['url_limit_max'] ?? 1); ?>
                                        </span>
                                    </div>
                                    <p class="description" style="margin-top: 5px;">
                                        Nachrichten mit mehr URLs werden blockiert. 0 = keine URLs erlaubt, 1-2 empfohlen
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Domain-Blocking -->
                            <div style="border: none; padding: 0;">
                                <div class="germanfence-setting" style="border: none; padding: 0; margin-bottom: 20px;">
                                    <label class="germanfence-toggle">
                                        <input type="checkbox" name="domain_blocking_enabled" value="1" <?php checked(isset($settings['domain_blocking_enabled']) && $settings['domain_blocking_enabled'] === '1'); ?>>
                                        <span class="toggle-slider"></span>
                                    </label>
                                    <div class="setting-info">
                                        <h3>Domain-Blocking aktivieren</h3>
                                        <p>Blockiert URLs mit bestimmten Domain-Endungen (effektiv gegen Spam-Domains)</p>
                                    </div>
                                </div>
                                    
                                <div id="domain-blocking-settings" style="<?php echo (isset($settings['domain_blocking_enabled']) && $settings['domain_blocking_enabled'] === '1') ? '' : 'display:none;'; ?>">
                                    <label style="display: block; margin-bottom: 10px;"><strong>Blockierte Domain-Endungen:</strong></label>
                                    <textarea 
                                        name="blocked_domains" 
                                        placeholder=".xyz, .top, .click, .loan"
                                        style="width: 100%; height: 120px; padding: 12px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px; font-family: monospace; resize: vertical;"
                                    ><?php echo esc_textarea($settings['blocked_domains'] ?? '.xyz, .top, .click, .loan, .gq, .ml, .cf, .tk, .ga'); ?></textarea>
                                    <p class="description" style="margin-top: 5px;">
                                        Komma-getrennte Liste (z.B. .xyz, .top). URLs mit diesen Endungen werden geblockt.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SEKTION 5: Kommentarschutz & Test-Modus -->
                    <div class="germanfence-section">
                        <h2>💬 Kommentarschutz & Test-Modus</h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Optionaler Kommentar-Bot-Schutz und Test-Modus für Debugging.
                        </p>
                        
                        <div class="germanfence-settings-grid">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="block_comment_bots" value="1" <?php checked(isset($settings['block_comment_bots']) && $settings['block_comment_bots'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Kommentar-Bots blockieren</h3>
                                    <p>Blockiert automatisierte Bot-Kommentare durch erweiterte Anti-Spam-Prüfungen.</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting" style="border: 2px solid #F06292; background: rgba(240, 98, 146, 0.05); padding: 20px; border-radius: 9px;">
                            <label class="germanfence-toggle">
                                <input type="checkbox" name="test_mode_block_all" value="1" <?php checked(isset($settings['test_mode_block_all']) && $settings['test_mode_block_all'] === '1'); ?>>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="setting-info">
                                    <h3 style="color: #F06292;">🧪 Test-Modus</h3>
                                    <p style="color: #1d2327;">
                                        <strong style="color: #F06292;">⚠️ NUR FÜR TESTS:</strong> Blockiert ALLE Formular-Submissions (auch echte Benutzer).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- GEO Blocking Tab (NEU: Separates System) -->
                <?php
                $geo = new GermanFence_GeoBlocking();
                $geo->render_tab($settings, $license_info, $is_license_valid);
                ?>
                
                <!-- Phrase Blocking Tab REMOVED - Now integrated in Geo Tab -->
                
                <!-- WordPress Spam Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'notices' ? 'active' : ''; ?>" id="tab-notices">
                    <div class="germanfence-section">
                        <h2>🔕 WordPress Spam blockieren</h2>
                        <p class="description" style="margin-bottom: 20px; font-size: 15px;">
                            Blockiere nervige Update-Hinweise, Plugin-Werbung und andere Admin-Benachrichtigungen für ein sauberes Dashboard.
                        </p>
                        
                        <div class="germanfence-settings-grid">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="block_admin_notices" value="1" <?php checked(isset($settings['block_admin_notices']) && $settings['block_admin_notices'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Alle Admin-Benachrichtigungen blockieren</h3>
                                    <p>Versteckt alle WordPress Admin-Notices (außer kritische Fehler).</p>
                            </div>
                            </div>
                        
                        <div class="germanfence-setting">
                            <label class="germanfence-toggle">
                                    <input type="checkbox" name="block_plugin_ads" value="1" <?php checked(isset($settings['block_plugin_ads']) && $settings['block_plugin_ads'] === '1'); ?>>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="setting-info">
                                    <h3>Plugin-Werbung blockieren</h3>
                                    <p>Blockiert Upgrade-Hinweise und Werbung von Plugins (z.B. "Jetzt Premium kaufen").</p>
                            </div>
                        </div>
                        
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="block_update_notices" value="1" <?php checked(isset($settings['block_update_notices']) && $settings['block_update_notices'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Update-Benachrichtigungen blockieren</h3>
                                    <p>Versteckt "Neue Version verfügbar" Hinweise (Updates bleiben weiterhin möglich).</p>
                            </div>
                        </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="block_review_requests" value="1" <?php checked(isset($settings['block_review_requests']) && $settings['block_review_requests'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Bewertungs-Anfragen blockieren</h3>
                                    <p>Blockiert "Bitte bewerten Sie dieses Plugin" Popups.</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="block_wp_update_emails" value="1" <?php checked(isset($settings['block_wp_update_emails']) && $settings['block_wp_update_emails'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>WordPress Update-E-Mails blockieren</h3>
                                    <p>Blockiert automatische E-Mail-Benachrichtigungen über verfügbare Plugin-, Theme- und Core-Updates. Updates bleiben weiterhin möglich, nur die E-Mails werden unterdrückt.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="padding: 20px 0; margin-top: 20px;">
                            <h3 style="margin-top: 0; color: #22D6DD;">⚠️ Hinweis</h3>
                            <p style="color: #50575e; margin: 0; font-size: 15px;">
                                Kritische Sicherheits- und Fehler-Meldungen werden NICHT blockiert, um die Sicherheit deiner Website zu gewährleisten.
                            </p>
                        </div>
                    </div>
                </div>
                <!-- Debug Log Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'debug' ? 'active' : ''; ?>" id="tab-debug">
                    <div class="germanfence-section">
                        <h2>🔍 Debug Log - Ausführliche Fehlersuche</h2>
                        
                        <div style="background: #d1ecf1; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #0c5460;">
                            <h3 style="margin-top: 0; color: #0c5460;">📋 Vollständiges Debug-Log</h3>
                            <p style="color: #0c5460;">Hier siehst du ALLE Aktionen des Plugins in Echtzeit:</p>
                            <pre style="background: #ffffff; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 15px; max-height: 500px; font-family: 'Courier New', monospace;"><?php 
                                echo esc_html(GermanFence_Logger::get_log()); 
                            ?></pre>
                            <button type="button" class="germanfence-btn-danger" id="clear-debug-log" style="margin-top: 10px;">
                                        <span class="dashicons dashicons-trash"></span>
                                Debug-Log leeren
                                    </button>
                                </div>
                        
                        <div style="background: #F2F5F8; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                            <h3 style="margin-top: 0;">Aktueller Status</h3>
                            
                            <table class="germanfence-table">
                                <tr>
                                    <td><strong>POST-Daten empfangen:</strong></td>
                                    <td><?php echo !empty($_POST) ? '✅ JA (' . count($_POST) . ' Felder)' : '❌ NEIN'; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Save-Button geklickt:</strong></td>
                                    <td><?php echo isset($_POST['germanfence_save_settings']) ? '✅ JA' : '❌ NEIN'; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Nonce vorhanden:</strong></td>
                                    <td><?php echo isset($_POST['germanfence_nonce']) ? '✅ JA' : '❌ NEIN'; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Nonce gültig:</strong></td>
                                    <td><?php 
                                        // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Debug output only, nonce verified above
                                        if (isset($_POST['germanfence_nonce'])) {
                                            // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Debug output only, nonce verified above
                                            echo wp_verify_nonce($_POST['germanfence_nonce'], 'germanfence_settings') ? '✅ JA' : '❌ NEIN (FEHLER!)';
                                        } else {
                                            echo '⚠️ Nicht geprüft';
                                        }
                                    ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Gespeichert:</strong></td>
                                    <td><?php echo $saved ? '✅ JA' : '❌ NEIN'; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Aktuelle Einstellungen:</strong></td>
                                    <td><?php echo count($settings); ?> Einträge</td>
                                </tr>
                            </table>
                        </div>
                        
                        <?php if (!empty($_POST)): ?>
                        <div style="background: rgba(34, 214, 221, 0.1); padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #22D6DD;">
                            <h3 style="margin-top: 0;">📝 Empfangene POST-Daten</h3>
                            <p style="color: #646970;">Debug-Information wurde entfernt.</p>
                        </div>
                        <?php endif; ?>
                        
                        <div style="background: #F2F5F8; padding: 20px; border-radius: 9px; margin-bottom: 20px; border: 1px solid #c3cbd5;">
                            <h3 style="margin-top: 0; color: #1d2327;">💾 Gespeicherte Einstellungen</h3>
                            <p style="color: #646970;">Debug-Information wurde entfernt.</p>
                        </div>
                        
                        <div style="background: #F2F5F8; padding: 20px; border-radius: 9px; border: 1px solid #c3cbd5;">
                            <h3 style="margin-top: 0;">🔧 System-Info</h3>
                            <table class="germanfence-table">
                                <tr>
                                    <td><strong>WordPress Version:</strong></td>
                                    <td><?php echo esc_html( get_bloginfo('version') ); ?></td>
                                        </tr>
                                        <tr>
                                    <td><strong>PHP Version:</strong></td>
                                    <td><?php echo PHP_VERSION; ?></td>
                                        </tr>
                                        <tr>
                                    <td><strong>Plugin Version:</strong></td>
                                    <td><?php echo esc_html( GERMANFENCE_VERSION ); ?></td>
                                        </tr>
                                        <tr>
                                    <td><strong>Admin URL:</strong></td>
                                    <td><?php echo esc_url( admin_url('admin.php?page=germanfence') ); ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Form Action:</strong></td>
                                    <td><?php echo esc_url(admin_url('admin.php?page=germanfence')); ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Current User Can:</strong></td>
                                    <td><?php echo current_user_can('manage_options') ? '✅ manage_options' : '❌ KEINE RECHTE!'; ?></td>
                                        </tr>
                                    </table>
                                </div>
                        
                        <?php if ($saved): ?>
                        <div style="background: rgba(34, 214, 221, 0.1); padding: 20px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #22D6DD;">
                            <h3 style="margin-top: 0; color: #22D6DD;">✅ Letztes Speichern erfolgreich!</h3>
                            <p style="margin: 0; color: #50575e;">Zeitpunkt: <?php echo esc_html( current_time('d.m.Y H:i:s') ); ?></p>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Sicherheit Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'security' ? 'active' : ''; ?>" id="tab-security">
                    
                    <?php 
                    // Security Tab: PRO-only - zeige Teaser wenn nicht lizenziert
                    $security_locked = !$is_license_valid;
                    $security_disabled = $security_locked ? 'disabled' : '';
                    ?>
                    
                    
                    <!-- WORDPRESS FIREWALL Section -->
                    <div class="germanfence-section" style="<?php echo $security_locked ? 'opacity: 0.7;' : ''; ?>">
                        <h2>🛡️ WordPress Firewall <?php if ($security_locked): ?><span style="color: #D81B60; font-size: 14px;">🔒</span><?php endif; ?></h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Schütze deine WordPress-Installation mit zusätzlichen Firewall-Regeln.
                        </p>
                        
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle <?php echo $security_locked ? 'germanfence-toggle-locked' : ''; ?>">
                                <input type="checkbox" name="block_xmlrpc" value="1" <?php checked(isset($settings['block_xmlrpc']) && $settings['block_xmlrpc'] === '1'); ?> <?php echo esc_attr( $security_disabled ); ?>>
                                    <span class="toggle-slider"></span>
                                    <?php if ($security_locked): ?><span class="toggle-lock-icon">🔒</span><?php endif; ?>
                                </label>
                                <div class="setting-info">
                                <h3>XML-RPC deaktivieren</h3>
                                <p>Blockiert XML-RPC Zugriffe (häufig für Brute-Force-Attacken missbraucht)</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle <?php echo $security_locked ? 'germanfence-toggle-locked' : ''; ?>">
                                <input type="checkbox" name="disable_file_editing" value="1" <?php checked(isset($settings['disable_file_editing']) && $settings['disable_file_editing'] === '1'); ?> <?php echo esc_attr( $security_disabled ); ?>>
                                    <span class="toggle-slider"></span>
                                    <?php if ($security_locked): ?><span class="toggle-lock-icon">🔒</span><?php endif; ?>
                                </label>
                                <div class="setting-info">
                                <h3>Datei-Editor deaktivieren</h3>
                                <p>Verhindert das Bearbeiten von Theme- und Plugin-Dateien im WordPress-Admin</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle <?php echo $security_locked ? 'germanfence-toggle-locked' : ''; ?>">
                                <input type="checkbox" name="hide_wp_version" value="1" <?php checked(isset($settings['hide_wp_version']) && $settings['hide_wp_version'] === '1'); ?> <?php echo esc_attr( $security_disabled ); ?>>
                                    <span class="toggle-slider"></span>
                                    <?php if ($security_locked): ?><span class="toggle-lock-icon">🔒</span><?php endif; ?>
                                </label>
                                <div class="setting-info">
                                <h3>WordPress-Version verstecken</h3>
                                <p>Entfernt die WordPress-Version aus dem HTML-Head</p>
                            </div>
                        </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle <?php echo $security_locked ? 'germanfence-toggle-locked' : ''; ?>">
                                <input type="checkbox" name="disable_rest_api_users" value="1" <?php checked(isset($settings['disable_rest_api_users']) && $settings['disable_rest_api_users'] === '1'); ?> <?php echo esc_attr( $security_disabled ); ?>>
                                    <span class="toggle-slider"></span>
                                    <?php if ($security_locked): ?><span class="toggle-lock-icon">🔒</span><?php endif; ?>
                                </label>
                                <div class="setting-info">
                                <h3>REST API User-Enumeration blockieren</h3>
                                <p>Verhindert das Auslesen von Benutzernamen über die REST API</p>
                            </div>
                                </div>
                            </div>
                    
                    <!-- BRUTE-FORCE SCHUTZ Section -->
                    <div class="germanfence-section" style="<?php echo $security_locked ? 'opacity: 0.7;' : ''; ?>">
                        <h2>🔐 Brute-Force Schutz <?php if ($security_locked): ?><span style="color: #D81B60; font-size: 14px;">🔒</span><?php endif; ?></h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Schütze dein WordPress-Login vor automatisierten Angriffen durch Login-Versuchs-Limitierung.
                        </p>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle <?php echo $security_locked ? 'germanfence-toggle-locked' : ''; ?>">
                                <input type="checkbox" name="login_limit_enabled" value="1" <?php checked(isset($settings['login_limit_enabled']) && $settings['login_limit_enabled'] === '1'); ?> <?php echo esc_attr( $security_disabled ); ?>>
                                    <span class="toggle-slider"></span>
                                    <?php if ($security_locked): ?><span class="toggle-lock-icon">🔒</span><?php endif; ?>
                                </label>
                                <div class="setting-info">
                                <h3>Login-Limitierung aktivieren</h3>
                                <p>Blockiert IP-Adressen nach zu vielen fehlgeschlagenen Login-Versuchen</p>
                                </div>
                            </div>
                        
                        <div class="germanfence-subsetting" id="login-limit-settings" style="<?php echo (isset($settings['login_limit_enabled']) && $settings['login_limit_enabled'] === '1') ? '' : 'display:none;'; ?> margin-top: 20px; <?php echo $security_locked ? 'opacity: 0.6; pointer-events: none;' : ''; ?>">
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 10px;"><strong>Maximale Login-Versuche:</strong></label>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <input 
                                        type="number" 
                                        name="login_max_attempts"
                                        min="1" 
                                        max="10" 
                                        value="<?php echo esc_attr($settings['login_max_attempts'] ?? 3); ?>"
                                        style="width: 100px; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px;"
                                        <?php echo esc_attr( $security_disabled ); ?>
                                    >
                                    <span style="color: #646970;">Versuche</span>
                                </div>
                                <p class="description" style="margin-top: 5px;">
                                    Nach dieser Anzahl fehlgeschlagener Versuche wird die IP gesperrt. Empfohlen: 3-5
                                </p>
                        </div>
                        
                            <div class="setting-row">
                                <label style="display: block; margin-bottom: 10px;"><strong>Sperrzeit:</strong></label>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <input 
                                        type="number" 
                                        name="login_lockout_duration"
                                        min="5" 
                                        max="1440" 
                                        value="<?php echo esc_attr($settings['login_lockout_duration'] ?? 30); ?>"
                                        style="width: 100px; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px;"
                                        <?php echo esc_attr( $security_disabled ); ?>
                                    >
                                    <span style="color: #646970;">Minuten</span>
                                </div>
                                <p class="description" style="margin-top: 5px;">
                                    Dauer der Sperre nach fehlgeschlagenen Versuchen. Empfohlen: 30-60 Minuten
                            </p>
                        </div>
                    </div>
                </div>
                
                    <!-- EMAIL OBFUSCATION Section -->
                    <div class="germanfence-section" style="opacity: 0.6; pointer-events: none;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <h2 style="margin: 0;">📧 E-Mail-Schutz (Obfuscation)</h2>
                            <span style="background: linear-gradient(135deg, #22D6DD, #EC4899); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">🚀 Coming Soon</span>
                        </div>
                        <p class="description" style="margin-bottom: 20px;">
                            Schütze E-Mail-Adressen auf deiner Website vor Spam-Bots durch intelligente Verschleierung. <strong>Diese Funktion wird in einem kommenden Update verfügbar sein.</strong>
                        </p>
                        
                        <div class="germanfence-setting">
                            <label class="germanfence-toggle">
                                <input type="checkbox" name="email_obfuscation_enabled" value="1" disabled>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="setting-info">
                                <h3>E-Mail-Schutz aktivieren</h3>
                                <p>Verschleiert automatisch alle E-Mail-Adressen auf deiner Website (Posts, Pages, Widgets, Impressum, Datenschutz)</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-subsetting" id="email-obfuscation-settings" style="<?php echo (isset($settings['email_obfuscation_enabled']) && $settings['email_obfuscation_enabled'] === '1') ? '' : 'display:none;'; ?> margin-top: 20px;">
                            
                            <!-- 2-Spalten Layout: Links Methode, Rechts Zähler -->
                            <div style="display: grid; grid-template-columns: 1fr 200px; gap: 30px; align-items: start;">
                                
                                <!-- Linke Spalte: Verschlüsselungsmethode -->
                                <div>
                                    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1d2327;">🔐 Verschlüsselungsmethode</h3>
                                    
                                    <div style="display: flex; flex-direction: column; gap: 10px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 15px;">
                                            <input type="radio" name="email_obfuscation_method" value="javascript" <?php checked($settings['email_obfuscation_method'] ?? 'javascript', 'javascript'); ?>>
                                            <strong>JavaScript (Empfohlen)</strong>
                                            <span style="color: #646970;">– Beste Schutz-Stufe, Base64-kodiert</span>
                                        </label>
                                        
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 15px;">
                                            <input type="radio" name="email_obfuscation_method" value="entities" <?php checked($settings['email_obfuscation_method'] ?? 'javascript', 'entities'); ?>>
                                            <strong>HTML-Entities</strong>
                                            <span style="color: #646970;">– Mittlerer Schutz, ohne JavaScript</span>
                                        </label>
                                        
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 15px;">
                                            <input type="radio" name="email_obfuscation_method" value="css" <?php checked($settings['email_obfuscation_method'] ?? 'javascript', 'css'); ?>>
                                            <strong>CSS-Umkehrung</strong>
                                            <span style="color: #646970;">– Guter Schutz, ohne JavaScript</span>
                                        </label>
                                    </div>
                                    
                                    <!-- Shortcode Hinweis (inline) -->
                                    <p style="margin: 20px 0 0 0; color: #646970; font-size: 15px;">
                                        💡 <strong>Shortcode:</strong> 
                                        <code style="background: #F2F5F8; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #D63638;">[germanfence_email]info@example.com[/germanfence_email]</code>
                                    </p>
                                </div>
                                
                                <!-- Rechte Spalte: Email-Zähler -->
                                <div style="text-align: center; padding: 20px 0;">
                                    <?php 
                                    if (class_exists('GermanFence_Email_Obfuscation')) {
                                        $email_obfuscation = new GermanFence_Email_Obfuscation();
                                        $email_stats = $email_obfuscation->count_emails_on_site();
                                        $total = $email_stats['total'];
                                        $unique = $email_stats['unique'];
                                    } else {
                                        $total = 0;
                                        $unique = 0;
                                    }
                                    ?>
                                    <div style="font-size: 48px; font-weight: 700; color: #22D6DD; line-height: 1;">
                                        <?php echo esc_html($total); ?>
                                    </div>
                                    <div style="font-size: 15px; color: #22D6DD; font-weight: 600; margin-top: 5px;">
                                        📧 E-Mails gefunden
                                    </div>
                                    <div style="font-size: 15px; color: #646970; margin-top: 5px;">
                                        (<?php echo esc_html($unique); ?> verschiedene)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- .HTACCESS GENERATOR Section -->
                    <div class="germanfence-section" style="<?php echo $security_locked ? 'opacity: 0.7; pointer-events: none;' : ''; ?>">
                        <h2>📄 .htaccess Sicherheits-Regeln <?php if ($security_locked): ?><span style="color: #D81B60; font-size: 14px;">🔒</span><?php endif; ?></h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Professionelle .htaccess-Regeln für Speed & Security. Code wird automatisch bei Auswahl generiert.
                        </p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                                <!-- Linke Spalte: Optionen -->
                                <div>
                                    <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1d2327;">🔒 Sicherheit:</h3>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-nuisance" checked>
                                            <span style="font-size: 15px;">🚫 Nuisance Requests blockieren</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-8g-firewall">
                                            <span style="font-size: 15px;">🔥 8G Firewall (Komplettschutz)</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-8g-addon">
                                            <span style="font-size: 15px;">🔒 8G Addon (Rogue PHP Files)</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-reallylongrequest">
                                            <span style="font-size: 15px;">🛑 ReallyLongRequest Bandit</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-wp-files" checked>
                                            <span style="font-size: 15px;">🔐 WordPress-Dateien schützen</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-xmlrpc" checked>
                                            <span style="font-size: 15px;">🛡️ XML-RPC blockieren</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-author-scan" checked>
                                            <span style="font-size: 15px;">👤 Autoren-Scans blockieren</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-security-headers" checked>
                                            <span style="font-size: 15px;">🔐 Security Headers (HSTS, CSP)</span>
                                        </label>
                                    </div>
                                    
                                    <h3 style="margin: 20px 0 15px 0; font-size: 16px; font-weight: 600; color: #1d2327;">⚡ Performance:</h3>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-caching" checked>
                                            <span style="font-size: 15px;">⚡ Browser Caching (1 Jahr)</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-compression" checked>
                                            <span style="font-size: 15px;">📦 GZIP Komprimierung</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-cors">
                                            <span style="font-size: 15px;">🌐 CORS für Fonts/Assets</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" class="htaccess-option" id="htaccess-hotlink">
                                            <span style="font-size: 15px;">🖼️ Hotlink Protection</span>
                                        </label>
                                    </div>
                                    
                                    <div style="margin-top: 20px; padding: 15px; background: #fff8e1; border-radius: 9px;">
                                        <p style="margin: 0; font-size: 15px; color: #856404;">
                                            💡 <strong>Tipp:</strong> Die 8G Firewall enthält umfassenden Schutz gegen SQL-Injection, XSS, Bots und mehr.
                                        </p>
                                    </div>
                                </div>
                                
                                <!-- Rechte Spalte: Code-Feld -->
                                <div>
                                    <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1d2327;">Generierter Code:</h3>
                                    <textarea id="htaccess-output" readonly 
                                        style="width: 100%; height: 450px; font-family: monospace; font-size: 12px; padding: 15px; border: 1px solid #d9dde1; border-radius: 9px; background: #ffffff; resize: vertical;"
                                        placeholder="Wähle Sicherheitsregeln aus - Code wird automatisch generiert..."
                                    ></textarea>
                                    
                                    <button type="button" id="copy-htaccess-btn" class="germanfence-btn-primary" style="margin-top: 13px; width: 100%;">
                                        <span class="dashicons dashicons-clipboard"></span>
                                        Code kopieren
                                    </button>
                                    
                                    <p style="margin: 15px 0 0 0; color: #646970; font-size: 15px;">
                                        ⚠️ <strong>Wichtig:</strong> Backup deiner .htaccess erstellen! Füge den Code am <strong>Anfang</strong> deiner .htaccess ein.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Einstellungen Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'settings' ? 'active' : ''; ?>" id="tab-settings">
                    
                    <!-- API-KEY VERWALTUNG Section -->
                    <div class="germanfence-section">
                        <h2>🔑 API-Key Verwaltung</h2>
                        
                                <?php
                        $license_status = $license_manager->check_license();
                        
                        // API-Key aktivieren
                        if (isset($_POST['activate_license']) && !empty($_POST['license_key'])) {
                            $result = $license_manager->activate_license(sanitize_text_field($_POST['license_key']));
                            if ($result['success']) {
                                add_settings_error('germanfence_messages', 'germanfence_message', $result['message'], 'success');
                                $license_info = $license_manager->get_license_info();
                                $license_status = $license_manager->check_license();
                            } else {
                                add_settings_error('germanfence_messages', 'germanfence_message', $result['message'], 'error');
                            }
                            settings_errors('germanfence_messages');
                        }
                        
                        // API-Key deaktivieren (PRO oder FREE) - Plugin komplett sperren
                        if (isset($_POST['deactivate_license']) || isset($_POST['deactivate_free'])) {
                            // Deaktiviere PRO-Lizenz
                        if (isset($_POST['deactivate_license'])) {
                            $result = $license_manager->deactivate_license();
                        }
                        
                        // Deaktiviere FREE-Lizenz
                        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Checking if button was clicked
                        if (isset($_POST['deactivate_free'])) {
                            $result = $free_manager->deactivate_free();
                        }
                            
                            // Lösche BEIDE Lizenzen komplett, damit Plugin gesperrt wird
                            $license_manager->deactivate_license();
                            $free_manager->deactivate_free();
                            
                            // Status neu laden
                            $license_info = $license_manager->get_license_info();
                            $license_status = $license_manager->check_license();
                            $is_free_active = $free_manager->is_free_active();
                            $free_email = $free_manager->get_verified_email();
                            
                            add_settings_error('germanfence_messages', 'germanfence_message', 'API-Key deaktiviert - Plugin gesperrt. Bitte neuen API-Key aktivieren.', 'success');
                            settings_errors('germanfence_messages');
                            
                            // WICHTIG: Reload erzwingen damit Plugin gesperrt wird
                            echo '<script>setTimeout(function(){ window.location.reload(); }, 1000);</script>';
                        }
                        ?>
                        
                        <!-- API-KEY VERWALTUNG: 2-Spalten Layout -->
                        <?php if (empty($license_info['has_license']) || empty($is_license_valid)): ?>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        
                        <!-- FREE VERSION BOX -->
                        <div style="background: #ffffff; padding: 25px; display: flex; flex-direction: column; border-radius: 9px; border: 1px solid #d9dde1;">
                            <?php if ($is_free_active): ?>
                                <?php $current_key = $free_manager->get_license_key(); ?>
                                <h3 style="margin: 0 0 15px 0; color: #1d2327; font-size: 18px; font-weight: 600;">✅ Kostenlose Version aktiviert</h3>
                                <p style="margin: 0 0 10px 0; color: #1d2327; font-size: 15px;">
                                    <strong>Verifizierte E-Mail:</strong> <?php echo esc_html($free_email); ?>
                                </p>
                                <?php if ($current_key): ?>
                                <div style="margin: 15px 0;">
                                    <p style="margin: 0 0 8px 0; color: #1d2327; font-size: 15px; font-weight: 600;">
                                        🔑 Dein API-Key<?php 
                                        $key_type = 'FREE';
                                        if (strpos($current_key, 'GS-PRO-') === 0) $key_type = 'PRO';
                                        elseif (strpos($current_key, 'GS-SINGLE-') === 0) $key_type = 'SINGLE';
                                        elseif (strpos($current_key, 'GS-FREELANCER-') === 0) $key_type = 'FREELANCER';
                                        elseif (strpos($current_key, 'GS-AGENCY-') === 0) $key_type = 'AGENCY';
                                        elseif (strpos($current_key, 'GS-FREE-') === 0) $key_type = 'FREE';
                                        else $key_type = 'CUSTOM';
                                        echo ' (' . esc_html( $key_type ) . ')';
                                        ?>:
                                    </p>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="text" value="<?php echo esc_attr($current_key); ?>" readonly 
                                            class="germanfence-input" style="flex: 1; font-family: monospace; border-radius: 9px !important;">
                                        <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($current_key); ?>'); this.innerHTML='✅ Kopiert!'; setTimeout(() => this.innerHTML='📋 Kopieren', 2000);" 
                                            style="padding: 12px 16px; background: #22D6DD; color: #fff; border: none; border-radius: 9px; cursor: pointer; font-weight: 600; height: 44px;">
                                            📋 Kopieren
                                        </button>
                                    </div>
                                    <p style="margin: 8px 0 0 0; color: #646970; font-size: 15px;">
                                        💡 Nutze diesen Key um GermanFence auf weiteren Domains zu aktivieren!
                                    </p>
                                </div>
                                <?php endif; ?>
                                <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 15px;">
                                    <?php if ($is_license_valid): ?>
                                        Dein PRO API-Key ist aktiv. Du hast Zugriff auf alle Features!
                                    <?php else: ?>
                                    Du nutzt die kostenlose Version von GermanFence mit Basis-Funktionen.
                                    <?php endif; ?>
                                </p>
                                <form method="post">
                                    <?php wp_nonce_field('germanfence_settings', 'germanfence_nonce'); ?>
                                    <button type="submit" name="deactivate_free" class="germanfence-btn-danger">
                                        <?php echo $is_license_valid ? 'PRO API-Key deaktivieren' : 'Kostenlose Version deaktivieren'; ?>
                                    </button>
                                </form>
                            <?php else: ?>
                                <div style="flex: 1;">
                                    <h3 style="margin: 0 0 15px 0; color: #1d2327; font-size: 18px; font-weight: 600;">🆓 Kostenlose Version aktivieren</h3>
                                    
                                    <!-- Tabs: E-Mail vs Key -->
                                    <div style="display: flex; gap: 10px; margin-bottom: 20px; border: 1px solid #d9dde1; border-radius: 9px; padding: 5px; background: #F2F5F8;">
                                        <button type="button" id="free-email-tab" class="germanfence-free-tab active" 
                                            style="flex: 1; padding: 10px; background: #ffffff; border: none; border-radius: 9px; cursor: pointer; font-weight: 600; transition: all 0.2s; color: #22D6DD;">
                                            📧 Per E-Mail
                                        </button>
                                        <button type="button" id="free-key-tab" class="germanfence-free-tab" 
                                            style="flex: 1; padding: 10px; background: transparent; border: none; border-radius: 9px; cursor: pointer; font-weight: 600; transition: all 0.2s; color: #646970;">
                                            🔑 Mit API-Key
                                        </button>
                                    </div>
                                    
                                    <!-- E-Mail Aktivierung -->
                                    <div id="free-email-content" class="germanfence-free-content">
                                        <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 15px;">
                                            Gib deine E-Mail-Adresse ein und bestätige sie, um GermanFence kostenlos zu nutzen!
                                        </p>
                                        
                                        <div style="margin-bottom: 20px;">
                                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #1d2327;">E-Mail-Adresse:</label>
                                            <input type="email" id="free-email-input" placeholder="deine@email.de" class="germanfence-input" style="border-radius: 9px !important;">
                                        </div>
                                        
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" id="free-agb-checkbox" style="margin-top: 4px; cursor: pointer;">
                                            <span style="font-size: 15px; color: #1d2327;">
                                                Ich akzeptiere die <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&show=agb') ); ?>" style="color: #22D6DD; text-decoration: underline;">AGB</a> und die <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&show=datenschutz') ); ?>" style="color: #22D6DD; text-decoration: underline;">Datenschutzerklärung</a>
                                            </span>
                                        </label>
                                    </div>
                                        
                                        <div style="text-align: center; margin-top: auto;">
                                            <button type="button" id="register-free-btn" class="germanfence-btn-primary">
                                                <span class="dashicons dashicons-email-alt"></span>
                                                Bestätigungsmail senden
                                            </button>
                                        </div>
                                        
                                        <p style="margin: 15px 0 0 0; color: #646970; font-size: 15px; text-align: center;">
                                            💡 Du erhältst eine E-Mail mit einem Bestätigungslink. Nach der Verifizierung bekommst du einen API-Key!
                                        </p>
                                    </div>
                                    
                                    <!-- Key Aktivierung -->
                                    <div id="free-key-content" class="germanfence-free-content" style="display: none;">
                                        <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 15px;">
                                            Hast du bereits einen API-Key? Gib ihn hier ein! (FREE, PRO, SINGLE, FREELANCER, AGENCY)
                                        </p>
                                        
                                        <div style="margin-bottom: 20px;">
                                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #1d2327;">API-Key:</label>
                                            <input type="text" id="free-key-input" placeholder="GS-XXXX-XXXXXXXXXXXX" class="germanfence-input" style="font-family: monospace; text-transform: uppercase; border-radius: 9px !important;">
                                        </div>
                                        
                                        <div style="text-align: center; margin-top: auto;">
                                            <button type="button" id="activate-free-key-btn" class="germanfence-btn-primary">
                                                <span class="dashicons dashicons-unlock"></span>
                                                API-Key aktivieren
                                            </button>
                                        </div>
                                        
                                        <p style="margin: 15px 0 0 0; color: #646970; font-size: 15px; text-align: center;">
                                            💡 Kostenlose API-Keys erhältst du nach der E-Mail-Verifizierung. PRO API-Keys kannst du auf germanfence.de kaufen.
                                        </p>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                        <!-- PRO API-KEY KAUFEN BOX -->
                        <div style="background: #ffffff; padding: 25px; display: flex; flex-direction: column; border-radius: 9px; border: 1px solid #d9dde1;">
                            <h3 style="margin: 0 0 15px 0; color: #1d2327; font-size: 18px; font-weight: 600;">💎 GermanFence PRO - Maximaler Schutz</h3>
                            <p style="margin: 0 0 20px 0; color: #646970; font-size: 15px; line-height: 1.6;">
                                Upgrade jetzt auf PRO und schalte leistungsstarke Anti-Spam Features frei! Perfekt für professionelle Websites, die maximalen Schutz benötigen.
                            </p>
                            
                            <div style="background: #ffffff; padding: 20px; border-radius: 9px; margin-bottom: 20px; border: 1px solid #d9dde1;">
                                <h4 style="margin: 0 0 15px 0; color: #1d2327; font-size: 15px; font-weight: 600;">🚀 Exklusive PRO-Features:</h4>
                                <ul style="margin: 0; padding: 0 0 0 20px; list-style: none;">
                                    <li style="margin-bottom: 8px; color: #1d2327; font-size: 15px;">
                                        <span style="color: #22D6DD; font-weight: 600;">✓</span> <strong>GEO-Blocking</strong> – Blockiere Spam aus beliebigen Ländern
                                    </li>
                                    <li style="margin-bottom: 8px; color: #1d2327; font-size: 15px;">
                                        <span style="color: #22D6DD; font-weight: 600;">✓</span> <strong>Phrasen-Blocking</strong> – Intelligente Keyword & Regex-Filter
                                    </li>
                                    <li style="margin-bottom: 8px; color: #1d2327; font-size: 15px;">
                                        <span style="color: #22D6DD; font-weight: 600;">✓</span> <strong>URL-Limit</strong> – SEO-Spam effektiv blockieren
                                    </li>
                                    <li style="margin-bottom: 8px; color: #1d2327; font-size: 15px;">
                                        <span style="color: #22D6DD; font-weight: 600;">✓</span> <strong>Domain-Blocking</strong> – Spam-Domains gezielt sperren
                                    </li>
                                    <li style="margin-bottom: 8px; color: #1d2327; font-size: 15px;">
                                        <span style="color: #22D6DD; font-weight: 600;">✓</span> <strong>Erweiterte Statistiken</strong> – Detaillierte Spam-Analyse
                                    </li>
                                    <li style="margin-bottom: 0; color: #1d2327; font-size: 15px;">
                                        <span style="color: #22D6DD; font-weight: 600;">✓</span> <strong>Priority Support</strong> – Schnelle Hilfe bei Fragen
                                    </li>
                                </ul>
                            </div>
                            
                            <div style="background: #ffffff; padding: 12px; border-radius: 9px; margin-bottom: 15px; text-align: center; border: 1px solid #d9dde1;">
                                <p style="margin: 0; color: #1d2327; font-size: 15px; font-weight: 600;">
                                    ✅ 14 Tage 100% Geld-zurück-Garantie
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin-top: auto;">
                                <a href="https://germanfence.de/#pricing" target="_blank" 
                                   class="germanfence-btn-primary" 
                                   style="display: inline-flex !important; align-items: center !important; height: 44px !important; padding: 0 24px !important; text-decoration: none !important; gap: 8px !important;">
                                    <span class="dashicons dashicons-cart" style="font-size: 18px;"></span>
                                    Jetzt PRO kaufen
                            </a>
                            </div>
                        </div>
                        
                        </div><!-- Ende 2-Spalten Layout -->
                        <?php endif; ?>
                        
                        <!-- PRO API-KEY AKTIV -->
                        <?php if (!empty($license_info['has_license']) && !empty($is_license_valid)): ?>
                        <div style="background: #E9FBFC; padding: 25px; margin-bottom: 30px; border-radius: 9px;">
                            <h3 style="margin: 0 0 15px 0; color: #22D6DD; font-size: 18px;">✅ GermanFence PRO aktiviert</h3>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 15px;">Paket:</p>
                                    <p style="margin: 0; color: #1d2327; font-size: 15px; font-weight: 600;"><?php echo esc_html($license_info['package_type']); ?></p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 15px;">Gültig bis:</p>
                                    <p style="margin: 0; color: #1d2327; font-size: 15px; font-weight: 600;"><?php echo esc_html($license_info['expires_at']); ?></p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 15px;">Domains:</p>
                                    <p style="margin: 0; color: #1d2327; font-size: 15px; font-weight: 600;"><?php echo esc_html($license_info['active_domains']); ?> / <?php echo esc_html($license_info['max_domains']); ?></p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 15px;">Status:</p>
                                    <p style="margin: 0; color: #22D6DD; font-size: 15px; font-weight: 600;">✓ Aktiv</p>
                                </div>
                            </div>
                            
                            <div style="margin: 15px 0;">
                                <p style="margin: 0 0 8px 0; color: #1d2327; font-size: 15px; font-weight: 600;">
                                    🔑 Dein API-Key:
                                </p>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="text" value="<?php echo esc_attr($license_info['license_key']); ?>" readonly 
                                        class="germanfence-input" style="flex: 1; font-family: monospace; border-radius: 9px !important;">
                                    <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($license_info['license_key']); ?>'); this.innerHTML='✅ Kopiert!'; setTimeout(() => this.innerHTML='📋 Kopieren', 2000);" 
                                        style="padding: 12px 16px; background: #22D6DD; color: #fff; border: none; border-radius: 9px; cursor: pointer; font-weight: 600; height: 44px;">
                                        📋 Kopieren
                                    </button>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px;">
                            <form method="post" style="display: inline;">
                                <button type="submit" name="deactivate_license" class="germanfence-btn-danger">
                                    API-Key deaktivieren
                                </button>
                            </form>
                            </div>
                        </div>
                        <?php endif; ?>
                </div>
                    
                    <!-- Performance-Optimierung Section -->
                    <div class="germanfence-section">
                        <h2>⚡ Performance-Optimierung</h2>
                        <p class="description" style="margin-bottom: 20px; font-size: 15px;">
                            Optimiere die Ladegeschwindigkeit durch die richtige Script-Position.
                        </p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="defer_scripts" value="1" <?php checked(isset($settings['defer_scripts']) && $settings['defer_scripts'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Scripts verzögert laden (defer)</h3>
                                    <p>⚡ Lädt Scripts asynchron für maximale Performance. Empfohlen!</p>
                                </div>
                            </div>
                            
                            <div style="padding: 20px 0;">
                                <h3 style="margin-top: 0; color: #1d2327;">📍 Script-Ladeposition</h3>
                                <div style="margin-top: 15px;">
                                    <label style="display: block; margin-bottom: 10px; cursor: pointer; font-size: 15px;">
                                        <input type="radio" name="script_position" value="header" <?php checked($settings['script_position'] ?? 'footer', 'header'); ?>>
                                        <strong>Header</strong> - Früh geladen
                                    </label>
                                    <label style="display: block; margin-bottom: 10px; cursor: pointer; font-size: 15px;">
                                        <input type="radio" name="script_position" value="footer" <?php checked($settings['script_position'] ?? 'footer', 'footer'); ?>>
                                        <strong>Footer</strong> - ⚡ Empfohlen
                                    </label>
                                    <label style="display: block; cursor: pointer; font-size: 15px;">
                                        <input type="radio" name="script_position" value="body" <?php checked($settings['script_position'] ?? 'footer', 'body'); ?>>
                                        <strong>Body</strong> - Gute Balance
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Badge Section -->
                    <div class="germanfence-section">
                        <h2 style="margin-top: 40px;">⭐ Badge - "Diese Seite wird geschützt"</h2>
                        
                        <?php 
                        $license = GermanFence_License::get_instance();
                        $package_type = $license->get_package_type();
                        $is_free = ($package_type === 'FREE');
                        $has_whitelabel = $license->has_feature('whiteLabel');
                        ?>
                        
                        <div class="germanfence-setting">
                            <label class="germanfence-toggle <?php echo $is_free ? 'germanfence-toggle-locked' : ''; ?>">
                                <input type="checkbox" name="badge_enabled" value="1" 
                                    <?php checked($is_free || (isset($settings['badge_enabled']) && $settings['badge_enabled'] === '1')); ?>
                                    <?php echo $is_free ? 'disabled onclick="return false;"' : ''; ?>>
                                <span class="toggle-slider"></span>
                                <?php if ($is_free): ?>
                                    <span class="toggle-lock-icon">🔒</span>
                                <?php endif; ?>
                            </label>
                            <div class="setting-info">
                                <h3>Badge anzeigen <?php echo $is_free ? '<span style="color: #22D6DD;">● Aktiv (FREE)</span>' : ''; ?></h3>
                                <p>Zeigt einen Badge auf der Website, dass sie durch GermanFence geschützt wird.
                                <?php if (!$has_whitelabel): ?>
                                    <br><strong style="color: #22D6DD;">🏷️ White Label:</strong> Badge ausblenden ist ab der <strong>Single API-Key</strong> verfügbar. <a href="https://germanfence.de/#pricing" target="_blank" style="color: #22D6DD; text-decoration: none;">→ Jetzt upgraden</a>
                                <?php else: ?>
                                    <br><strong style="color: #22D6DD;">✓ White Label verfügbar:</strong> Du kannst den Badge ausblenden.
                                <?php endif; ?>
                                </p>
                            </div>
                        </div>
                        
                        <div class="germanfence-subsetting" id="badge-settings" style="<?php echo (!$is_free && (!isset($settings['badge_enabled']) || $settings['badge_enabled'] !== '1')) ? 'display:none;' : ''; ?>">
                            <h3>Badge-Einstellungen</h3>
                            
                            <!-- Anzeige-Bereich & Position nebeneinander -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div class="setting-row">
                                    <label><strong>Anzeige-Bereich:</strong></label>
                                    <select name="badge_display_type" style="width: 500px; max-width: 100%; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px;">
                                        <option value="global" <?php selected($settings['badge_display_type'] ?? 'global', 'global'); ?>>Auf gesamter Website</option>
                                        <option value="forms" <?php selected($settings['badge_display_type'] ?? '', 'forms'); ?>>Nur bei Formularen</option>
                                    </select>
                                </div>
                                
                                <div class="setting-row">
                                    <label><strong>Position:</strong></label>
                                    <select name="badge_position" style="width: 500px; max-width: 100%; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px;">
                                        <option value="bottom-right" <?php selected($settings['badge_position'] ?? 'bottom-right', 'bottom-right'); ?>>Unten Rechts</option>
                                        <option value="bottom-left" <?php selected($settings['badge_position'] ?? '', 'bottom-left'); ?>>Unten Links</option>
                                        <option value="top-right" <?php selected($settings['badge_position'] ?? '', 'top-right'); ?>>Oben Rechts</option>
                                        <option value="top-left" <?php selected($settings['badge_position'] ?? '', 'top-left'); ?>>Oben Links</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Badge-Text & Eigenes Icon nebeneinander -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div class="setting-row">
                                    <label><strong>Badge-Text:</strong></label>
                                    <input type="text" name="badge_text" value="<?php echo esc_attr($settings['badge_text'] ?? 'Geschützt durch GermanFence'); ?>" 
                                        style="width: 500px; max-width: 100%; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px;"
                                        placeholder="Geschützt durch GermanFence">
                                </div>
                                
                                <div class="setting-row">
                                    <label><strong>Eigenes Icon/Logo (URL):</strong></label>
                                    <input type="text" name="badge_custom_image" value="<?php echo esc_attr($settings['badge_custom_image'] ?? ''); ?>" 
                                        style="width: 500px; max-width: 100%; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-size: 15px;"
                                        placeholder="https://example.com/logo.png">
                                </div>
                            </div>
                            
                            <!-- 2-Spalten Layout für Farben -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div class="setting-row">
                                    <label><strong>Text-Farbe:</strong></label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="color" name="badge_text_color" value="<?php echo esc_attr($settings['badge_text_color'] ?? '#1d2327'); ?>" 
                                            style="width: 60px; height: 44px; border: 1px solid #d9dde1; border-radius: 9px; cursor: pointer;">
                                        <input type="text" name="badge_text_color_hex" value="<?php echo esc_attr($settings['badge_text_color'] ?? '#1d2327'); ?>" 
                                            style="flex: 1; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-family: monospace; font-size: 15px;"
                                            placeholder="#1d2327">
                                    </div>
                                </div>

                                <div class="setting-row">
                                    <label><strong>Rahmen-Farbe:</strong></label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="color" name="badge_border_color" value="<?php echo esc_attr($settings['badge_border_color'] ?? '#22D6DD'); ?>" 
                                            style="width: 60px; height: 44px; border: 1px solid #d9dde1; border-radius: 9px; cursor: pointer;">
                                        <input type="text" name="badge_border_color_hex" value="<?php echo esc_attr($settings['badge_border_color'] ?? '#22D6DD'); ?>" 
                                            style="flex: 1; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-family: monospace; font-size: 15px;"
                                            placeholder="#22D6DD">
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div class="setting-row">
                                    <label><strong>Hintergrund-Farbe:</strong></label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="color" name="badge_background_color" value="<?php echo esc_attr($settings['badge_background_color'] ?? '#ffffff'); ?>" 
                                            style="width: 60px; height: 44px; border: 1px solid #d9dde1; border-radius: 9px; cursor: pointer;">
                                        <input type="text" name="badge_background_color_hex" value="<?php echo esc_attr($settings['badge_background_color'] ?? '#ffffff'); ?>" 
                                            style="flex: 1; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-family: monospace; font-size: 15px;"
                                            placeholder="#ffffff">
                                    </div>
                                </div>

                                <div class="setting-row">
                                    <label><strong>Schatten-Farbe:</strong></label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="color" name="badge_shadow_color" value="<?php echo esc_attr($settings['badge_shadow_color'] ?? '#22D6DD'); ?>" 
                                            style="width: 60px; height: 44px; border: 1px solid #d9dde1; border-radius: 9px; cursor: pointer;">
                                        <input type="text" name="badge_shadow_color_hex" value="<?php echo esc_attr($settings['badge_shadow_color'] ?? '#22D6DD'); ?>" 
                                            style="flex: 1; padding: 10px; border: 1px solid #d9dde1; border-radius: 9px; font-family: monospace; font-size: 15px;"
                                            placeholder="#22D6DD">
                                    </div>
                                </div>
                            </div>

                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label><strong>Border Radius (Abrundung):</strong></label>
                                <div style="display: flex; gap: 15px; align-items: center;">
                                    <input 
                                        type="range" 
                                        name="badge_border_radius" 
                                        id="badge-border-radius-slider"
                                        min="0" 
                                        max="30" 
                                        value="<?php echo esc_attr($settings['badge_border_radius'] ?? 6); ?>"
                                        style="flex: 1; max-width: 300px;"
                                    >
                                    <span id="badge-border-radius-value" style="font-size: 18px; font-weight: 600; color: #22D6DD; min-width: 60px;">
                                        <?php echo esc_html($settings['badge_border_radius'] ?? 6); ?>px
                                    </span>
                                </div>
                                <p class="description" style="margin-top: 5px; color: #646970;">
                                    0px = eckig, 6px = leicht abgerundet (Standard), 30px = stark abgerundet
                                </p>
                            </div>
                            
                            <h3 style="margin-top: 30px;">Vorschau</h3>
                            <div style="padding: 20px; text-align: center;">
                                <?php 
                                $shadow_color = $settings['badge_shadow_color'] ?? '#22D6DD';
                                $border_radius = $settings['badge_border_radius'] ?? 6;
                                // Konvertiere Hex zu RGB für Shadow
                                $hex = ltrim($shadow_color, '#');
                                if (strlen($hex) == 3) {
                                    $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
                                }
                                $r = hexdec(substr($hex, 0, 2));
                                $g = hexdec(substr($hex, 2, 2));
                                $b = hexdec(substr($hex, 4, 2));
                                $shadow_rgb = "$r, $g, $b";
                                ?>
                                <div id="badge-preview" style="display: inline-flex; align-items: center; gap: 8px; background: <?php echo esc_attr($settings['badge_background_color'] ?? '#ffffff'); ?>; padding: 10px 16px; border-radius: <?php echo esc_attr($border_radius); ?>px; border: 1px solid <?php echo esc_attr($settings['badge_border_color'] ?? '#22D6DD'); ?>; box-shadow: 0 2px 8px rgba(<?php echo esc_attr($shadow_rgb); ?>, 0.2);">
                                    <span id="badge-icon">
                                        <img src="<?php echo esc_url( GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence-icon.png' ); ?>" alt="GermanFence" style="width: 24px; height: 24px; object-fit: contain;">
                                    </span>
                                    <span id="badge-text-preview" style="font-size: 15px; font-weight: 600; color: <?php echo esc_attr($settings['badge_text_color'] ?? '#1d2327'); ?>;"><?php echo esc_html($settings['badge_text'] ?? 'Geschützt durch GermanFence'); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Telemetrie Section (DSGVO-konform) -->
                    <div class="germanfence-section" style="margin-top: 40px;">
                        <h2>📊 Anonyme Telemetrie & Muster-Erkennung</h2>
                        <p class="description" style="margin-bottom: 20px; line-height: 1.6;">
                            Hilf uns, GermanFence zu verbessern! Durch das Teilen anonymisierter Spam-Daten können wir neue Bedrohungen schneller erkennen und alle Nutzer besser schützen.
                        </p>
                        
                        <?php 
                        $telemetry = new GermanFence_Telemetry();
                        $is_telemetry_enabled = $telemetry->is_enabled();
                        ?>
                        
                        <div style="background: #fff; padding: 25px;">
                            <div class="germanfence-setting" style="border: none; padding: 0; margin-bottom: 20px;">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="telemetry_enabled" value="1" <?php checked($is_telemetry_enabled); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3 style="margin: 0 0 5px 0; color: #1d2327;">Anonyme Telemetrie aktivieren</h3>
                                    <p style="margin: 0;">Sende anonymisierte Spam-Daten zur Muster-Erkennung</p>
                                </div>
                            </div>
                            
                            <div style="padding: 20px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #1d2327; font-size: 15px;">🔒 Was wird gesendet?</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                    <div>
                                        <span style="color: #22D6DD; font-weight: 600;">✓ Anonymisiert:</span>
                                        <ul style="margin: 8px 0 0 20px; color: #646970; font-size: 15px; line-height: 1.8;">
                                            <li>IP-Adresse (gehasht, SHA-256)</li>
                                            <li>Ursprungsland (ISO-Code)</li>
                                            <li>Block-Methode & Grund</li>
                                            <li>E-Mail-Domain (nur Hash)</li>
                                            <li>User-Agent (Hash)</li>
                                            <li>Spam-Domains aus Links</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <span style="color: #F06292; font-weight: 600;">✗ Nicht gespeichert:</span>
                                        <ul style="margin: 8px 0 0 20px; color: #646970; font-size: 15px; line-height: 1.8;">
                                            <li>Keine echten IP-Adressen</li>
                                            <li>Keine E-Mail-Adressen</li>
                                            <li>Keine Nachrichten/Inhalte</li>
                                            <li>Keine persönlichen Daten</li>
                                            <li>Keine Klarnamen</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div style="padding: 15px 0; margin-bottom: 15px;">
                                    <h4 style="margin: 0 0 8px 0; color: #22D6DD; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                                        <span>🇩🇪</span> <strong>100% DSGVO-konform</strong>
                                    </h4>
                                    <ul style="margin: 0; padding-left: 20px; color: #646970; font-size: 15px; line-height: 1.8;">
                                        <li>Datenverarbeitung <strong>nur in Deutschland</strong> (Hetzner Server)</li>
                                        <li>Zweck: <strong>Ausschließlich Gefahrenabwehr</strong> und Spam-Muster-Erkennung</li>
                                        <li>Keine Weitergabe an Dritte</li>
                                        <li>Jederzeit widerrufbar (Toggle aus = sofort gestoppt)</li>
                                        <li>Auftragsverarbeitungsvertrag verfügbar (siehe unten)</li>
                                    </ul>
                                </div>
                                
                                <div style="padding: 15px 0 10px 0; background: #ffffff; text-align: center;">
                                    <p style="margin: 0 0 15px 0; color: #1d2327; font-size: 15px;">
                                        📄 <strong>Auftragsverarbeitungsvertrag (AV-Vertrag)</strong>
                                    </p>
                                    <a href="<?php echo esc_url( GERMANFENCE_PLUGIN_URL . 'data/av-vertrag.pdf' ); ?>" 
                                       target="_blank" 
                                       class="germanfence-btn-secondary"
                                       style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #22D6DD; color: #fff; text-decoration: none; border-radius: 9px; font-weight: 600; font-size: 15px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                        <span class="dashicons dashicons-download" style="font-size: 18px;"></span>
                                        AV-Vertrag herunterladen (PDF)
                                    </a>
                                    <p style="margin: 10px 0 0 0; color: #646970; font-size: 15px;">
                                        Rechtlich verbindlicher Vertrag zur Auftragsverarbeitung gem. Art. 28 DSGVO
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="germanfence-footer">
                    <div style="text-align: center; padding: 20px; color: #646970; font-size: 15px;">
                        <div style="margin-bottom: 15px; font-weight: 600; color: #22D6DD;">
                            GermanFence by GermanCore
                        </div>
                        <div style="font-size: 15px;">
                            <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&show=agb') ); ?>" style="color: #646970; text-decoration: none; margin: 0 10px;">AGB</a>
                            <span style="color: #c3cbd5;">|</span>
                            <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&show=datenschutz') ); ?>" style="color: #646970; text-decoration: none; margin: 0 10px;">Datenschutz</a>
                            <span style="color: #c3cbd5;">|</span>
                            <a href="<?php echo esc_url( admin_url('admin.php?page=germanfence&show=impressum') ); ?>" style="color: #646970; text-decoration: none; margin: 0 10px;">Impressum</a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <?php
    }
    
    private function save_settings() {
        GermanFence_Logger::log_save('save_settings() wird aufgerufen');
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in render_admin_page() before calling this function
        
        // Phrasen aus Textarea verarbeiten
        $blocked_phrases = array();
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified above
        if (!empty($_POST['blocked_phrases_text'])) {
            $phrases_text = sanitize_textarea_field(wp_unslash($_POST['blocked_phrases_text']));
            
            // Regex-Modus: Zeilen-getrennt, Normal-Modus: Komma-getrennt
            if (isset($_POST['phrase_regex_mode'])) {
                $phrases_array = explode("\n", $phrases_text);
            } else {
                $phrases_array = explode(',', $phrases_text);
            }
            
            $blocked_phrases = array_filter(array_map('trim', $phrases_array));
        }
        
        // Honeypot-Felder verarbeiten
        $honeypot_fields = array();
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified above
        if (isset($_POST['honeypot_fields']) && is_array($_POST['honeypot_fields'])) {
            $honeypot_fields = array_map('sanitize_text_field', wp_unslash($_POST['honeypot_fields']));
            $honeypot_fields = array_filter($honeypot_fields); // Leere entfernen
        }
        
        // phpcs:disable WordPress.Security.NonceVerification.Missing -- Nonce verified above, all $_POST checks below are safe
        $settings = array(
            'honeypot_enabled' => isset($_POST['honeypot_enabled']) ? '1' : '0',
            'honeypot_count' => intval(wp_unslash($_POST['honeypot_count'] ?? 3)),
            'honeypot_fields' => $honeypot_fields,
            'basic_protection_enabled' => isset($_POST['basic_protection_enabled']) ? '1' : '0',
            'rate_limit_enabled' => isset($_POST['rate_limit_enabled']) ? '1' : '0',
            'duplicate_check_enabled' => isset($_POST['duplicate_check_enabled']) ? '1' : '0',
            'http_headers_check' => isset($_POST['http_headers_check']) ? '1' : '0',
            'timestamp_enabled' => isset($_POST['timestamp_enabled']) ? '1' : '0',
            'timestamp_min' => intval(wp_unslash($_POST['timestamp_min'] ?? 3)),
            'timestamp_max' => intval(wp_unslash($_POST['timestamp_max'] ?? 3600)),
            'javascript_check' => isset($_POST['javascript_check']) ? '1' : '0',
            'user_agent_check' => isset($_POST['user_agent_check']) ? '1' : '0',
            'typing_speed_check' => isset($_POST['typing_speed_check']) ? '1' : '0',
            'block_comment_bots' => isset($_POST['block_comment_bots']) ? '1' : '0',
            'test_mode_block_all' => isset($_POST['test_mode_block_all']) ? '1' : '0',
            'url_limit_enabled' => isset($_POST['url_limit_enabled']) ? '1' : '0',
            'url_limit_max' => intval(wp_unslash($_POST['url_limit_max'] ?? 1)),
            'domain_blocking_enabled' => isset($_POST['domain_blocking_enabled']) ? '1' : '0',
            'blocked_domains' => sanitize_textarea_field(wp_unslash($_POST['blocked_domains'] ?? '.xyz, .top, .click, .loan, .gq, .ml, .cf, .tk, .ga')),
            'login_limit_enabled' => isset($_POST['login_limit_enabled']) ? '1' : '0',
            'login_max_attempts' => intval(wp_unslash($_POST['login_max_attempts'] ?? 3)),
            'login_lockout_duration' => intval(wp_unslash($_POST['login_lockout_duration'] ?? 30)),
            'geo_blocking_enabled' => isset($_POST['geo_blocking_enabled']) ? '1' : '0',
            'blocked_countries' => isset($_POST['blocked_countries']) && is_array($_POST['blocked_countries']) ? array_map('sanitize_text_field', wp_unslash($_POST['blocked_countries'])) : array(),
            'phrase_blocking_enabled' => isset($_POST['phrase_blocking_enabled']) ? '1' : '0',
            'phrase_regex_mode' => isset($_POST['phrase_regex_mode']) ? '1' : '0',
            'blocked_phrases' => $blocked_phrases,
            'badge_enabled' => isset($_POST['badge_enabled']) ? '1' : '0',
            'badge_display_type' => sanitize_text_field(wp_unslash($_POST['badge_display_type'] ?? 'global')),
            'badge_position' => sanitize_text_field(wp_unslash($_POST['badge_position'] ?? 'bottom-right')),
            'badge_text' => sanitize_text_field(wp_unslash($_POST['badge_text'] ?? 'Geschützt durch GermanFence')),
            'badge_text_color' => sanitize_text_field(wp_unslash($_POST['badge_text_color'] ?? '#1d2327')),
            'badge_border_color' => sanitize_text_field(wp_unslash($_POST['badge_border_color'] ?? '#22D6DD')),
            'badge_background_color' => sanitize_text_field(wp_unslash($_POST['badge_background_color'] ?? '#ffffff')),
            'badge_shadow_color' => sanitize_text_field(wp_unslash($_POST['badge_shadow_color'] ?? '#22D6DD')),
            'badge_border_radius' => intval(wp_unslash($_POST['badge_border_radius'] ?? 6)),
            'badge_custom_image' => sanitize_text_field(wp_unslash($_POST['badge_custom_image'] ?? '')),
            'block_admin_notices' => isset($_POST['block_admin_notices']) ? '1' : '0',
            'block_plugin_ads' => isset($_POST['block_plugin_ads']) ? '1' : '0',
            'block_update_notices' => isset($_POST['block_update_notices']) ? '1' : '0',
            'block_review_requests' => isset($_POST['block_review_requests']) ? '1' : '0',
            'script_position' => sanitize_text_field(wp_unslash($_POST['script_position'] ?? 'footer')),
            'defer_scripts' => isset($_POST['defer_scripts']) ? '1' : '0',
            'block_comment_bots' => isset($_POST['block_comment_bots']) ? '1' : '0',
            'block_wp_update_emails' => isset($_POST['block_wp_update_emails']) ? '1' : '0',
            'telemetry_enabled' => isset($_POST['telemetry_enabled']) ? '1' : '0',
        );
        // phpcs:enable WordPress.Security.NonceVerification.Missing
        
        // FREE Version: Badge MUSS aktiviert sein (Zwingend)
        $license = GermanFence_License::get_instance();
        $package_type = $license->get_package_type();
        if ($package_type === 'FREE') {
            $settings['badge_enabled'] = '1'; // Badge immer an bei FREE
            GermanFence_Logger::log_save('FREE Version: Badge zwingend aktiviert');
        }
        
        GermanFence_Logger::log_save('Einstellungen vorbereitet', $settings);
        
        $result = update_option('germanfence_settings', $settings);
        
        if ($result) {
            GermanFence_Logger::log_save('update_option() erfolgreich');
        } else {
            GermanFence_Logger::log_error('update_option() fehlgeschlagen oder keine Änderung');
        }
        
        // Verify
        $saved = get_option('germanfence_settings', array());
        GermanFence_Logger::log_save('Gespeicherte Einstellungen verifiziert', array('count' => count($saved)));
    }
    
    private function get_flag_emoji($code) {
        // Konvertiere Ländercode zu Unicode Flaggen-Emoji (keine externen Requests)
        $code = strtoupper($code);
        if ($code === 'LOCAL') {
            return '🏠';
        }
        
        // Konvertiere Ländercode zu Unicode Regional Indicator Symbols
        // Jeder Buchstabe wird zu seinem Regional Indicator Symbol Letter konvertiert
        // A = U+1F1E6, B = U+1F1E7, etc.
        if (strlen($code) !== 2) {
            return '🌍';
        }
        
        $first = mb_chr(0x1F1E6 + (ord($code[0]) - ord('A')));
        $second = mb_chr(0x1F1E6 + (ord($code[1]) - ord('A')));
        
        return $first . $second;
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
            'CG' => 'Kongo', 'CR' => 'Costa Rica', 'HR' => 'Kroatien', 'CU' => 'Kuba',
            'CY' => 'Zypern', 'CZ' => 'Tschechien', 'DK' => 'Dänemark', 'DJ' => 'Dschibuti',
            'DM' => 'Dominica', 'DO' => 'Dominikanische Republik', 'EC' => 'Ecuador', 'EG' => 'Ägypten',
            'SV' => 'El Salvador', 'GQ' => 'Äquatorialguinea', 'ER' => 'Eritrea', 'EE' => 'Estland',
            'ET' => 'Äthiopien', 'FJ' => 'Fidschi', 'FI' => 'Finnland', 'FR' => 'Frankreich',
            'GA' => 'Gabun', 'GM' => 'Gambia', 'GE' => 'Georgien', 'DE' => 'Deutschland',
            'GH' => 'Ghana', 'GR' => 'Griechenland', 'GD' => 'Grenada', 'GT' => 'Guatemala',
            'GN' => 'Guinea', 'GW' => 'Guinea-Bissau', 'GY' => 'Guyana', 'HT' => 'Haiti',
            'HN' => 'Honduras', 'HK' => 'Hongkong', 'HU' => 'Ungarn', 'IS' => 'Island',
            'IN' => 'Indien', 'ID' => 'Indonesien', 'IR' => 'Iran', 'IQ' => 'Irak',
            'IE' => 'Irland', 'IL' => 'Israel', 'IT' => 'Italien', 'JM' => 'Jamaika',
            'JP' => 'Japan', 'JO' => 'Jordanien', 'KZ' => 'Kasachstan', 'KE' => 'Kenia',
            'KW' => 'Kuwait', 'KG' => 'Kirgisistan', 'LA' => 'Laos', 'LV' => 'Lettland',
            'LB' => 'Libanon', 'LS' => 'Lesotho', 'LR' => 'Liberia', 'LY' => 'Libyen',
            'LI' => 'Liechtenstein', 'LT' => 'Litauen', 'LU' => 'Luxemburg', 'MK' => 'Nordmazedonien',
            'MG' => 'Madagaskar', 'MW' => 'Malawi', 'MY' => 'Malaysia', 'MV' => 'Malediven',
            'ML' => 'Mali', 'MT' => 'Malta', 'MR' => 'Mauretanien', 'MU' => 'Mauritius',
            'MX' => 'Mexiko', 'MD' => 'Moldau', 'MC' => 'Monaco', 'MN' => 'Mongolei',
            'ME' => 'Montenegro', 'MA' => 'Marokko', 'MZ' => 'Mosambik', 'MM' => 'Myanmar',
            'NA' => 'Namibia', 'NP' => 'Nepal', 'NL' => 'Niederlande', 'NZ' => 'Neuseeland',
            'NI' => 'Nicaragua', 'NE' => 'Niger', 'NG' => 'Nigeria', 'NO' => 'Norwegen',
            'OM' => 'Oman', 'PK' => 'Pakistan', 'PA' => 'Panama', 'PG' => 'Papua-Neuguinea',
            'PY' => 'Paraguay', 'PE' => 'Peru', 'PH' => 'Philippinen', 'PL' => 'Polen',
            'PT' => 'Portugal', 'QA' => 'Katar', 'RO' => 'Rumänien', 'RU' => 'Russland',
            'RW' => 'Ruanda', 'SA' => 'Saudi-Arabien', 'SN' => 'Senegal', 'RS' => 'Serbien',
            'SC' => 'Seychellen', 'SL' => 'Sierra Leone', 'SG' => 'Singapur', 'SK' => 'Slowakei',
            'SI' => 'Slowenien', 'SO' => 'Somalia', 'ZA' => 'Südafrika', 'KR' => 'Südkorea',
            'ES' => 'Spanien', 'LK' => 'Sri Lanka', 'SD' => 'Sudan', 'SR' => 'Suriname',
            'SE' => 'Schweden', 'CH' => 'Schweiz', 'SY' => 'Syrien', 'TW' => 'Taiwan',
            'TJ' => 'Tadschikistan', 'TZ' => 'Tansania', 'TH' => 'Thailand', 'TG' => 'Togo',
            'TO' => 'Tonga', 'TT' => 'Trinidad und Tobago', 'TN' => 'Tunesien', 'TR' => 'Türkei',
            'TM' => 'Turkmenistan', 'UG' => 'Uganda', 'UA' => 'Ukraine', 'AE' => 'Vereinigte Arabische Emirate',
            'GB' => 'Vereinigtes Königreich', 'US' => 'Vereinigte Staaten', 'UY' => 'Uruguay', 'UZ' => 'Usbekistan',
            'VU' => 'Vanuatu', 'VE' => 'Venezuela', 'VN' => 'Vietnam', 'YE' => 'Jemen',
            'ZM' => 'Sambia', 'ZW' => 'Simbabwe'
        );
    }
}


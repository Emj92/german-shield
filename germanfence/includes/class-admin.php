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
    }
    
    public function ajax_clear_log() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Keine Berechtigung');
        }
        
        GermanFence_Logger::clear_log();
        wp_send_json_success('Log erfolgreich geleert');
    }
    
    public function add_admin_menu() {
        GermanFence_Logger::log_admin('add_admin_menu() wird aufgerufen');
        
        // Hauptmenü mit eigenem Logo
        $icon_url = GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence_logo.png';
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
            'Einstellungen',
            '⚙️ Einstellungen',
            'manage_options',
            'germanfence&tab=settings',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'germanfence',
            'Lizenz',
            '🔑 Lizenz',
            'manage_options',
            'germanfence&tab=license',
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
                width: 20px !important;
                height: 20px !important;
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
        $active_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';

        // DEBUG: Zeige rohe POST-Daten oben (nur temporär)
        if (!empty($_POST)) {
            GermanFence_Logger::log_admin('POST-Daten empfangen', array('count' => count($_POST), 'keys' => array_keys($_POST)));
            echo '<div class="notice notice-info" style="margin: 20px 20px 0 0;"><p><strong>GermanFence Debug:</strong> POST-Daten empfangen (' . count($_POST) . ' Felder).</p></div>';
        }

        // Speichern verarbeiten (NOCH OHNE Nonce, um Fehler auszuschließen)
        if (isset($_POST['germanfence_save_settings'])) {
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

        $free_manager = new GermanFence_Free_License();
        
        // WICHTIG: Immer frisch aus DB laden, nicht cachen
        wp_cache_delete('germanfence_free_verified', 'options');
        wp_cache_delete('germanfence_free_email', 'options');
        
        $is_free_active = $free_manager->is_free_active();
        $free_email = $free_manager->get_verified_email();
        
        GermanFence_Logger::log_admin('[LICENSE-CHECK] Free aktiv: ' . ($is_free_active ? 'JA' : 'NEIN') . ', Email: ' . $free_email . ', License valid: ' . ($license_status['is_valid'] ? 'JA' : 'NEIN'));

        // Rechtstexte anzeigen wenn ?show=agb/datenschutz/impressum
        if (isset($_GET['show']) && in_array($_GET['show'], array('agb', 'datenschutz', 'impressum'))) {
            $legal_page = sanitize_text_field($_GET['show']);
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
                        <img src="<?php echo GERMANFENCE_PLUGIN_URL; ?>assets/images/germanfence_logo.png" alt="GermanFence" class="germanfence-logo-img" style="height: 60px; width: auto; margin-right: 15px;">
                        GermanFence
                        <span class="germanfence-version">v<?php echo GERMANFENCE_VERSION; ?></span>
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
                            <span class="language-flag">🇩🇪</span>
                            <span class="language-code" style="font-size: 11px; font-weight: 700; margin-left: 3px;">DE</span>
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
                    $day_of_year = date('z');
                    $quote_index = $day_of_year % count($daily_quotes);
                    $todays_quote = $daily_quotes[$quote_index];
                    ?>
                    
                    <div class="germanfence-quote-of-day">
                        <div style="font-size: 11px; color: #22D6DD; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 5px; text-transform: uppercase;">
                            💡 Spruch des Tages
                        </div>
                        <div style="font-size: 14px; color: #1d2327; font-style: italic; line-height: 1.4;">
                            "<?php echo esc_html($todays_quote); ?>"
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="germanfence-tabs">
                <button class="germanfence-tab <?php echo $active_tab === 'dashboard' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>" data-tab="dashboard" <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>>
                    <span class="dashicons dashicons-dashboard"></span>
                    Dashboard
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'antispam' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>" data-tab="antispam" <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>>
                    <span class="dashicons dashicons-shield-alt"></span>
                    Anti-Spam
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'geo' ? 'active' : ''; ?> <?php echo !$license_status['is_valid'] ? 'pro-feature' : ''; ?> <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>" data-tab="geo" <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>>
                    <span class="dashicons dashicons-location"></span>
                    GEO Blocking
                    <?php if (!$license_status['is_valid']): ?>
                        <span class="pro-badge">PRO</span>
                    <?php endif; ?>
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'phrases' ? 'active' : ''; ?> <?php echo !$license_status['is_valid'] ? 'pro-feature' : ''; ?> <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>" data-tab="phrases" <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>>
                    <span class="dashicons dashicons-editor-removeformatting"></span>
                    Phrasen-Blocking
                    <?php if (!$license_status['is_valid']): ?>
                        <span class="pro-badge">PRO</span>
                    <?php endif; ?>
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'notices' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>" data-tab="notices" <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>>
                    <span class="dashicons dashicons-bell"></span>
                    WordPress Spam
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'settings' ? 'active' : ''; ?> <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>" data-tab="settings" <?php echo (!$is_free_active && !$license_status['is_valid']) ? 'disabled' : ''; ?>>
                    <span class="dashicons dashicons-admin-settings"></span>
                    Einstellungen
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?><span class="lock-badge">🔒</span><?php endif; ?>
                </button>
                <button class="germanfence-tab <?php echo $active_tab === 'license' ? 'active' : ''; ?>" data-tab="license">
                    <span class="dashicons dashicons-admin-network"></span>
                    Lizenz
                </button>
            </div>
            
            <form method="post" action="<?php echo esc_url(admin_url('admin.php?page=germanfence')); ?>">
                <?php wp_nonce_field('germanfence_settings', 'germanfence_nonce'); ?>
                
                <!-- Dashboard Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'dashboard' ? 'active' : ''; ?>" id="tab-dashboard">
                    
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?>
                        <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%); padding: 40px; border-radius: 8px; border: 2px solid #EC4899; text-align: center; margin: 20px 0;">
                            <span style="font-size: 64px;">🔒</span>
                            <h2 style="margin: 20px 0 10px 0; color: #EC4899;">Plugin nicht aktiviert</h2>
                            <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 16px;">
                                Bitte verifiziere deine E-Mail oder aktiviere eine Lizenz, um GermanFence zu nutzen.
                            </p>
                            <a href="<?php echo admin_url('admin.php?page=germanfence&tab=license'); ?>" class="germanfence-btn-primary">
                                Zur Lizenz-Verwaltung →
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
                                <h3><?php echo $stats['block_rate']; ?>%</h3>
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
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h2 style="margin: 0;">Letzte Anfragen</h2>
                            
                            <!-- Filter Buttons -->
                            <div class="stats-filter-buttons" style="display: flex; gap: 10px;">
                                <button type="button" class="stats-filter-btn active" data-filter="all" style="padding: 8px 16px; border: 2px solid #22D6DD; background: #22D6DD; color: #fff; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    📊 Alle
                                </button>
                                <button type="button" class="stats-filter-btn" data-filter="blocked" style="padding: 8px 16px; border: 2px solid #F06292; background: transparent; color: #F06292; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    🚫 Geblockt
                                </button>
                                <button type="button" class="stats-filter-btn" data-filter="legitimate" style="padding: 8px 16px; border: 2px solid #22D6DD; background: transparent; color: #22D6DD; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                    ✅ Legitim
                                </button>
                            </div>
                        </div>
                        
                        <div style="max-height: 500px; overflow-y: auto; border: 1px solid #dcdcde; border-radius: 6px;">
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
                                        <td><?php echo esc_html(date('d.m.Y H:i', strtotime($entry->created_at))); ?></td>
                                        <td>
                                            <?php if ($entry->type === 'blocked'): ?>
                                                <span class="block-type-badge blocked" style="background: rgba(240, 98, 146, 0.1); color: #F06292; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 11px;">🚫 GEBLOCKT</span>
                                            <?php else: ?>
                                                <span class="block-type-badge legitimate" style="background: rgba(34, 214, 221, 0.1); color: #22D6DD; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 11px;">✅ LEGITIM</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php echo esc_html($entry->ip_address); ?></td>
                                        <td>
                                            <?php if ($entry->country): ?>
                                                <span style="font-size: 18px; margin-right: 5px;"><?php echo $this->get_flag_emoji($entry->country); ?></span>
                                                <span><?php echo esc_html($entry->country); ?></span>
                                            <?php else: ?>
                                                <span style="color: #999;">-</span>
                                            <?php endif; ?>
                                        </td>
                                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            <?php echo esc_html($entry->reason ?? '-'); ?>
                                        </td>
                                        <td>
                                            <button type="button" class="view-details-btn" data-id="<?php echo esc_attr($entry->id); ?>" style="padding: 6px 12px; background: #22D6DD; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;">
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
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?>
                        <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(240, 98, 146, 0.1) 100%); padding: 40px; border-radius: 8px; border: 2px solid #ef4444; text-align: center; margin: 20px;">
                            <span style="font-size: 64px;">🔒</span>
                            <h2 style="margin: 20px 0 10px 0; color: #ef4444;">Plugin nicht aktiviert</h2>
                            <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 16px;">
                                Bitte verifiziere deine E-Mail oder aktiviere eine Lizenz, um GermanFence zu nutzen.
                            </p>
                            <a href="<?php echo admin_url('admin.php?page=germanfence&tab=license'); ?>" class="germanfence-btn-primary">
                                Zur Lizenz-Verwaltung →
                            </a>
                        </div>
                    <?php else: ?>
                    <div class="germanfence-section">
                        <h2>🛡️ Anti-Spam Methoden</h2>
                        
                        <!-- Zeile 1: Honeypot + JavaScript -->
                        <div class="germanfence-settings-grid">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="honeypot_enabled" value="1" <?php checked($settings['honeypot_enabled'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Honeypot</h3>
                                    <p>Unsichtbares Feld, das nur Bots ausfüllen. Sehr effektiv und benutzerfreundlich.</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="javascript_check" value="1" <?php checked(isset($settings['javascript_check']) && $settings['javascript_check'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>JavaScript-Prüfung</h3>
                                    <p>Stellt sicher, dass JavaScript aktiviert ist. Blockiert einfache Bots.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Honeypot-Einstellungen (full-width UNTER Honeypot+JavaScript) -->
                        <div class="germanfence-subsetting" id="honeypot-settings" style="<?php echo $settings['honeypot_enabled'] !== '1' ? 'display:none;' : ''; ?>">
                            <h3 style="margin-bottom: 20px;">🍯 Honeypot-Verwaltung</h3>
                            
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
                                    <div class="honeypot-field-item" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #F2F5F8; border: 1px solid #c3cbd5; border-radius: 6px; margin-bottom: 10px;">
                                        <span style="min-width: 30px; font-weight: 600; color: #646970;">#<?php echo $index + 1; ?></span>
                                        <input 
                                            type="text" 
                                            name="honeypot_fields[]" 
                                            value="<?php echo esc_attr($field_name); ?>"
                                            style="flex: 1; padding: 8px 12px; border: 1px solid #c3cbd5; border-radius: 6px; font-family: monospace;"
                                            placeholder="feldname"
                                        >
                                        <button 
                                            type="button" 
                                            class="regenerate-honeypot-btn"
                                            data-index="<?php echo $index; ?>"
                                            style="padding: 8px 12px; background: #22D6DD; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;"
                                            title="Neu generieren"
                                        >
                                            <span class="dashicons dashicons-update"></span>
                                        </button>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                                <p class="description" style="margin-top: 10px;">
                                    💡 <strong>Tipp:</strong> Benutze realistische Feldnamen wie "website_url" oder "contact_link". 
                                    Das <span class="dashicons dashicons-update" style="font-size: 14px;"></span> Symbol generiert einen neuen zufälligen Namen.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Zeile 2: User-Agent + Tippgeschwindigkeit -->
                        <div class="germanfence-settings-grid">
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="user_agent_check" value="1" <?php checked(isset($settings['user_agent_check']) && $settings['user_agent_check'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>User-Agent-Prüfung</h3>
                                    <p>Blockiert bekannte Bot User-Agents.</p>
                                </div>
                            </div>
                            
                            <div class="germanfence-setting">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="typing_speed_check" value="1" <?php checked(isset($settings['typing_speed_check']) && $settings['typing_speed_check'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Tippgeschwindigkeit-Analyse</h3>
                                    <p>Erkennt unnatürlich schnelle Bot-Eingaben.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Zeile 3: Timestamp + Kommentar-Bots -->
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
                                    <input type="checkbox" name="block_comment_bots" value="1" <?php checked(isset($settings['block_comment_bots']) && $settings['block_comment_bots'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="setting-info">
                                    <h3>Kommentar-Bots blockieren</h3>
                                    <p>Blockiert automatisierte Bot-Kommentare durch erweiterte Anti-Spam-Prüfungen.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Timestamp-Einstellungen (full-width UNTER Timestamp+Kommentar-Bots) -->
                        <div class="germanfence-subsetting" id="timestamp-settings" style="<?php echo $settings['timestamp_enabled'] !== '1' ? 'display:none;' : ''; ?>">
                            <h3 style="margin-bottom: 20px;">⏱️ Timestamp-Einstellungen</h3>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 10px;"><strong>Minimale Ausfüllzeit (Sekunden):</strong></label>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <input 
                                        type="number" 
                                        name="timestamp_min"
                                        min="1" 
                                        max="60" 
                                        value="<?php echo esc_attr($settings['timestamp_min'] ?? 3); ?>"
                                        style="width: 100px; padding: 10px; border: 1px solid #c3cbd5; border-radius: 6px; font-size: 16px;"
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
                                        style="width: 100px; padding: 10px; border: 1px solid #c3cbd5; border-radius: 6px; font-size: 16px;"
                                    >
                                    <span style="color: #646970;">Sekunden (<?php echo esc_html(round(($settings['timestamp_max'] ?? 3600) / 60)); ?> Min)</span>
                                </div>
                                <p class="description" style="margin-top: 5px;">
                                    Formulare, die nach dieser Zeit abgesendet werden, sind ungültig. Empfohlen: 3600 (1 Stunde)
                                </p>
                            </div>
                        </div>
                        
                        <div class="germanfence-setting" style="border: 2px solid #F06292; background: rgba(240, 98, 146, 0.05); padding: 20px; border-radius: 6px; margin-top: 20px;">
                            <label class="germanfence-toggle">
                                <input type="checkbox" name="test_mode_block_all" value="1" <?php checked(isset($settings['test_mode_block_all']) && $settings['test_mode_block_all'] === '1'); ?>>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="setting-info">
                                <h3 style="color: #F06292;">🧪 TEST-MODUS: Alle Anfragen blockieren</h3>
                                <p style="color: #F06292; font-weight: 600;">⚠️ ACHTUNG: Blockiert ALLE Formular-Submissions! Nur für Tests verwenden!</p>
                                <p style="color: #888; font-size: 13px; margin-top: 10px;">Nutze dies um zu testen, ob die Blocking-Routine funktioniert. Deaktiviere es danach wieder!</p>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- GEO Blocking Tab (NEU: Separates System) -->
                <?php
                $geo = new GermanFence_GeoBlocking();
                $geo->render_tab($settings, $license_info);
                ?>
                
                <!-- Phrase Blocking Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'phrases' ? 'active' : ''; ?>" id="tab-phrases">
                    <div class="germanfence-section">
                        <h2>🚫 Phrasen-Blocking</h2>
                        
                        <?php if (!$license_status['is_valid']): ?>
                            <div style="background: rgba(34, 214, 221, 0.1); padding: 30px; border-radius: 6px; border: 2px solid rgba(34, 214, 221, 0.3); text-align: center; margin-bottom: 20px;">
                                <span style="font-size: 48px;">🔒</span>
                                <h3 style="color: #22D6DD; margin: 15px 0 10px 0;">PRO-Feature</h3>
                                <p style="color: #50575e; margin: 0 0 20px 0;">
                                    Phrasen-Blocking ist nur mit einer aktiven Lizenz verfügbar.
                                </p>
                                <a href="<?php echo admin_url('admin.php?page=germanfence&tab=license'); ?>" class="germanfence-btn-primary">
                                    Jetzt Lizenz aktivieren →
                                </a>
                            </div>
                        <?php else: ?>
                        
                        <div class="germanfence-setting">
                            <label class="germanfence-toggle">
                                <input type="checkbox" name="phrase_blocking_enabled" value="1" <?php checked($settings['phrase_blocking_enabled'] === '1'); ?>>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="setting-info">
                                <h3>Phrasen-Blocking aktivieren</h3>
                                <p>Blockiere Formulare, die bestimmte Wörter oder Phrasen enthalten.</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-subsetting" id="phrase-settings" style="<?php echo $settings['phrase_blocking_enabled'] !== '1' ? 'display:none;' : ''; ?>">
                            <h3>Blockierte Phrasen</h3>
                            
                            <!-- Regex-Modus Toggle -->
                            <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                                <label class="germanfence-toggle">
                                    <input type="checkbox" name="phrase_regex_mode" value="1" <?php checked(isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1'); ?>>
                                    <span class="toggle-slider"></span>
                                </label>
                                <div>
                                    <strong style="font-size: 14px; color: #1d2327;">🔧 Regex-Modus</strong>
                                    <span class="description" style="margin-left: 8px;">Erweiterte Muster-Erkennung aktivieren</span>
                                </div>
                            </div>
                            
                            <p class="description" style="margin-bottom: 10px;">
                                <span id="phrase-help-normal" style="<?php echo (isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1') ? 'display:none;' : ''; ?>">
                                    Geben Sie Wörter oder Phrasen ein, die blockiert werden sollen. Trennen Sie mehrere Einträge mit <strong>Komma</strong>.
                                </span>
                                <span id="phrase-help-regex" style="<?php echo (isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1') ? '' : 'display:none;'; ?>">
                                    <strong>Regex-Modus:</strong> Geben Sie Regex-Muster ein (ein Muster pro Zeile). Jedes Muster wird als regulärer Ausdruck interpretiert.
                                </span>
                            </p>
                            
                            <textarea 
                                name="blocked_phrases_text" 
                                rows="8" 
                                style="width: 100%; max-width: 600px; padding: 12px; border: 1px solid #c3cbd5; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px;"
                                placeholder="<?php echo (isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1') ? 'z.B.: V.*i.*a.*g.*r.*a' : 'z.B.: casino, viagra, lottery, cheap pills'; ?>"
                            ><?php 
                                $phrases = $settings['blocked_phrases'] ?? array();
                                if (isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1') {
                                    // Regex-Modus: Eine pro Zeile
                                    echo esc_textarea(implode("\n", $phrases));
                                } else {
                                    // Normal-Modus: Komma-getrennt
                                    echo esc_textarea(implode(', ', $phrases));
                                }
                            ?></textarea>
                            
                            <div id="phrase-examples-normal" style="margin-top: 10px; <?php echo (isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1') ? 'display:none;' : ''; ?>">
                                <p class="description" style="color: #646970;">
                                    <strong>Beispiele:</strong> <code>spam, viagra, casino, gewinnspiel, lottery</code>
                                </p>
                            </div>
                            
                            <div id="phrase-examples-regex" style="margin-top: 10px; <?php echo (isset($settings['phrase_regex_mode']) && $settings['phrase_regex_mode'] === '1') ? '' : 'display:none;'; ?>">
                                <div style="background: rgba(34, 214, 221, 0.08); border: 1px solid rgba(34, 214, 221, 0.3); border-radius: 6px; padding: 15px;">
                                    <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #22D6DD;">
                                        💡 Regex-Beispiele
                                    </h4>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 5px 10px 5px 0; font-family: 'Courier New', monospace; color: #D63638; font-weight: 600;">
                                                V.*i.*a.*g.*r.*a
                                            </td>
                                            <td style="padding: 5px 0; color: #646970; font-size: 13px;">
                                                Findet: Viagra, V-i-a-g-r-a, V111iagra, V...i...a...
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 10px 5px 0; font-family: 'Courier New', monospace; color: #D63638; font-weight: 600;">
                                                c[a@4]s[i1!]n[o0]
                                            </td>
                                            <td style="padding: 5px 0; color: #646970; font-size: 13px;">
                                                Findet: casino, cas1no, c@sino, cas!n0
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 10px 5px 0; font-family: 'Courier New', monospace; color: #D63638; font-weight: 600;">
                                                \b(buy|click)\s+here\b
                                            </td>
                                            <td style="padding: 5px 0; color: #646970; font-size: 13px;">
                                                Findet: "buy here", "click here" (ganze Wörter)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 10px 5px 0; font-family: 'Courier New', monospace; color: #D63638; font-weight: 600;">
                                                \d{10,}
                                            </td>
                                            <td style="padding: 5px 0; color: #646970; font-size: 13px;">
                                                Findet: 10+ aufeinanderfolgende Zahlen
                                            </td>
                                        </tr>
                                    </table>
                                    <p class="description" style="margin: 10px 0 0 0; color: #646970; font-size: 12px;">
                                        <strong>Tipp:</strong> <code>.*</code> = beliebige Zeichen, <code>[a@4]</code> = a oder @ oder 4, <code>\b</code> = Wortgrenze, <code>\d</code> = Ziffer
                                    </p>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- WordPress Spam Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'notices' ? 'active' : ''; ?>" id="tab-notices">
                    <div class="germanfence-section">
                        <h2>🔕 WordPress Spam blockieren</h2>
                        <p class="description" style="margin-bottom: 20px;">
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
                                    <h3>📧 WordPress Update-E-Mails blockieren</h3>
                                    <p>Blockiert automatische E-Mail-Benachrichtigungen über verfügbare Plugin-, Theme- und Core-Updates. Updates bleiben weiterhin möglich, nur die E-Mails werden unterdrückt.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(34, 214, 221, 0.1); padding: 20px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #22D6DD;">
                            <h3 style="margin-top: 0; color: #22D6DD;">⚠️ Hinweis</h3>
                            <p style="color: #50575e; margin: 0;">
                                Kritische Sicherheits- und Fehler-Meldungen werden NICHT blockiert, um die Sicherheit deiner Website zu gewährleisten.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Lizenz Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'license' ? 'active' : ''; ?>" id="tab-license">
                    <div class="germanfence-section">
                        <h2>🔑 Lizenz-Verwaltung</h2>
                        
                                <?php
                        $license_status = $license_manager->check_license();
                        
                        // Lizenz aktivieren
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
                        
                        // Lizenz deaktivieren
                        if (isset($_POST['deactivate_license'])) {
                            $result = $license_manager->deactivate_license();
                            add_settings_error('germanfence_messages', 'germanfence_message', $result['message'], 'success');
                            settings_errors('germanfence_messages');
                            $license_info = $license_manager->get_license_info();
                            $license_status = $license_manager->check_license();
                        }
                        
                        // Free-Version deaktivieren
                        if (isset($_POST['deactivate_free'])) {
                            $result = $free_manager->deactivate_free();
                            add_settings_error('germanfence_messages', 'germanfence_message', $result['message'], 'success');
                            settings_errors('germanfence_messages');
                            $is_free_active = $free_manager->is_free_active();
                            $free_email = $free_manager->get_verified_email();
                            $license_info = $license_manager->get_license_info();
                        }
                        ?>
                        
                        <!-- LIZENZ-VERWALTUNG: 2-Spalten Layout -->
                        <?php if (empty($license_info['has_license']) || empty($license_status['is_valid'])): ?>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        
                        <!-- FREE VERSION BOX -->
                        <div style="background: #F2F5F8; padding: 25px; border-radius: 8px; border: 2px solid #22D6DD; min-height: 280px; display: flex; flex-direction: column;">
                            <?php if ($is_free_active): ?>
                                <?php $current_key = $free_manager->get_license_key(); ?>
                                <h3 style="margin: 0 0 15px 0; color: #22D6DD; font-size: 18px;">✅ Kostenlose Version aktiviert</h3>
                                <p style="margin: 0 0 10px 0; color: #1d2327; font-size: 14px;">
                                    <strong>Verifizierte E-Mail:</strong> <?php echo esc_html($free_email); ?>
                                </p>
                                <?php if ($current_key): ?>
                                <div style="margin: 15px 0; padding: 15px; background: #fff; border-radius: 6px; border: 1px solid #22D6DD;">
                                    <p style="margin: 0 0 8px 0; color: #1d2327; font-size: 13px; font-weight: 600;">
                                        🔑 Dein Free-License-Key:
                                    </p>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="text" value="<?php echo esc_attr($current_key); ?>" readonly 
                                            style="flex: 1; padding: 10px; border: 1px solid #c3cbd5; border-radius: 4px; font-family: monospace; font-size: 13px; background: #f9f9f9;">
                                        <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($current_key); ?>'); this.innerHTML='✅ Kopiert!'; setTimeout(() => this.innerHTML='📋 Kopieren', 2000);" 
                                            style="padding: 10px 16px; background: #22D6DD; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                            📋 Kopieren
                                        </button>
                                    </div>
                                    <p style="margin: 8px 0 0 0; color: #646970; font-size: 11px;">
                                        💡 Nutze diesen Key um GermanFence auf weiteren Domains zu aktivieren!
                                    </p>
                                </div>
                                <?php endif; ?>
                                <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 14px;">
                                    Du nutzt die kostenlose Version von GermanFence mit Basis-Funktionen.
                                </p>
                                <form method="post">
                                    <?php wp_nonce_field('germanfence_settings', 'germanfence_nonce'); ?>
                                    <button type="submit" name="deactivate_free" class="germanfence-btn-danger">
                                        Kostenlose Version deaktivieren
                                    </button>
                                </form>
                            <?php else: ?>
                                <div style="flex: 1;">
                                    <h3 style="margin: 0 0 15px 0; color: #22D6DD; font-size: 18px;">🆓 Kostenlose Version aktivieren</h3>
                                    
                                    <!-- Tabs: E-Mail vs Key -->
                                    <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #22D6DD;">
                                        <button type="button" id="free-email-tab" class="germanfence-free-tab active" 
                                            style="flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                                            📧 Per E-Mail
                                        </button>
                                        <button type="button" id="free-key-tab" class="germanfence-free-tab" 
                                            style="flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                                            🔑 Mit License-Key
                                        </button>
                                    </div>
                                    
                                    <!-- E-Mail Aktivierung -->
                                    <div id="free-email-content" class="germanfence-free-content">
                                        <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 14px;">
                                            Gib deine E-Mail-Adresse ein und bestätige sie, um GermanFence kostenlos zu nutzen!
                                        </p>
                                        
                                        <div style="margin-bottom: 20px;">
                                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #1d2327;">E-Mail-Adresse:</label>
                                            <input type="email" id="free-email-input" placeholder="deine@email.de" 
                                                style="width: 100%; padding: 12px; border: 2px solid #22D6DD; border-radius: 6px; font-size: 14px;">
                                        </div>
                                        
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                                            <input type="checkbox" id="free-agb-checkbox" style="margin-top: 4px; cursor: pointer;">
                                            <span style="font-size: 13px; color: #1d2327;">
                                                Ich akzeptiere die <a href="<?php echo admin_url('admin.php?page=germanfence&show=agb'); ?>" style="color: #22D6DD; text-decoration: underline;">AGB</a> und die <a href="<?php echo admin_url('admin.php?page=germanfence&show=datenschutz'); ?>" style="color: #22D6DD; text-decoration: underline;">Datenschutzerklärung</a>
                                            </span>
                                        </label>
                                    </div>
                                        
                                        <div style="text-align: center; margin-top: auto;">
                                            <button type="button" id="register-free-btn" class="germanfence-btn-primary">
                                                <span class="dashicons dashicons-email-alt"></span>
                                                Bestätigungsmail senden
                                            </button>
                                        </div>
                                        
                                        <p style="margin: 15px 0 0 0; color: #646970; font-size: 12px; text-align: center;">
                                            💡 Du erhältst eine E-Mail mit einem Bestätigungslink. Nach der Verifizierung bekommst du einen License-Key!
                                        </p>
                                    </div>
                                    
                                    <!-- Key Aktivierung -->
                                    <div id="free-key-content" class="germanfence-free-content" style="display: none;">
                                        <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 14px;">
                                            Hast du bereits einen Free-License-Key? Gib ihn hier ein!
                                        </p>
                                        
                                        <div style="margin-bottom: 20px;">
                                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #1d2327;">Free-License-Key:</label>
                                            <input type="text" id="free-key-input" placeholder="GS-FREE-XXXXXXXXXXXX" 
                                                style="width: 100%; padding: 12px; border: 2px solid #22D6DD; border-radius: 6px; font-size: 14px; font-family: monospace; text-transform: uppercase;">
                                        </div>
                                        
                                        <div style="text-align: center; margin-top: auto;">
                                            <button type="button" id="activate-free-key-btn" class="germanfence-btn-primary">
                                                <span class="dashicons dashicons-unlock"></span>
                                                Mit Key aktivieren
                                            </button>
                                        </div>
                                        
                                        <p style="margin: 15px 0 0 0; color: #646970; font-size: 12px; text-align: center;">
                                            💡 Den Key erhältst du nach der E-Mail-Verifizierung. Nutze ihn um GermanFence auf weiteren Domains zu aktivieren!
                                        </p>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                        <!-- PRO LIZENZ KAUFEN BOX -->
                        <div style="background: #F2F5F8; padding: 25px; border-radius: 8px; border: 2px solid #22D6DD; min-height: 280px; display: flex; flex-direction: column;">
                            <h3 style="margin: 0 0 15px 0; color: #22D6DD; font-size: 18px;">💎 GermanFence PRO Lizenz</h3>
                            <p style="margin: 0 0 15px 0; color: #1d2327; font-size: 14px; flex: 1;">
                                Noch keine Lizenz? Sichere dir jetzt GermanFence Premium und nutze alle Features!
                            </p>
                            
                            <div style="background: #22D6DD20; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #22D6DD;">
                                <p style="margin: 0; color: #1d2327; font-size: 13px; font-weight: 600; text-align: center;">
                                    ✅ 14 Tage 100% Geld-zurück-Garantie
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin-top: auto;">
                            <a href="https://germanfence.de" target="_blank" class="germanfence-btn-primary" style="display: inline-flex; text-decoration: none;">
                                Jetzt PRO kaufen →
                            </a>
                            </div>
                        </div>
                        
                        </div><!-- Ende 2-Spalten Layout -->
                        <?php endif; ?>
                        
                        <!-- PRO LIZENZ AKTIV -->
                        <?php if (!empty($license_info['has_license']) && !empty($license_status['is_valid'])): ?>
                        <div style="background: #F2F5F8; padding: 25px; border-radius: 8px; border: 2px solid #22D6DD; margin-bottom: 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #22D6DD; font-size: 18px;">✅ GermanFence PRO aktiviert</h3>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 12px;">Paket:</p>
                                    <p style="margin: 0; color: #1d2327; font-size: 14px; font-weight: 600;"><?php echo esc_html($license_info['package_type']); ?></p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 12px;">Gültig bis:</p>
                                    <p style="margin: 0; color: #1d2327; font-size: 14px; font-weight: 600;"><?php echo esc_html($license_info['expires_at']); ?></p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 12px;">Domains:</p>
                                    <p style="margin: 0; color: #1d2327; font-size: 14px; font-weight: 600;"><?php echo esc_html($license_info['active_domains']); ?> / <?php echo esc_html($license_info['max_domains']); ?></p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #646970; font-size: 12px;">Status:</p>
                                    <p style="margin: 0; color: #22D6DD; font-size: 14px; font-weight: 600;">✓ Aktiv</p>
                                </div>
                            </div>
                            
                            <div style="margin: 15px 0; padding: 15px; background: #fff; border-radius: 6px; border: 1px solid #22D6DD;">
                                <p style="margin: 0 0 8px 0; color: #1d2327; font-size: 13px; font-weight: 600;">
                                    🔑 Dein License-Key:
                                </p>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="text" value="<?php echo esc_attr($license_info['license_key']); ?>" readonly 
                                        style="flex: 1; padding: 10px; border: 1px solid #c3cbd5; border-radius: 4px; font-family: monospace; font-size: 13px; background: #f9f9f9;">
                                    <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($license_info['license_key']); ?>'); this.innerHTML='✅ Kopiert!'; setTimeout(() => this.innerHTML='📋 Kopieren', 2000);" 
                                        style="padding: 10px 16px; background: #22D6DD; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                        📋 Kopieren
                                    </button>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px;">
                            <form method="post" style="display: inline;">
                                <button type="submit" name="deactivate_license" class="germanfence-btn-danger">
                                    Lizenz deaktivieren
                                </button>
                            </form>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Debug Log Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'debug' ? 'active' : ''; ?>" id="tab-debug">
                    <div class="germanfence-section">
                        <h2>🔍 Debug Log - Ausführliche Fehlersuche</h2>
                        
                        <div style="background: #d1ecf1; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #0c5460;">
                            <h3 style="margin-top: 0; color: #0c5460;">📋 Vollständiges Debug-Log</h3>
                            <p style="color: #0c5460;">Hier siehst du ALLE Aktionen des Plugins in Echtzeit:</p>
                            <pre style="background: #ffffff; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 11px; max-height: 500px; font-family: 'Courier New', monospace;"><?php 
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
                                        if (isset($_POST['germanfence_nonce'])) {
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
                            <pre style="background: #ffffff; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; max-height: 300px;"><?php 
                                $post_data = $_POST;
                                unset($post_data['germanfence_nonce']);
                                unset($post_data['_wp_http_referer']);
                                echo esc_html(print_r($post_data, true)); 
                            ?></pre>
                        </div>
                        <?php endif; ?>
                        
                        <div style="background: #F2F5F8; padding: 20px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #c3cbd5;">
                            <h3 style="margin-top: 0; color: #1d2327;">💾 Gespeicherte Einstellungen</h3>
                            <pre style="background: #ffffff; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; max-height: 400px; border: 1px solid #c3cbd5;"><?php echo esc_html(print_r($settings, true)); ?></pre>
                        </div>
                        
                        <div style="background: #F2F5F8; padding: 20px; border-radius: 6px;">
                            <h3 style="margin-top: 0;">🔧 System-Info</h3>
                            <table class="germanfence-table">
                                <tr>
                                    <td><strong>WordPress Version:</strong></td>
                                    <td><?php echo get_bloginfo('version'); ?></td>
                                </tr>
                                <tr>
                                    <td><strong>PHP Version:</strong></td>
                                    <td><?php echo PHP_VERSION; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Plugin Version:</strong></td>
                                    <td><?php echo GERMANFENCE_VERSION; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>Admin URL:</strong></td>
                                    <td><?php echo admin_url('admin.php?page=germanfence'); ?></td>
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
                            <p style="margin: 0; color: #50575e;">Zeitpunkt: <?php echo current_time('d.m.Y H:i:s'); ?></p>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Einstellungen Tab -->
                <div class="germanfence-tab-content <?php echo $active_tab === 'settings' ? 'active' : ''; ?>" id="tab-settings">
                    <?php if (!$is_free_active && !$license_status['is_valid']): ?>
                        <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(240, 98, 146, 0.1) 100%); padding: 40px; border-radius: 8px; border: 2px solid #ef4444; text-align: center; margin: 20px;">
                            <span style="font-size: 64px;">🔒</span>
                            <h2 style="margin: 20px 0 10px 0; color: #ef4444;">Plugin nicht aktiviert</h2>
                            <p style="margin: 0 0 20px 0; color: #1d2327; font-size: 16px;">
                                Bitte verifiziere deine E-Mail oder aktiviere eine Lizenz, um GermanFence zu nutzen.
                            </p>
                            <a href="<?php echo admin_url('admin.php?page=germanfence&tab=license'); ?>" class="germanfence-btn-primary">
                                Zur Lizenz-Verwaltung →
                            </a>
                        </div>
                    <?php else: ?>
                    
                    <!-- Performance-Optimierung Section -->
                    <div class="germanfence-section">
                        <h2>⚡ Performance-Optimierung</h2>
                        <p class="description" style="margin-bottom: 20px;">
                            Optimiere die Ladegeschwindigkeit durch die richtige Script-Position.
                        </p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="background: #F2F5F8; padding: 20px; border-radius: 6px; border: 1px solid #c3cbd5;">
                                <h3 style="margin-top: 0; color: #1d2327;">📍 Script-Ladeposition</h3>
                                <div style="margin-top: 15px;">
                                    <label style="display: block; margin-bottom: 10px; cursor: pointer;">
                                        <input type="radio" name="script_position" value="header" <?php checked($settings['script_position'] ?? 'footer', 'header'); ?>>
                                        <strong>Header</strong> - Früh geladen
                                    </label>
                                    <label style="display: block; margin-bottom: 10px; cursor: pointer;">
                                        <input type="radio" name="script_position" value="footer" <?php checked($settings['script_position'] ?? 'footer', 'footer'); ?>>
                                        <strong>Footer</strong> - ⚡ Empfohlen
                                    </label>
                                    <label style="display: block; cursor: pointer;">
                                        <input type="radio" name="script_position" value="body" <?php checked($settings['script_position'] ?? 'footer', 'body'); ?>>
                                        <strong>Body</strong> - Gute Balance
                                    </label>
                                </div>
                            </div>
                            
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
                        </div>
                    </div>
                    
                    <!-- Badge Section -->
                    <div class="germanfence-section">
                        <h2 style="margin-top: 40px;">⭐ Badge - "Diese Seite wird geschützt"</h2>
                        
                        <div class="germanfence-setting">
                            <label class="germanfence-toggle">
                                <input type="checkbox" name="badge_enabled" value="1" <?php checked(isset($settings['badge_enabled']) && $settings['badge_enabled'] === '1'); ?>>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="setting-info">
                                <h3>Badge anzeigen</h3>
                                <p>Zeigt einen Badge auf der Website, dass sie durch GermanFence geschützt wird.</p>
                            </div>
                        </div>
                        
                        <div class="germanfence-subsetting" id="badge-settings" style="<?php echo (!isset($settings['badge_enabled']) || $settings['badge_enabled'] !== '1') ? 'display:none;' : ''; ?>">
                            <h3>Badge-Einstellungen</h3>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label><strong>Anzeige-Bereich:</strong></label>
                                <select name="badge_display_type" style="width: 100%; max-width: 300px; padding: 8px; border: 1px solid #c3cbd5; border-radius: 6px;">
                                    <option value="global" <?php selected($settings['badge_display_type'] ?? 'global', 'global'); ?>>Auf gesamter Website</option>
                                    <option value="forms" <?php selected($settings['badge_display_type'] ?? '', 'forms'); ?>>Nur bei Formularen</option>
                                </select>
                                <p class="description" style="margin-top: 5px; color: #646970;">
                                    <strong>Global:</strong> Badge erscheint auf jeder Seite<br>
                                    <strong>Nur bei Formularen:</strong> Badge erscheint nur bei geschützten Formularen (Contact Form 7, WPForms, etc.)
                                </p>
                            </div>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label><strong>Position:</strong></label>
                                <select name="badge_position" style="width: 100%; max-width: 300px; padding: 8px; border: 1px solid #c3cbd5; border-radius: 6px;">
                                    <option value="bottom-right" <?php selected($settings['badge_position'] ?? 'bottom-right', 'bottom-right'); ?>>Unten Rechts</option>
                                    <option value="bottom-left" <?php selected($settings['badge_position'] ?? '', 'bottom-left'); ?>>Unten Links</option>
                                    <option value="top-right" <?php selected($settings['badge_position'] ?? '', 'top-right'); ?>>Oben Rechts</option>
                                    <option value="top-left" <?php selected($settings['badge_position'] ?? '', 'top-left'); ?>>Oben Links</option>
                                </select>
                            </div>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label><strong>Badge-Text:</strong></label>
                                <input type="text" name="badge_text" value="<?php echo esc_attr($settings['badge_text'] ?? 'Geschützt durch GermanFence'); ?>" 
                                    style="width: 100%; max-width: 500px; padding: 10px; border: 1px solid #c3cbd5; border-radius: 6px; font-size: 14px;"
                                    placeholder="Geschützt durch GermanFence">
                            </div>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label><strong>Eigenes Icon/Logo (URL):</strong></label>
                                <input type="text" name="badge_custom_image" value="<?php echo esc_attr($settings['badge_custom_image'] ?? ''); ?>" 
                                    style="width: 100%; max-width: 500px; padding: 10px; border: 1px solid #c3cbd5; border-radius: 6px; font-size: 14px;"
                                    placeholder="https://example.com/logo.png (max. 1.5MB)">
                                <p class="description" style="margin-top: 5px; color: #646970;">
                                    Leer lassen für Standard-Icon 🛡️. Empfohlen: 32x32px PNG/SVG, max. 1.5MB
                                </p>
                            </div>
                            
                            <div class="setting-row" style="margin-bottom: 20px;">
                                <label><strong>Text-Farbe:</strong></label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="color" name="badge_text_color" value="<?php echo esc_attr($settings['badge_text_color'] ?? '#1d2327'); ?>" 
                                        style="width: 60px; height: 40px; border: 1px solid #c3cbd5; border-radius: 6px; cursor: pointer;">
                                    <input type="text" name="badge_text_color_hex" value="<?php echo esc_attr($settings['badge_text_color'] ?? '#1d2327'); ?>" 
                                        style="width: 100px; padding: 8px; border: 1px solid #c3cbd5; border-radius: 6px; font-family: monospace;"
                                        placeholder="#1d2327">
                                    <span class="description" style="color: #646970;">Standard: #1d2327 (Dunkelgrau)</span>
                                </div>
                            </div>
                            
                            <h3 style="margin-top: 30px;">Vorschau</h3>
                            <div style="background: #F2F5F8; padding: 20px; border-radius: 6px; text-align: center;">
                                <div id="badge-preview" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; padding: 10px 16px; border-radius: 6px; border: 1px solid #22D6DD; box-shadow: 0 2px 8px rgba(34, 214, 221, 0.2);">
                                    <span id="badge-icon">
                                        <img src="<?php echo GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence_logo.png'; ?>" alt="GermanFence" style="width: 24px; height: 24px; object-fit: contain;">
                                    </span>
                                    <span id="badge-text-preview" style="font-size: 13px; font-weight: 600; color: #1d2327;"><?php echo esc_html($settings['badge_text'] ?? 'Geschützt durch GermanFence'); ?></span>
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
                        
                        <div style="background: <?php echo $is_telemetry_enabled ? 'rgba(34, 214, 221, 0.05)' : '#F2F5F8'; ?>; padding: 25px; border-radius: 8px; border: 2px solid <?php echo $is_telemetry_enabled ? '#22D6DD' : '#c3cbd5'; ?>;">
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
                            
                            <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #c3cbd5;">
                                <h4 style="margin: 0 0 15px 0; color: #1d2327; font-size: 14px;">🔒 Was wird gesendet?</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                    <div>
                                        <span style="color: #22D6DD; font-weight: 600;">✓ Anonymisiert:</span>
                                        <ul style="margin: 8px 0 0 20px; color: #646970; font-size: 13px; line-height: 1.8;">
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
                                        <ul style="margin: 8px 0 0 20px; color: #646970; font-size: 13px; line-height: 1.8;">
                                            <li>Keine echten IP-Adressen</li>
                                            <li>Keine E-Mail-Adressen</li>
                                            <li>Keine Nachrichten/Inhalte</li>
                                            <li>Keine persönlichen Daten</li>
                                            <li>Keine Klarnamen</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div style="background: rgba(34, 214, 221, 0.05); padding: 15px; border-radius: 6px; border-left: 4px solid #22D6DD; margin-bottom: 15px;">
                                    <h4 style="margin: 0 0 8px 0; color: #22D6DD; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                                        <span>🇩🇪</span> <strong>100% DSGVO-konform</strong>
                                    </h4>
                                    <ul style="margin: 0; padding-left: 20px; color: #646970; font-size: 12px; line-height: 1.8;">
                                        <li>Datenverarbeitung <strong>nur in Deutschland</strong> (Hetzner Server)</li>
                                        <li>Zweck: <strong>Ausschließlich Gefahrenabwehr</strong> und Spam-Muster-Erkennung</li>
                                        <li>Keine Weitergabe an Dritte</li>
                                        <li>Jederzeit widerrufbar (Toggle aus = sofort gestoppt)</li>
                                        <li>Auftragsverarbeitungsvertrag verfügbar (siehe unten)</li>
                                    </ul>
                                </div>
                                
                                <div style="padding: 15px; background: #F2F5F8; border-radius: 6px; text-align: center;">
                                    <p style="margin: 0 0 12px 0; color: #646970; font-size: 13px;">
                                        📄 <strong>Auftragsverarbeitungsvertrag (AV-Vertrag)</strong>
                                    </p>
                                    <a href="<?php echo GERMANFENCE_PLUGIN_URL; ?>data/av-vertrag.pdf" 
                                       target="_blank" 
                                       class="germanfence-btn-secondary"
                                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #22D6DD; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                                        <span class="dashicons dashicons-download" style="font-size: 16px;"></span>
                                        AV-Vertrag herunterladen (PDF)
                                    </a>
                                    <p style="margin: 12px 0 0 0; color: #888; font-size: 11px;">
                                        Rechtlich verbindlicher Vertrag zur Auftragsverarbeitung gem. Art. 28 DSGVO
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <?php endif; ?>
                </div>
                
                <div class="germanfence-footer">
                    <div style="text-align: center; padding: 20px; color: #646970; font-size: 13px;">
                        <div style="margin-bottom: 15px; font-weight: 600; color: #22D6DD;">
                            GermanFence v0.93 Beta by GermanProWeb
                        </div>
                        <div style="font-size: 12px;">
                            <a href="<?php echo admin_url('admin.php?page=germanfence&show=agb'); ?>" style="color: #646970; text-decoration: none; margin: 0 10px;">AGB</a>
                            <span style="color: #c3cbd5;">|</span>
                            <a href="<?php echo admin_url('admin.php?page=germanfence&show=datenschutz'); ?>" style="color: #646970; text-decoration: none; margin: 0 10px;">Datenschutz</a>
                            <span style="color: #c3cbd5;">|</span>
                            <a href="<?php echo admin_url('admin.php?page=germanfence&show=impressum'); ?>" style="color: #646970; text-decoration: none; margin: 0 10px;">Impressum</a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <?php
    }
    
    private function save_settings() {
        GermanFence_Logger::log_save('save_settings() wird aufgerufen');
        
        // Phrasen aus Textarea verarbeiten
        $blocked_phrases = array();
        if (!empty($_POST['blocked_phrases_text'])) {
            $phrases_text = sanitize_textarea_field($_POST['blocked_phrases_text']);
            
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
        if (isset($_POST['honeypot_fields']) && is_array($_POST['honeypot_fields'])) {
            $honeypot_fields = array_map('sanitize_text_field', $_POST['honeypot_fields']);
            $honeypot_fields = array_filter($honeypot_fields); // Leere entfernen
        }
        
        $settings = array(
            'honeypot_enabled' => isset($_POST['honeypot_enabled']) ? '1' : '0',
            'honeypot_count' => intval($_POST['honeypot_count'] ?? 3),
            'honeypot_fields' => $honeypot_fields,
            'timestamp_enabled' => isset($_POST['timestamp_enabled']) ? '1' : '0',
            'timestamp_min' => intval($_POST['timestamp_min'] ?? 3),
            'timestamp_max' => intval($_POST['timestamp_max'] ?? 3600),
            'javascript_check' => isset($_POST['javascript_check']) ? '1' : '0',
            'user_agent_check' => isset($_POST['user_agent_check']) ? '1' : '0',
            'typing_speed_check' => isset($_POST['typing_speed_check']) ? '1' : '0',
            'test_mode_block_all' => isset($_POST['test_mode_block_all']) ? '1' : '0',
            'geo_blocking_enabled' => isset($_POST['geo_blocking_enabled']) ? '1' : '0',
            'blocked_countries' => $_POST['blocked_countries'] ?? array(),
            'phrase_blocking_enabled' => isset($_POST['phrase_blocking_enabled']) ? '1' : '0',
            'phrase_regex_mode' => isset($_POST['phrase_regex_mode']) ? '1' : '0',
            'blocked_phrases' => $blocked_phrases,
            'badge_enabled' => isset($_POST['badge_enabled']) ? '1' : '0',
            'badge_display_type' => sanitize_text_field($_POST['badge_display_type'] ?? 'global'),
            'badge_position' => sanitize_text_field($_POST['badge_position'] ?? 'bottom-right'),
            'badge_text' => sanitize_text_field($_POST['badge_text'] ?? 'Geschützt durch GermanFence'),
            'badge_text_color' => sanitize_text_field($_POST['badge_text_color'] ?? '#1d2327'),
            'badge_custom_image' => sanitize_text_field($_POST['badge_custom_image'] ?? ''),
            'block_admin_notices' => isset($_POST['block_admin_notices']) ? '1' : '0',
            'block_plugin_ads' => isset($_POST['block_plugin_ads']) ? '1' : '0',
            'block_update_notices' => isset($_POST['block_update_notices']) ? '1' : '0',
            'block_review_requests' => isset($_POST['block_review_requests']) ? '1' : '0',
            'script_position' => sanitize_text_field($_POST['script_position'] ?? 'footer'),
            'defer_scripts' => isset($_POST['defer_scripts']) ? '1' : '0',
            'block_comment_bots' => isset($_POST['block_comment_bots']) ? '1' : '0',
            'block_wp_update_emails' => isset($_POST['block_wp_update_emails']) ? '1' : '0',
        );
        
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
        // Konvertiere Ländercode zu Flaggen-Emoji
        $code = strtoupper($code);
        if ($code === 'LOCAL') return '🏠';
        
        // Fallback wenn mb_chr nicht verfügbar
        if (!function_exists('mb_chr')) {
            return '🌍';
        }
        
        $offset = 127397;
        $flag = '';
        for ($i = 0; $i < strlen($code); $i++) {
            $flag .= mb_chr($offset + ord($code[$i]));
        }
        return $flag;
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


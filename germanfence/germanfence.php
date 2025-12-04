<?php
/**
 * Plugin Name: GermanFence
 * Plugin URI: https://germanfence.de
 * Description: Bestes WordPress Anti-Spam Plugin aus Deutschland! Schützt alle WordPress-Formulare vor Spam mit modernsten Techniken: Honeypot, Zeitstempel, GEO-Blocking, intelligente Phrasen-Erkennung und mehr. Made in Germany 🇩🇪
 * Version: 1.4.0
 * Author: GermanFence Team
 * Author URI: https://germanfence.de
 * License: GPL v2 or later + Proprietary
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: germanfence
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 * 
 * @package GermanFence
 * @copyright 2024-2025 GermanFence. All rights reserved.
 * @license Split License: GPL-2.0-or-later + Proprietary Commercial
 * 
 * SPLIT LICENSE NOTICE:
 * =====================
 * This plugin uses a split license model:
 * 
 * 1. SOURCE CODE: Licensed under GNU GPL v2 or later
 *    You may modify and redistribute the code under GPL terms.
 * 
 * 2. COMMERCIAL USE: Requires separate commercial license
 *    - Resale, bundling, white-labeling requires permission
 *    - SaaS usage requires commercial license
 *    - Branding & trademarks are proprietary
 * 
 * 3. PREMIUM FEATURES: Proprietary
 *    - API access, premium features require valid license key
 *    - Support & updates for license holders only
 * 
 * See LICENSE.txt for complete terms.
 * For commercial licensing: license@germanfence.com
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('GERMANFENCE_VERSION', '1.4.0');
define('GERMANFENCE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GERMANFENCE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GERMANFENCE_PLUGIN_FILE', __FILE__);

// ============================================
// AUTO-UPDATE von GitHub
// ============================================
// Parsedown ZUERST laden (wird vom Update-Checker benötigt)
if (!class_exists('Parsedown')) {
    $parsedown_path = plugin_dir_path(__FILE__) . 'lib/plugin-update-checker/Parsedown.php';
    if (file_exists($parsedown_path)) {
        require_once $parsedown_path;
    }
}

// Update-Checker laden
require_once plugin_dir_path(__FILE__) . 'lib/plugin-update-checker/plugin-update-checker.php';

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$myUpdateChecker = PucFactory::buildUpdateChecker(
    'https://germanfence.de/downloads/info.json',
    __FILE__,
    'germanfence'
);

// Debug-Logging für Updates (nur wenn WP_DEBUG aktiv)
if (defined('WP_DEBUG') && WP_DEBUG) {
    add_filter('puc_request_info_result-germanfence', function($pluginInfo, $result) {
        error_log('GermanFence Update Check: ' . print_r($result, true));
        return $pluginInfo;
    }, 10, 2);
}
// ============================================

// Include required files
// Load translations first
require_once GERMANFENCE_PLUGIN_DIR . 'languages/translations.php';

// Security-Klasse temporär deaktiviert - zu aggressiv
// Load core classes (License zuerst!)
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-logger.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-license.php'; // Zuerst laden!
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-germanfence.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-admin.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-antispam.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-geo-blocking.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-phrase-blocking.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-statistics.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-form-detector.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-form-stats.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-badge.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-notice-blocker.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-free-license.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-ajax.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-updater.php';
require_once GERMANFENCE_PLUGIN_DIR . 'includes/class-telemetry.php';

// Initialize the plugin
function germanfence_init() {
    GermanFence_Logger::log_hook('Plugin wird initialisiert (plugins_loaded)');
    
    // Prüfe und update Datenbank bei jedem Admin-Load
    if (is_admin()) {
        germanfence_update_database();
    }
    
    $germanfence = GermanFence::get_instance();
    $germanfence->run();
    
    // Initialize Badge
    new GermanFence_Badge();
    
    // Initialize Notice Blocker
    new GermanFence_Notice_Blocker();
    
    // Initialize License Manager
    new GermanFence_License();
    
    // Initialize Free License Manager
    new GermanFence_Free_License();
    
    GermanFence_Logger::log_hook('Plugin erfolgreich initialisiert');
}
add_action('plugins_loaded', 'germanfence_init');

// Activation hook
register_activation_hook(__FILE__, 'germanfence_activate');
function germanfence_activate() {
    germanfence_update_database();
}

// Database Update Function (kann mehrfach aufgerufen werden)
function germanfence_update_database() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    
    // Stats-Tabelle erstellen ODER updaten
    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}germanfence_stats (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type varchar(50) NOT NULL,
        ip_address varchar(100) NOT NULL,
        country varchar(10) DEFAULT NULL,
        form_id varchar(255) DEFAULT NULL,
        reason varchar(255) DEFAULT NULL,
        form_data TEXT DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY type (type),
        KEY created_at (created_at)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    
    // WICHTIG: Prüfe ob form_data Spalte existiert, wenn nicht, füge sie hinzu
    $table_name = $wpdb->prefix . 'germanfence_stats';
    $column_exists = $wpdb->get_results("SHOW COLUMNS FROM `{$table_name}` LIKE 'form_data'");
    
    if (empty($column_exists)) {
        $wpdb->query("ALTER TABLE `{$table_name}` ADD `form_data` TEXT DEFAULT NULL AFTER `reason`");
        error_log('[German Shield] form_data Spalte zur Stats-Tabelle hinzugefügt');
    }
    
    // Free-Users-Tabelle erstellen
    $sql2 = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}germanfence_free_users (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL,
        verification_token varchar(64) NOT NULL,
        is_verified tinyint(1) DEFAULT 0,
        verified_at datetime DEFAULT NULL,
        license_key varchar(64) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email (email),
        KEY verification_token (verification_token),
        KEY license_key (license_key)
    ) $charset_collate;";
    
    dbDelta($sql2);
    
    // Prüfe ob license_key Spalte existiert, wenn nicht, füge sie hinzu
    $free_table_name = $wpdb->prefix . 'germanfence_free_users';
    $license_key_column = $wpdb->get_results("SHOW COLUMNS FROM `{$free_table_name}` LIKE 'license_key'");
    
    if (empty($license_key_column)) {
        $wpdb->query("ALTER TABLE `{$free_table_name}` ADD `license_key` varchar(64) DEFAULT NULL AFTER `verified_at`, ADD KEY `license_key` (`license_key`)");
        error_log('[German Shield] license_key Spalte zur Free-Users-Tabelle hinzugefügt');
    }
    
    // Set default options
    if (!get_option('germanfence_settings')) {
        add_option('germanfence_settings', array(
            'antispam_method' => 'honeypot',
            'honeypot_enabled' => true,
            'timestamp_enabled' => true,
            'timestamp_min' => 3,
            'timestamp_max' => 3600,
            'geo_blocking_enabled' => false,
            'blocked_countries' => array(),
            'phrase_blocking_enabled' => false,
            'blocked_phrases' => array(),
        ));
    }
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'germanfence_deactivate');
function germanfence_deactivate() {
    // Cleanup if needed
}

// Add "Get Pro" button to plugin action links
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'germanfence_add_action_links');
function germanfence_add_action_links($links) {
    $pro_link = '<a href="https://germanfence.de/#pricing" target="_blank" style="color: #22D6DD; font-weight: bold;">Get Pro</a>';
    array_unshift($links, $pro_link);
    return $links;
}

// Custom update command
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('update-p', 'germanfence_cli_update');
}

function germanfence_cli_update($args, $assoc_args) {
    if (class_exists('WP_CLI')) {
        WP_CLI::line('Updating GermanFence Plugin...');
        $updater = new GermanFence_Updater();
        $result = $updater->check_for_update();
        
        if ($result) {
            WP_CLI::success('GermanFence updated successfully!');
        } else {
            WP_CLI::error('Update failed or no update available.');
        }
    }
}


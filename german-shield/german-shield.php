<?php
/**
 * Plugin Name: German Shield
 * Plugin URI: https://german-shield.de
 * Description: Bestes WordPress Anti-Spam Plugin aus Deutschland! Schützt alle WordPress-Formulare vor Spam mit modernsten Techniken: Honeypot, Zeitstempel, GEO-Blocking, intelligente Phrasen-Erkennung und mehr. Made in Germany 🇩🇪
 * Version: 0.93 Beta
 * Author: GermanProWeb
 * Author URI: https://germanproweb.de
 * License: GPL v2 or later + Proprietary
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: german-shield
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 * 
 * @package GermanShield
 * @copyright 2024-2025 German Shield. All rights reserved.
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
 * For commercial licensing: license@german-shield.com
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('GERMAN_SHIELD_VERSION', '0.92');
define('GERMAN_SHIELD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GERMAN_SHIELD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GERMAN_SHIELD_PLUGIN_FILE', __FILE__);

// Include required files
// Security-Klasse temporär deaktiviert - zu aggressiv
// require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-security.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-logger.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-german-shield.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-admin.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-antispam.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-geo-blocking.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-phrase-blocking.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-statistics.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-form-detector.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-form-stats.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-badge.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-notice-blocker.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-license.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-free-license.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-ajax.php';
require_once GERMAN_SHIELD_PLUGIN_DIR . 'includes/class-updater.php';

// Initialize the plugin
function german_shield_init() {
    German_Shield_Logger::log_hook('Plugin wird initialisiert (plugins_loaded)');
    
    // Prüfe und update Datenbank bei jedem Admin-Load
    if (is_admin()) {
        german_shield_update_database();
    }
    
    $german_shield = German_Shield::get_instance();
    $german_shield->run();
    
    // Initialize Badge
    new German_Shield_Badge();
    
    // Initialize Notice Blocker
    new German_Shield_Notice_Blocker();
    
    // Initialize License Manager
    new German_Shield_License();
    
    // Initialize Free License Manager
    new German_Shield_Free_License();
    
    German_Shield_Logger::log_hook('Plugin erfolgreich initialisiert');
}
add_action('plugins_loaded', 'german_shield_init');

// Activation hook
register_activation_hook(__FILE__, 'german_shield_activate');
function german_shield_activate() {
    german_shield_update_database();
}

// Database Update Function (kann mehrfach aufgerufen werden)
function german_shield_update_database() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    
    // Stats-Tabelle erstellen ODER updaten
    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}german_shield_stats (
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
    $table_name = $wpdb->prefix . 'german_shield_stats';
    $column_exists = $wpdb->get_results("SHOW COLUMNS FROM `{$table_name}` LIKE 'form_data'");
    
    if (empty($column_exists)) {
        $wpdb->query("ALTER TABLE `{$table_name}` ADD `form_data` TEXT DEFAULT NULL AFTER `reason`");
        error_log('[German Shield] form_data Spalte zur Stats-Tabelle hinzugefügt');
    }
    
    // Free-Users-Tabelle erstellen
    $sql2 = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}german_shield_free_users (
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
    $free_table_name = $wpdb->prefix . 'german_shield_free_users';
    $license_key_column = $wpdb->get_results("SHOW COLUMNS FROM `{$free_table_name}` LIKE 'license_key'");
    
    if (empty($license_key_column)) {
        $wpdb->query("ALTER TABLE `{$free_table_name}` ADD `license_key` varchar(64) DEFAULT NULL AFTER `verified_at`, ADD KEY `license_key` (`license_key`)");
        error_log('[German Shield] license_key Spalte zur Free-Users-Tabelle hinzugefügt');
    }
    
    // Set default options
    if (!get_option('german_shield_settings')) {
        add_option('german_shield_settings', array(
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
register_deactivation_hook(__FILE__, 'german_shield_deactivate');
function german_shield_deactivate() {
    // Cleanup if needed
}

// Custom update command
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('update-p', 'german_shield_cli_update');
}

function german_shield_cli_update($args, $assoc_args) {
    if (class_exists('WP_CLI')) {
        WP_CLI::line('Updating German Shield Plugin...');
        $updater = new German_Shield_Updater();
        $result = $updater->check_for_update();
        
        if ($result) {
            WP_CLI::success('German Shield updated successfully!');
        } else {
            WP_CLI::error('Update failed or no update available.');
        }
    }
}


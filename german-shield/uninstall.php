<?php
/**
 * Uninstall German Shield
 * 
 * This file runs when the plugin is uninstalled (deleted).
 */

// Exit if accessed directly
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Delete options
delete_option('german_shield_settings');
delete_option('german_shield_version');

// Delete transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_german_shield_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_german_shield_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_gs_country_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_gs_country_%'");

// Delete database table
$table_name = $wpdb->prefix . 'german_shield_stats';
$wpdb->query("DROP TABLE IF EXISTS {$table_name}");

// Delete backup directory (optional - commented out for safety)
// $backup_dir = WP_CONTENT_DIR . '/german-shield-backups';
// if (file_exists($backup_dir)) {
//     array_map('unlink', glob($backup_dir . '/*'));
//     rmdir($backup_dir);
// }

// Clear any cached data
wp_cache_flush();


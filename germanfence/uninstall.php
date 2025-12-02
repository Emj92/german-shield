<?php
/**
 * Uninstall GermanFence
 * 
 * This file runs when the plugin is uninstalled (deleted).
 */

// Exit if accessed directly
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Delete options
delete_option('germanfence_settings');
delete_option('germanfence_version');

// Delete transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_germanfence_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_germanfence_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_gf_country_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_gf_country_%'");

// Delete database tables
$table_name = $wpdb->prefix . 'germanfence_stats';
$wpdb->query("DROP TABLE IF EXISTS {$table_name}");
$table_name2 = $wpdb->prefix . 'germanfence_free_users';
$wpdb->query("DROP TABLE IF EXISTS {$table_name2}");

// Delete backup directory (optional - commented out for safety)
// $backup_dir = WP_CONTENT_DIR . '/germanfence-backups';
// if (file_exists($backup_dir)) {
//     array_map('unlink', glob($backup_dir . '/*'));
//     rmdir($backup_dir);
// }

// Clear any cached data
wp_cache_flush();


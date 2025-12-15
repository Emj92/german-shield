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
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Cleanup on uninstall
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_germanfence_%'");
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_germanfence_%'");
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_gf_country_%'");
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_gf_country_%'");

// Delete database tables
$germanfence_stats_table = esc_sql($wpdb->prefix . 'germanfence_stats');
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.NotPrepared -- Safe table name with esc_sql(), table names cannot use placeholders
$wpdb->query("DROP TABLE IF EXISTS `" . $germanfence_stats_table . "`");

$germanfence_free_table = esc_sql($wpdb->prefix . 'germanfence_free_users');
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.NotPrepared -- Safe table name with esc_sql(), table names cannot use placeholders
$wpdb->query("DROP TABLE IF EXISTS `" . $germanfence_free_table . "`");

// Delete backup directory (optional - commented out for safety)
// $backup_dir = WP_CONTENT_DIR . '/germanfence-backups';
// if (file_exists($backup_dir)) {
//     array_map('unlink', glob($backup_dir . '/*'));
//     rmdir($backup_dir);
// }

// Clear any cached data
wp_cache_flush();


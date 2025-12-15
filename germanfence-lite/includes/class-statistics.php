<?php
/**
 * Statistics Class
 *
 * @package GermanFence
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * GermanFence_Statistics class
 */
class GermanFence_Statistics {

    /**
     * Table name
     *
     * @var string
     */
    private $table_name;

    /**
     * History file path
     *
     * @var string
     */
    private $history_file;

    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'germanfence_stats';

        // History-Datei im Plugin-Ordner (bessere Schreibrechte).
        $upload_dir      = wp_upload_dir();
        $germanfence_dir = $upload_dir['basedir'] . '/germanfence';

        // Erstelle Verzeichnis falls nicht vorhanden.
        if ( ! file_exists( $germanfence_dir ) ) {
            wp_mkdir_p( $germanfence_dir );
        }

        $this->history_file = $germanfence_dir . '/history.log';

        // Stelle sicher, dass die History-Datei existiert.
        $this->ensure_history_file_exists();
    }

    /**
     * Stellt sicher, dass die History-Datei existiert
     */
    private function ensure_history_file_exists() {
        if ( ! file_exists( $this->history_file ) ) {
            // Erstelle Datei mit Header.
            $header  = "# GermanFence Request History\n";
            $header .= "# Diese Datei speichert alle Anfragen dauerhaft (in wp-uploads/germanfence/)\n";
            $header .= "# Format: [Timestamp] | Type | IP | Country | Reason\n";
            $header .= "# ================================================================================\n\n";

            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
            file_put_contents( $this->history_file, $header );
        }
    }

    /**
     * Schreibt einen Eintrag in die History-Datei
     *
     * @param string      $type    Entry type.
     * @param string      $ip      IP address.
     * @param string      $reason  Block reason.
     * @param string|null $country Country code.
     */
    private function write_to_history( $type, $ip, $reason, $country = null ) {
        $timestamp       = current_time( 'Y-m-d H:i:s' );
        $country_display = $country ? $country : 'N/A';
        $line            = sprintf(
            "[%s] | %s | %s | %s | %s\n",
            $timestamp,
            strtoupper( $type ),
            $ip,
            $country_display,
            $reason
        );

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
        @file_put_contents( $this->history_file, $line, FILE_APPEND | LOCK_EX );
    }

    /**
     * Löscht die komplette History
     *
     * @return bool
     */
    public function clear_history() {
        if ( file_exists( $this->history_file ) ) {
            wp_delete_file( $this->history_file );
            $this->ensure_history_file_exists();
        }
        return true;
    }

    /**
     * Log a blocked submission
     *
     * @param string      $type      Block type.
     * @param string      $ip        IP address.
     * @param string      $reason    Block reason.
     * @param string|null $country   Country code.
     * @param string|null $form_id   Form ID.
     * @param string|null $form_data Form data JSON.
     */
    public function log_block( $type, $ip, $reason, $country = null, $form_id = null, $form_data = null ) {
        global $wpdb;

        GermanFence_Logger::log( '[STATS] log_block() - Type: ' . $type . ', IP: ' . $ip );

        // Automatisch Land ermitteln wenn nicht angegeben.
        if ( null === $country ) {
            $country = $this->get_country_from_ip( $ip );
        }

        // Formular-Daten sammeln wenn nicht übergeben.
        if ( null === $form_data ) {
            $form_data = $this->collect_form_data();
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Intentional logging
        $wpdb->insert(
            $this->table_name,
            array(
                'type'       => 'blocked',
                'ip_address' => $ip,
                'country'    => $country,
                'form_id'    => $form_id,
                'reason'     => $type . ': ' . $reason,
                'form_data'  => $form_data,
                'created_at' => current_time( 'mysql' ),
            ),
            array( '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
        );

        // Update daily counter.
        $this->increment_counter( 'blocks_today' );

        // In History-Datei schreiben.
        $this->write_to_history( 'blocked', $ip, $type . ': ' . $reason, $country );

        // Telemetrie senden (wenn aktiviert).
        $telemetry = new GermanFence_Telemetry();
        $telemetry->send_block_event( $type, $ip, $reason, $country, $form_data );
    }

    /**
     * Sammelt Formular-Daten aus POST
     *
     * @return string|null JSON encoded form data.
     */
    private function collect_form_data() {
        $data = array();

        // POST-Daten sammeln (ohne sensitive Daten).
        $excluded_keys = array( 'password', 'pwd', 'pass', 'gs_js_token', 'gs_nonce', 'gs_timestamp', 'gs_honeypot', 'germanfence_nonce' );

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Data collection for logging only
        foreach ( $_POST as $key => $value ) {
            if ( ! in_array( strtolower( $key ), $excluded_keys, true ) && ! is_array( $value ) ) {
                $data[ $key ] = sanitize_text_field( wp_unslash( $value ) );
            }
        }

        return ! empty( $data ) ? wp_json_encode( $data ) : null;
    }

    /**
     * Log a legitimate submission
     *
     * @param string      $ip        IP address.
     * @param string|null $form_id   Form ID.
     * @param string|null $form_data Form data JSON.
     */
    public function log_legitimate( $ip, $form_id = null, $form_data = null ) {
        global $wpdb;

        GermanFence_Logger::log( '[STATS] log_legitimate() - IP: ' . $ip );

        // Land ermitteln.
        $country = $this->get_country_from_ip( $ip );

        // In History-Datei schreiben.
        $this->write_to_history( 'legitimate', $ip, 'Legitimate request', $country );

        // Formular-Daten sammeln wenn nicht übergeben.
        if ( null === $form_data ) {
            $form_data = $this->collect_form_data();
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Intentional logging
        $wpdb->insert(
            $this->table_name,
            array(
                'type'       => 'legitimate',
                'ip_address' => $ip,
                'country'    => $country,
                'form_id'    => $form_id,
                'form_data'  => $form_data,
                'created_at' => current_time( 'mysql' ),
            ),
            array( '%s', '%s', '%s', '%s', '%s', '%s' )
        );

        // Update daily counter.
        $this->increment_counter( 'legitimate_today' );
    }

    /**
     * Get statistics
     *
     * @return array Statistics data.
     */
    public function get_stats() {
        global $wpdb;

        $safe_table = esc_sql( $this->table_name );

        // Total blocked.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Statistics query, table name escaped with esc_sql()
        $total_blocked = $wpdb->get_var( "SELECT COUNT(*) FROM `" . $safe_table . "` WHERE type = 'blocked'" );

        // Total legitimate.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $total_legitimate = $wpdb->get_var( "SELECT COUNT(*) FROM `" . $safe_table . "` WHERE type = 'legitimate'" );

        // Today's blocks.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $today_blocked = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM `" . $safe_table . "` WHERE type = 'blocked' AND DATE(created_at) = %s",
                current_time( 'Y-m-d' )
            )
        );

        // Today's legitimate.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $today_legitimate = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM `" . $safe_table . "` WHERE type = 'legitimate' AND DATE(created_at) = %s",
                current_time( 'Y-m-d' )
            )
        );

        // Calculate block rate.
        $total      = $total_blocked + $total_legitimate;
        $block_rate = $total > 0 ? round( ( $total_blocked / $total ) * 100, 1 ) : 0;

        // Recent blocks.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $recent_blocks = $wpdb->get_results( "SELECT * FROM `" . $safe_table . "` WHERE type = 'blocked' ORDER BY created_at DESC LIMIT 10" );

        // Recent all.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $recent_all = $wpdb->get_results( "SELECT * FROM `" . $safe_table . "` ORDER BY created_at DESC LIMIT 50" );

        return array(
            'total_blocked'    => intval( $total_blocked ),
            'total_legitimate' => intval( $total_legitimate ),
            'today_blocked'    => intval( $today_blocked ),
            'today_legitimate' => intval( $today_legitimate ),
            'block_rate'       => $block_rate,
            'recent_blocks'    => $recent_blocks,
            'recent_all'       => $recent_all,
        );
    }

    /**
     * Get recent entries by type
     *
     * @param string $type  Entry type.
     * @param int    $limit Max entries.
     * @return array
     */
    public function get_recent_entries( $type = 'all', $limit = 50 ) {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        if ( 'all' === $type ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
            return $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM `" . $safe_table . "` ORDER BY created_at DESC LIMIT %d",
                    $limit
                )
            );
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM `" . $safe_table . "` WHERE type = %s ORDER BY created_at DESC LIMIT %d",
                $type,
                $limit
            )
        );
    }

    /**
     * Get statistics by date range
     *
     * @param string $start_date Start date.
     * @param string $end_date   End date.
     * @return array
     */
    public function get_stats_by_date_range( $start_date, $end_date ) {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $blocked = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM `" . $safe_table . "` WHERE type = 'blocked' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $legitimate = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM `" . $safe_table . "` WHERE type = 'legitimate' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );

        return array(
            'blocked'    => intval( $blocked ),
            'legitimate' => intval( $legitimate ),
        );
    }

    /**
     * Get statistics by block type
     *
     * @return array
     */
    public function get_stats_by_block_type() {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        return $wpdb->get_results(
            "SELECT SUBSTRING_INDEX(reason, ':', 1) as block_type, COUNT(*) as count FROM `" . $safe_table . "` WHERE type = 'blocked' GROUP BY block_type ORDER BY count DESC"
        );
    }

    /**
     * Get statistics by country
     *
     * @return array
     */
    public function get_stats_by_country() {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        return $wpdb->get_results(
            "SELECT country, COUNT(*) as count FROM `" . $safe_table . "` WHERE type = 'blocked' AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10"
        );
    }

    /**
     * Get daily statistics for chart
     *
     * @param int $days Number of days.
     * @return array
     */
    public function get_daily_stats( $days = 30 ) {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT DATE(created_at) as date, SUM(CASE WHEN type = 'blocked' THEN 1 ELSE 0 END) as blocked, SUM(CASE WHEN type = 'legitimate' THEN 1 ELSE 0 END) as legitimate FROM `" . $safe_table . "` WHERE created_at >= DATE_SUB(NOW(), INTERVAL %d DAY) GROUP BY DATE(created_at) ORDER BY date ASC",
                $days
            )
        );
    }

    /**
     * Get top blocked IPs
     *
     * @param int $limit Max entries.
     * @return array
     */
    public function get_top_blocked_ips( $limit = 10 ) {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ip_address, COUNT(*) as count, MAX(created_at) as last_attempt FROM `" . $safe_table . "` WHERE type = 'blocked' GROUP BY ip_address ORDER BY count DESC LIMIT %d",
                $limit
            )
        );
    }

    /**
     * Get country from IP address
     *
     * @param string $ip IP address.
     * @return string Country code.
     */
    private function get_country_from_ip( $ip ) {
        $cache_key = 'gs_country_' . md5( $ip );
        $cached    = get_transient( $cache_key );

        if ( false !== $cached ) {
            return $cached;
        }

        $country = null;

        // ip-api.com (kostenlos, 45 requests/minute).
        $response = wp_remote_get( 'http://ip-api.com/json/' . $ip . '?fields=countryCode', array( 'timeout' => 2 ) );
        if ( ! is_wp_error( $response ) ) {
            $body = json_decode( wp_remote_retrieve_body( $response ), true );
            if ( isset( $body['countryCode'] ) ) {
                $country = $body['countryCode'];
            }
        }

        // Fallback: ipapi.co.
        if ( ! $country ) {
            $response = wp_remote_get( 'https://ipapi.co/' . $ip . '/country/', array( 'timeout' => 2 ) );
            if ( ! is_wp_error( $response ) ) {
                $country = trim( wp_remote_retrieve_body( $response ) );
                if ( strlen( $country ) !== 2 ) {
                    $country = null;
                }
            }
        }

        // Cache.
        if ( $country ) {
            set_transient( $cache_key, $country, DAY_IN_SECONDS );
        } else {
            $country = 'XX';
            set_transient( $cache_key, $country, HOUR_IN_SECONDS );
        }

        return $country;
    }

    /**
     * Increment counter
     *
     * @param string $key Counter key.
     */
    private function increment_counter( $key ) {
        $current = get_transient( 'germanfence_' . $key );

        if ( false === $current ) {
            $current = 0;
        }

        set_transient( 'germanfence_' . $key, $current + 1, DAY_IN_SECONDS );
    }

    /**
     * Clear old statistics
     *
     * @param int $days Days to keep.
     * @return int|false
     */
    public function clear_old_stats( $days = 90 ) {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        return $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM `" . $safe_table . "` WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
                $days
            )
        );
    }

    /**
     * Clear all statistics
     */
    public function clear_all_stats() {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.NotPrepared -- Table name escaped with esc_sql()
        $wpdb->query( "TRUNCATE TABLE `" . $safe_table . "`" );

        delete_transient( 'germanfence_blocks_today' );
        delete_transient( 'germanfence_legitimate_today' );
    }

    /**
     * Export statistics to CSV
     *
     * @param string|null $start_date Start date.
     * @param string|null $end_date   End date.
     * @return array|false
     */
    public function export_to_csv( $start_date = null, $end_date = null ) {
        global $wpdb;
        $safe_table = esc_sql( $this->table_name );

        $where = '';
        if ( $start_date && $end_date ) {
            $where = $wpdb->prepare( ' WHERE created_at BETWEEN %s AND %s', $start_date, $end_date );
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Safe table name and prepared where clause
        $results = $wpdb->get_results( "SELECT * FROM `{$safe_table}`{$where} ORDER BY created_at DESC", ARRAY_A );

        if ( empty( $results ) ) {
            return false;
        }

        $csv   = array();
        $csv[] = array_keys( $results[0] );

        foreach ( $results as $row ) {
            $csv[] = array_values( $row );
        }

        return $csv;
    }

    /**
     * Get statistics summary
     *
     * @return array
     */
    public function get_summary() {
        return array(
            'overview'   => $this->get_stats(),
            'by_type'    => $this->get_stats_by_block_type(),
            'by_country' => $this->get_stats_by_country(),
            'top_ips'    => $this->get_top_blocked_ips( 5 ),
        );
    }

    /**
     * AJAX handler for getting stats
     */
    public function ajax_get_stats() {
        check_ajax_referer( 'germanfence_admin', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized' );
        }

        wp_send_json_success( $this->get_stats() );
    }
}

// Register AJAX handlers.
add_action(
    'wp_ajax_germanfence_get_stats',
    function () {
        $stats = new GermanFence_Statistics();
        $stats->ajax_get_stats();
    }
);


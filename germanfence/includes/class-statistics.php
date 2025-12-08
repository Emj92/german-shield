<?php
/**
 * Statistics Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Statistics {
    
    private $table_name;
    private $history_file;
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'germanfence_stats';
        $this->history_file = WP_CONTENT_DIR . '/germanfence-history.log';
        
        // Stelle sicher, dass die History-Datei existiert
        $this->ensure_history_file_exists();
    }
    
    /**
     * Stellt sicher, dass die History-Datei existiert
     */
    private function ensure_history_file_exists() {
        if (!file_exists($this->history_file)) {
            // Erstelle Datei mit Header
            $header = "# GermanFence Request History\n";
            $header .= "# Diese Datei speichert alle Anfragen dauerhaft und überlebt Plugin-Updates\n";
            $header .= "# Format: [Timestamp] | Type | IP | Country | Reason\n";
            $header .= "# ================================================================================\n\n";
            file_put_contents($this->history_file, $header);
        }
    }
    
    /**
     * Schreibt einen Eintrag in die History-Datei
     */
    private function write_to_history($type, $ip, $reason, $country = null) {
        $timestamp = current_time('Y-m-d H:i:s');
        $country_display = $country ? $country : 'N/A';
        $line = sprintf("[%s] | %s | %s | %s | %s\n", 
            $timestamp, 
            strtoupper($type), 
            $ip, 
            $country_display, 
            $reason
        );
        
        // Append zur Datei (non-blocking)
        file_put_contents($this->history_file, $line, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Löscht die komplette History
     */
    public function clear_history() {
        if (file_exists($this->history_file)) {
            unlink($this->history_file);
            $this->ensure_history_file_exists();
        }
    }
    
    /**
     * Log a blocked submission
     */
    public function log_block($type, $ip, $reason, $country = null, $form_id = null, $form_data = null) {
        global $wpdb;
        
        GermanFence_Logger::log('[STATS] 🚫 log_block() aufgerufen - Type: ' . $type . ', IP: ' . $ip);
        
        // Automatisch Land ermitteln wenn nicht angegeben
        if ($country === null) {
            $country = $this->get_country_from_ip($ip);
        }
        
        // Formular-Daten sammeln wenn nicht übergeben
        if ($form_data === null) {
            $form_data = $this->collect_form_data();
        }
        
        $result = $wpdb->insert(
            $this->table_name,
            array(
                'type' => 'blocked',
                'ip_address' => $ip,
                'country' => $country,
                'form_id' => $form_id,
                'reason' => $type . ': ' . $reason,
                'form_data' => $form_data,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            GermanFence_Logger::log('[STATS] ❌ DB INSERT FEHLER: ' . $wpdb->last_error);
        } else {
            GermanFence_Logger::log('[STATS] ✅ Blockierung geloggt, Insert ID: ' . $wpdb->insert_id);
        }
        
        // Update daily counter
        $this->increment_counter('blocks_today');
        
        // In History-Datei schreiben
        $this->write_to_history('blocked', $ip, $type . ': ' . $reason, $country);
        
        // Telemetrie senden (wenn aktiviert)
        $telemetry = new GermanFence_Telemetry();
        $telemetry->send_block_event($type, $ip, $reason, $country, $form_data);
    }
    
    /**
     * Sammelt Formular-Daten aus POST/GET
     */
    private function collect_form_data() {
        $data = array();
        
        // POST-Daten sammeln (ohne sensitive Daten)
        $excluded_keys = array('password', 'pwd', 'pass', 'gs_js_token', 'gs_nonce', 'gs_timestamp', 'gs_honeypot', 'germanfence_nonce');
        
        foreach ($_POST as $key => $value) {
            if (!in_array(strtolower($key), $excluded_keys) && !is_array($value)) {
                $data[$key] = sanitize_text_field($value);
            }
        }
        
        return !empty($data) ? json_encode($data, JSON_UNESCAPED_UNICODE) : null;
    }
    
    /**
     * Log a legitimate submission
     */
    public function log_legitimate($ip, $form_id = null, $form_data = null) {
        global $wpdb;
        
        GermanFence_Logger::log('[STATS] ✅ log_legitimate() aufgerufen - IP: ' . $ip);
        
        // In History-Datei schreiben
        $country = $this->get_country_from_ip($ip);
        $this->write_to_history('legitimate', $ip, 'Legitimate request', $country);
        
        // Land ermitteln
        $country = $this->get_country_from_ip($ip);
        
        // Formular-Daten sammeln wenn nicht übergeben
        if ($form_data === null) {
            $form_data = $this->collect_form_data();
        }
        
        GermanFence_Logger::log('[STATS] Versuche legitime Anfrage einzufügen - Country: ' . $country . ', Form Data: ' . ($form_data ? 'vorhanden' : 'leer'));
        
        $result = $wpdb->insert(
            $this->table_name,
            array(
                'type' => 'legitimate',
                'ip_address' => $ip,
                'country' => $country,
                'form_id' => $form_id,
                'form_data' => $form_data,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            GermanFence_Logger::log('[STATS] ❌ DB INSERT FEHLER: ' . $wpdb->last_error);
        } else {
            GermanFence_Logger::log('[STATS] ✅ Legitime Anfrage geloggt, Insert ID: ' . $wpdb->insert_id);
        }
        
        // Update daily counter
        $this->increment_counter('legitimate_today');
    }
    
    /**
     * Get statistics
     */
    public function get_stats() {
        global $wpdb;
        
        // Total blocked
        $total_blocked = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->table_name} WHERE type = 'blocked'"
        );
        
        // Total legitimate
        $total_legitimate = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->table_name} WHERE type = 'legitimate'"
        );
        
        // Today's blocks
        $today_blocked = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} 
                WHERE type = 'blocked' 
                AND DATE(created_at) = %s",
                current_time('Y-m-d')
            )
        );
        
        // Today's legitimate
        $today_legitimate = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} 
                WHERE type = 'legitimate' 
                AND DATE(created_at) = %s",
                current_time('Y-m-d')
            )
        );
        
        // Calculate block rate
        $total = $total_blocked + $total_legitimate;
        $block_rate = $total > 0 ? round(($total_blocked / $total) * 100, 1) : 0;
        
        // Recent blocks
        $recent_blocks = $wpdb->get_results(
            "SELECT * FROM {$this->table_name} 
            WHERE type = 'blocked' 
            ORDER BY created_at DESC 
            LIMIT 10"
        );
        
        // Recent all (für Filter)
        $recent_all = $wpdb->get_results(
            "SELECT * FROM {$this->table_name} 
            ORDER BY created_at DESC 
            LIMIT 50"
        );
        
        return array(
            'total_blocked' => intval($total_blocked),
            'total_legitimate' => intval($total_legitimate),
            'today_blocked' => intval($today_blocked),
            'today_legitimate' => intval($today_legitimate),
            'block_rate' => $block_rate,
            'recent_blocks' => $recent_blocks,
            'recent_all' => $recent_all,
        );
    }
    
    /**
     * Get recent entries by type
     */
    public function get_recent_entries($type = 'all', $limit = 50) {
        global $wpdb;
        
        if ($type === 'all') {
            return $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$this->table_name} 
                    ORDER BY created_at DESC 
                    LIMIT %d",
                    $limit
                )
            );
        }
        
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->table_name} 
                WHERE type = %s 
                ORDER BY created_at DESC 
                LIMIT %d",
                $type,
                $limit
            )
        );
    }
    
    /**
     * Get statistics by date range
     */
    public function get_stats_by_date_range($start_date, $end_date) {
        global $wpdb;
        
        $blocked = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} 
                WHERE type = 'blocked' 
                AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        $legitimate = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} 
                WHERE type = 'legitimate' 
                AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        return array(
            'blocked' => intval($blocked),
            'legitimate' => intval($legitimate),
        );
    }
    
    /**
     * Get statistics by type
     */
    public function get_stats_by_block_type() {
        global $wpdb;
        
        $results = $wpdb->get_results(
            "SELECT 
                SUBSTRING_INDEX(reason, ':', 1) as block_type,
                COUNT(*) as count
            FROM {$this->table_name}
            WHERE type = 'blocked'
            GROUP BY block_type
            ORDER BY count DESC"
        );
        
        return $results;
    }
    
    /**
     * Get statistics by country
     */
    public function get_stats_by_country() {
        global $wpdb;
        
        $results = $wpdb->get_results(
            "SELECT 
                country,
                COUNT(*) as count
            FROM {$this->table_name}
            WHERE type = 'blocked' AND country IS NOT NULL
            GROUP BY country
            ORDER BY count DESC
            LIMIT 10"
        );
        
        return $results;
    }
    
    /**
     * Get daily statistics for chart
     */
    public function get_daily_stats($days = 30) {
        global $wpdb;
        
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(created_at) as date,
                    SUM(CASE WHEN type = 'blocked' THEN 1 ELSE 0 END) as blocked,
                    SUM(CASE WHEN type = 'legitimate' THEN 1 ELSE 0 END) as legitimate
                FROM {$this->table_name}
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL %d DAY)
                GROUP BY DATE(created_at)
                ORDER BY date ASC",
                $days
            )
        );
        
        return $results;
    }
    
    /**
     * Get top blocked IPs
     */
    public function get_top_blocked_ips($limit = 10) {
        global $wpdb;
        
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    ip_address,
                    COUNT(*) as count,
                    MAX(created_at) as last_attempt
                FROM {$this->table_name}
                WHERE type = 'blocked'
                GROUP BY ip_address
                ORDER BY count DESC
                LIMIT %d",
                $limit
            )
        );
        
        return $results;
    }
    
    /**
     * Get country from IP address
     */
    private function get_country_from_ip($ip) {
        // Cache-Key für diese IP
        $cache_key = 'gs_country_' . md5($ip);
        $cached = get_transient($cache_key);
        
        if ($cached !== false) {
            return $cached;
        }
        
        // Versuche verschiedene kostenlose APIs
        $country = null;
        
        // 1. ip-api.com (kostenlos, 45 requests/minute)
        $response = wp_remote_get('http://ip-api.com/json/' . $ip . '?fields=countryCode', array('timeout' => 2));
        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['countryCode'])) {
                $country = $body['countryCode'];
            }
        }
        
        // 2. Fallback: ipapi.co (kostenlos, 1000/day)
        if (!$country) {
            $response = wp_remote_get('https://ipapi.co/' . $ip . '/country/', array('timeout' => 2));
            if (!is_wp_error($response)) {
                $country = trim(wp_remote_retrieve_body($response));
                if (strlen($country) !== 2) {
                    $country = null;
                }
            }
        }
        
        // 3. Fallback: ipinfo.io (kostenlos, 50k/month)
        if (!$country) {
            $response = wp_remote_get('https://ipinfo.io/' . $ip . '/country', array('timeout' => 2));
            if (!is_wp_error($response)) {
                $country = trim(wp_remote_retrieve_body($response));
                if (strlen($country) !== 2) {
                    $country = null;
                }
            }
        }
        
        // Cache für 24h
        if ($country) {
            set_transient($cache_key, $country, DAY_IN_SECONDS);
        } else {
            $country = 'XX'; // Unknown
            set_transient($cache_key, $country, HOUR_IN_SECONDS); // Nur 1h cachen
        }
        
        return $country;
    }
    
    /**
     * Increment counter
     */
    private function increment_counter($key) {
        $current = get_transient('germanfence_' . $key);
        
        if ($current === false) {
            $current = 0;
        }
        
        set_transient('germanfence_' . $key, $current + 1, DAY_IN_SECONDS);
    }
    
    /**
     * Clear old statistics
     */
    public function clear_old_stats($days = 90) {
        global $wpdb;
        
        $deleted = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$this->table_name} 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
                $days
            )
        );
        
        return $deleted;
    }
    
    /**
     * Clear all statistics
     */
    public function clear_all_stats() {
        global $wpdb;
        
        $wpdb->query("TRUNCATE TABLE {$this->table_name}");
        
        // Clear transients
        delete_transient('germanfence_blocks_today');
        delete_transient('germanfence_legitimate_today');
    }
    
    /**
     * Export statistics to CSV
     */
    public function export_to_csv($start_date = null, $end_date = null) {
        global $wpdb;
        
        $where = '';
        if ($start_date && $end_date) {
            $where = $wpdb->prepare(
                " WHERE created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            );
        }
        
        $results = $wpdb->get_results(
            "SELECT * FROM {$this->table_name}{$where} ORDER BY created_at DESC",
            ARRAY_A
        );
        
        if (empty($results)) {
            return false;
        }
        
        // Create CSV
        $csv = array();
        
        // Header
        $csv[] = array_keys($results[0]);
        
        // Data
        foreach ($results as $row) {
            $csv[] = array_values($row);
        }
        
        return $csv;
    }
    
    /**
     * Get statistics summary
     */
    public function get_summary() {
        $stats = $this->get_stats();
        $by_type = $this->get_stats_by_block_type();
        $by_country = $this->get_stats_by_country();
        $top_ips = $this->get_top_blocked_ips(5);
        
        return array(
            'overview' => $stats,
            'by_type' => $by_type,
            'by_country' => $by_country,
            'top_ips' => $top_ips,
        );
    }
    
    /**
     * AJAX handler for getting stats
     */
    public function ajax_get_stats() {
        check_ajax_referer('germanfence_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $stats = $this->get_stats();
        wp_send_json_success($stats);
    }
}

// Register AJAX handlers
add_action('wp_ajax_germanfence_get_stats', function() {
    $stats = new GermanFence_Statistics();
    $stats->ajax_get_stats();
});


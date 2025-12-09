<?php
/**
 * Updater Class - Update-System OHNE FTP
 * Nutzt WordPress eigene Update-API und Filesystem
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Updater {
    
    private $update_url = 'https://germanfence.de/downloads/info.json';
    private $plugin_slug = 'germanfence';
    private $version;
    private $plugin_file;
    
    public function __construct() {
        $this->version = GERMANFENCE_VERSION;
        $this->plugin_file = GERMANFENCE_PLUGIN_FILE;
        
        // Hook into WordPress update system
        add_filter('pre_set_site_transient_update_plugins', array($this, 'check_for_updates'));
        add_filter('plugins_api', array($this, 'plugin_info'), 10, 3);
        add_filter('upgrader_pre_install', array($this, 'pre_install'), 10, 2);
        add_filter('upgrader_post_install', array($this, 'post_install'), 10, 3);
    }
    
    /**
     * Check for updates (WP-CLI oder manuell)
     */
    public function check_for_update() {
        $update_info = $this->get_update_info();
        
        if (!$update_info || !isset($update_info['version'])) {
            return false;
        }
        
        if (version_compare($this->version, $update_info['version'], '<')) {
            return $this->perform_update($update_info);
        }
        
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::line('Plugin ist bereits auf dem neuesten Stand.');
        }
        
        return false;
    }
    
    /**
     * Get update information from server
     */
    private function get_update_info() {
        // Cache prüfen
        $cached = get_transient('germanfence_update_check');
        if ($cached !== false && !defined('WP_CLI')) {
            return $cached;
        }
        
        $response = wp_remote_get($this->update_url, array(
            'timeout' => 10,
            'sslverify' => true,
        ));
        
        if (is_wp_error($response)) {
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::warning('Update-Server nicht erreichbar: ' . $response->get_error_message());
            }
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['version'])) {
            return false;
        }
        
        // Cache für 12 Stunden
        set_transient('germanfence_update_check', $data, 12 * HOUR_IN_SECONDS);
        
        return $data;
    }
    
    /**
     * Perform the update - OHNE FTP!
     */
    private function perform_update($update_info) {
        if (!isset($update_info['download_url'])) {
            return false;
        }
        
        // WordPress Filesystem API initialisieren (KEIN FTP!)
        global $wp_filesystem;
        
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        
        // Direct Filesystem (kein FTP)
        if (!WP_Filesystem()) {
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::error('Filesystem konnte nicht initialisiert werden.');
            }
            return false;
        }
        
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::line('Erstelle Backup...');
        }
        
        // Backup erstellen
        $backup_created = $this->backup_plugin();
        
        if (defined('WP_CLI') && WP_CLI) {
            if ($backup_created) {
                WP_CLI::success('Backup erstellt.');
            } else {
                WP_CLI::warning('Backup konnte nicht erstellt werden.');
            }
            WP_CLI::line('Lade Update herunter...');
        }
        
        // Download update
        $download_file = $this->download_update($update_info['download_url']);
        
        if (!$download_file) {
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::error('Download fehlgeschlagen.');
            }
            return false;
        }
        
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::success('Download abgeschlossen.');
            WP_CLI::line('Installiere Update...');
        }
        
        // Install update
        $result = $this->install_update($download_file);
        
        // Clean up
        @unlink($download_file);
        
        if ($result) {
            // Update version in database
            update_option('germanfence_version', $update_info['version']);
            
            // Run update routines
            $this->run_update_routines($this->version, $update_info['version']);
            
            // Clear cache
            delete_transient('germanfence_update_check');
            wp_cache_flush();
            
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::success('Update auf Version ' . $update_info['version'] . ' erfolgreich!');
            }
            
            return true;
        }
        
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::error('Installation fehlgeschlagen.');
        }
        
        return false;
    }
    
    /**
     * Download update file
     */
    private function download_update($url) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        
        $temp_file = download_url($url);
        
        if (is_wp_error($temp_file)) {
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::warning('Download-Fehler: ' . $temp_file->get_error_message());
            }
            return false;
        }
        
        return $temp_file;
    }
    
    /**
     * Backup current plugin
     */
    private function backup_plugin() {
        $backup_dir = WP_CONTENT_DIR . '/german-shield-backups';
        
        if (!file_exists($backup_dir)) {
            wp_mkdir_p($backup_dir);
        }
        
        $backup_file = $backup_dir . '/german-shield-' . $this->version . '-' . time() . '.zip';
        
        // Create zip backup
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            
            if ($zip->open($backup_file, ZipArchive::CREATE) === true) {
                $this->add_directory_to_zip($zip, GERMANFENCE_PLUGIN_DIR, '');
                $zip->close();
                
                // Clean old backups (keep last 5)
                $this->clean_old_backups($backup_dir, 5);
                
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Add directory to zip
     */
    private function add_directory_to_zip($zip, $dir, $base) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($files as $file) {
            if (!$file->isDir()) {
                $file_path = $file->getRealPath();
                $relative_path = $base . substr($file_path, strlen($dir));
                $zip->addFile($file_path, $relative_path);
            }
        }
    }
    
    /**
     * Clean old backups
     */
    private function clean_old_backups($backup_dir, $keep = 5) {
        $backups = glob($backup_dir . '/german-shield-*.zip');
        
        if (count($backups) > $keep) {
            // Sort by modification time
            usort($backups, function($a, $b) {
                return filemtime($b) - filemtime($a);
            });
            
            // Remove old backups
            $to_remove = array_slice($backups, $keep);
            foreach ($to_remove as $file) {
                @unlink($file);
            }
        }
    }
    
    /**
     * Install update - Nutzt WordPress Plugin_Upgrader (KEIN FTP!)
     */
    private function install_update($zip_file) {
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
        
        // Skin für WP-CLI oder Silent
        if (defined('WP_CLI') && WP_CLI) {
            $skin = new WP_CLI_Upgrader_Skin();
        } else {
            $skin = new Automatic_Upgrader_Skin();
        }
        
        $upgrader = new Plugin_Upgrader($skin);
        
        // Deactivate plugin before update
        $was_active = is_plugin_active(plugin_basename($this->plugin_file));
        
        if ($was_active) {
            deactivate_plugins(plugin_basename($this->plugin_file), true);
        }
        
        // Install update
        $result = $upgrader->install($zip_file, array(
            'overwrite_package' => true,
            'clear_destination' => true,
            'clear_working' => true,
        ));
        
        // Reactivate plugin
        if ($was_active && !is_wp_error($result)) {
            activate_plugin(plugin_basename($this->plugin_file), '', false, true);
        }
        
        return !is_wp_error($result) && $result;
    }
    
    /**
     * Pre-install hook
     */
    public function pre_install($response, $hook_extra) {
        // Backup before install
        if (isset($hook_extra['plugin']) && $hook_extra['plugin'] === plugin_basename($this->plugin_file)) {
            $this->backup_plugin();
        }
        
        return $response;
    }
    
    /**
     * Post-install hook
     */
    public function post_install($response, $hook_extra, $result) {
        // Run update routines after install
        if (isset($hook_extra['plugin']) && $hook_extra['plugin'] === plugin_basename($this->plugin_file)) {
            $old_version = get_option('germanfence_version', $this->version);
            $new_version = $this->version;
            
            $this->run_update_routines($old_version, $new_version);
            update_option('germanfence_version', $new_version);
        }
        
        return $response;
    }
    
    /**
     * Run update routines
     */
    private function run_update_routines($old_version, $new_version) {
        global $wpdb;
        
        // Migration für 0.02
        if (version_compare($old_version, '0.02', '<') && version_compare($new_version, '0.02', '>=')) {
            // Beispiel: Neue Spalte hinzufügen
            $table_name = $wpdb->prefix . 'germanfence_stats';
            
            $column_exists = $wpdb->get_results(
                "SHOW COLUMNS FROM {$table_name} LIKE 'user_agent'"
            );
            
            if (empty($column_exists)) {
                $wpdb->query(
                    "ALTER TABLE {$table_name} 
                    ADD COLUMN user_agent VARCHAR(255) DEFAULT NULL AFTER reason"
                );
            }
        }
        
        // Migration für 0.03
        if (version_compare($old_version, '0.03', '<') && version_compare($new_version, '0.03', '>=')) {
            // Weitere Migrationen hier
        }
        
        // Clear caches
        wp_cache_flush();
        delete_transient('germanfence_update_check');
        
        // Clear GeoIP cache
        $geo = new GermanFence_GeoBlocking();
        $geo->clear_cache();
        
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::line('Update-Routinen ausgeführt.');
        }
    }
    
    /**
     * Hook into WordPress update checker
     */
    public function check_for_updates($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }
        
        $update_info = $this->get_update_info();
        
        if (!$update_info) {
            return $transient;
        }
        
        if (version_compare($this->version, $update_info['version'], '<')) {
            $plugin_file = plugin_basename($this->plugin_file);
            
            $transient->response[$plugin_file] = (object) array(
                'slug' => $this->plugin_slug,
                'plugin' => $plugin_file,
                'new_version' => $update_info['version'],
                'package' => $update_info['download_url'],
                'url' => $update_info['info_url'] ?? '',
                'tested' => $update_info['tested'] ?? '',
                'requires_php' => $update_info['requires_php'] ?? '7.4',
            );
        }
        
        return $transient;
    }
    
    /**
     * Plugin information for update screen
     */
    public function plugin_info($false, $action, $args) {
        if ($action !== 'plugin_information') {
            return $false;
        }
        
        if (!isset($args->slug) || $args->slug !== $this->plugin_slug) {
            return $false;
        }
        
        $update_info = $this->get_update_info();
        
        if (!$update_info) {
            return $false;
        }
        
        return (object) array(
            'name' => 'GermanFence',
            'slug' => $this->plugin_slug,
            'version' => $update_info['version'],
            'author' => '<a href="https://germanfence.de">GermanFence Team</a>',
            'homepage' => 'https://germanfence.de',
            'download_link' => $update_info['download_url'],
            'requires' => $update_info['requires'] ?? '5.0',
            'tested' => $update_info['tested'] ?? '6.4',
            'requires_php' => $update_info['requires_php'] ?? '7.4',
            'sections' => array(
                'description' => $update_info['description'] ?? 'Zuverlässiger Anti-Spam für WordPress',
                'changelog' => $update_info['changelog'] ?? '',
                'installation' => 'Aktiviere das Plugin und konfiguriere die Einstellungen unter German Shield.',
            ),
            'banners' => array(
                'low' => $update_info['banner_low'] ?? '',
                'high' => $update_info['banner_high'] ?? '',
            ),
        );
    }
    
    /**
     * Manual update check
     */
    public function manual_update_check() {
        delete_transient('germanfence_update_check');
        return $this->check_for_update();
    }
    
    /**
     * Get changelog
     */
    public function get_changelog() {
        $response = wp_remote_get($this->update_url, array(
            'timeout' => 10,
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
    
    /**
     * Rollback to previous version
     */
    public function rollback($version = null) {
        $backup_dir = WP_CONTENT_DIR . '/german-shield-backups';
        
        if (!file_exists($backup_dir)) {
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::error('Keine Backups gefunden.');
            }
            return false;
        }
        
        if ($version) {
            // Find specific version backup
            $backup_files = glob($backup_dir . '/german-shield-' . $version . '-*.zip');
        } else {
            // Get latest backup
            $backup_files = glob($backup_dir . '/german-shield-*.zip');
            usort($backup_files, function($a, $b) {
                return filemtime($b) - filemtime($a);
            });
        }
        
        if (empty($backup_files)) {
            if (defined('WP_CLI') && WP_CLI) {
                WP_CLI::error('Kein Backup gefunden.');
            }
            return false;
        }
        
        $backup_file = is_array($backup_files) ? $backup_files[0] : $backup_files;
        
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::line('Rollback zu: ' . basename($backup_file));
        }
        
        $result = $this->install_update($backup_file);
        
        if ($result && defined('WP_CLI') && WP_CLI) {
            WP_CLI::success('Rollback erfolgreich!');
        }
        
        return $result;
    }
}

/**
 * WP-CLI Command für updates
 */
if (defined('WP_CLI') && WP_CLI) {
    
    /**
     * WP-CLI Upgrader Skin
     */
    class WP_CLI_Upgrader_Skin extends WP_Upgrader_Skin {
        public function feedback($string, ...$args) {
            if (isset($this->upgrader->strings[$string])) {
                $string = $this->upgrader->strings[$string];
            }
            
            if (strpos($string, '%') !== false) {
                $string = vsprintf($string, $args);
            }
            
            if (!empty($string)) {
                WP_CLI::line($string);
            }
        }
        
        public function error($errors) {
            if (is_wp_error($errors)) {
                WP_CLI::error($errors->get_error_message());
            }
        }
    }
    
    /**
     * WP-CLI Command Class
     */
    class GermanFence_CLI_Command {
        
        /**
         * Update German Shield plugin
         * 
         * ## OPTIONS
         * 
         * [--check]
         * : Nur nach Updates suchen, nicht installieren
         * 
         * [--force]
         * : Update erzwingen, auch wenn bereits aktuell
         * 
         * [--rollback[=<version>]]
         * : Rollback zur vorherigen oder spezifischen Version
         * 
         * ## EXAMPLES
         * 
         *     # Update durchführen
         *     wp update-p
         * 
         *     # Nur prüfen
         *     wp update-p --check
         * 
         *     # Rollback
         *     wp update-p --rollback
         * 
         *     # Rollback zu spezifischer Version
         *     wp update-p --rollback=0.01
         * 
         * @param array $args
         * @param array $assoc_args
         */
        public function __invoke($args, $assoc_args) {
            $updater = new GermanFence_Updater();
            
            // Rollback
            if (isset($assoc_args['rollback'])) {
                $version = $assoc_args['rollback'] === true ? null : $assoc_args['rollback'];
                WP_CLI::line('Starte Rollback...');
                $result = $updater->rollback($version);
                
                if (!$result) {
                    WP_CLI::error('Rollback fehlgeschlagen.');
                }
                return;
            }
            
            // Check only
            if (isset($assoc_args['check'])) {
                WP_CLI::line('Prüfe auf Updates...');
                $update_info = $updater->manual_update_check();
                return;
            }
            
            // Update
            WP_CLI::line('Starte Update...');
            WP_CLI::line('Aktuelle Version: ' . GERMANFENCE_VERSION);
            
            $result = $updater->check_for_update();
            
            if (!$result) {
                WP_CLI::line('Keine Updates verfügbar oder Update fehlgeschlagen.');
            }
        }
    }
    
    WP_CLI::add_command('update-p', 'GermanFence_CLI_Command');
}

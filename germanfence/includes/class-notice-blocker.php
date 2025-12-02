<?php
/**
 * Notice Blocker Class - Blockiert WordPress Admin-Benachrichtigungen
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Notice_Blocker {
    
    private $settings;
    
    public function __construct() {
        // Nur laden wenn nicht auf German Shield Seiten
        if (isset($_GET['page']) && strpos($_GET['page'], 'germanfence') !== false) {
            return; // German Shield Admin-Seiten nicht blockieren!
        }
        
        $this->settings = get_option('germanfence_settings', array());
        
        if (!empty($this->settings['block_admin_notices']) || 
            !empty($this->settings['block_plugin_ads']) || 
            !empty($this->settings['block_update_notices']) || 
            !empty($this->settings['block_review_requests'])) {
            
            add_action('admin_print_styles', array($this, 'add_blocking_css'), 999);
            
            // Nur CSS-basiertes Blocking - KEIN remove_all_actions!
        }
    }
    
    
    public function add_blocking_css() {
        $css = '';
        
        // Alle Admin-Benachrichtigungen verstecken (außer Fehler und Warnungen)
        if (!empty($this->settings['block_admin_notices'])) {
            $css .= '
            .notice:not(.notice-error):not(.error):not(.notice-warning):not([class*="germanfence"]),
            .updated:not(.error):not([class*="germanfence"]),
            .update-nag {
                display: none !important;
            }
            ';
        }
        
        // Plugin-Werbung verstecken
        if (!empty($this->settings['block_plugin_ads'])) {
            $css .= '
            .notice[class*="upgrade"]:not([class*="germanfence"]),
            .notice[class*="premium"]:not([class*="germanfence"]),
            .notice[class*="pro"]:not([class*="germanfence"]),
            .notice[class*="review"]:not([class*="germanfence"]),
            .notice[class*="rate"]:not([class*="germanfence"]),
            div[class*="promo"]:not([class*="germanfence"]),
            div[class*="banner"]:not([class*="germanfence"]),
            div[id*="upgrade"]:not([id*="germanfence"]),
            div[id*="premium"]:not([id*="germanfence"]) {
                display: none !important;
            }
            ';
        }
        
        // Update-Benachrichtigungen verstecken
        if (!empty($this->settings['block_update_notices'])) {
            $css .= '
            .update-nag,
            .update-message,
            .notice-warning[class*="update"]:not([class*="germanfence"]),
            tr.plugin-update-tr,
            tr.theme-update-tr {
                display: none !important;
            }
            ';
        }
        
        // Bewertungs-Anfragen verstecken
        if (!empty($this->settings['block_review_requests'])) {
            $css .= '
            .notice[class*="review"]:not([class*="germanfence"]),
            .notice[class*="rating"]:not([class*="germanfence"]),
            .notice[class*="rate"]:not([class*="germanfence"]),
            div[class*="review-notice"]:not([class*="germanfence"]),
            div[id*="review"]:not([id*="germanfence"]) {
                display: none !important;
            }
            ';
        }
        
        if (!empty($css)) {
            echo '<style type="text/css">' . $css . '</style>';
        }
    }
}


<?php
/**
 * Email Obfuscation - Schützt E-Mail-Adressen vor Bots
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Email_Obfuscation {
    
    public function __construct() {
        // Shortcode registrieren
        add_shortcode('germanfence_email', array($this, 'email_shortcode'));
        
        // Content-Filter für automatische Erkennung
        add_filter('the_content', array($this, 'obfuscate_emails_in_content'), 999);
        add_filter('widget_text', array($this, 'obfuscate_emails_in_content'), 999);
    }
    
    /**
     * Shortcode für geschützte E-Mails
     * Verwendung: [germanfence_email]info@example.com[/germanfence_email]
     */
    public function email_shortcode($atts, $content = '') {
        if (empty($content)) {
            return '';
        }
        
        $email = sanitize_email(trim($content));
        if (!is_email($email)) {
            return esc_html($content);
        }
        
        $settings = get_option('germanfence_settings', array());
        
        if (empty($settings['email_obfuscation_enabled']) || $settings['email_obfuscation_enabled'] !== '1') {
            return '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>';
        }
        
        $method = $settings['email_obfuscation_method'] ?? 'javascript';
        
        return $this->obfuscate_email($email, $method);
    }
    
    /**
     * Automatische E-Mail-Verschleierung im Content
     */
    public function obfuscate_emails_in_content($content) {
        $settings = get_option('germanfence_settings', array());
        
        if (empty($settings['email_obfuscation_enabled']) || $settings['email_obfuscation_enabled'] !== '1') {
            return $content;
        }
        
        $method = $settings['email_obfuscation_method'] ?? 'javascript';
        
        // Regex für E-Mail-Adressen (auch in mailto: Links)
        $pattern = '/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/';
        
        $content = preg_replace_callback($pattern, function($matches) use ($method) {
            $email = $matches[1];
            return $this->obfuscate_email($email, $method);
        }, $content);
        
        return $content;
    }
    
    /**
     * Verschleiert eine E-Mail-Adresse
     */
    private function obfuscate_email($email, $method = 'javascript') {
        switch ($method) {
            case 'javascript':
                return $this->obfuscate_javascript($email);
            
            case 'entities':
                return $this->obfuscate_entities($email);
            
            case 'css':
                return $this->obfuscate_css($email);
            
            default:
                return '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>';
        }
    }
    
    /**
     * Methode 1: JavaScript-basiert (beste Schutz)
     */
    private function obfuscate_javascript($email) {
        $encoded = base64_encode($email);
        $id = 'gf-email-' . substr(md5($email . time()), 0, 8);
        
        return '<span id="' . esc_attr($id) . '" data-email="' . esc_attr($encoded) . '"></span>
        <script>
        (function(){
            var el = document.getElementById("' . esc_js($id) . '");
            if(el) {
                var email = atob(el.getAttribute("data-email"));
                el.innerHTML = \'<a href="mailto:\' + email + \'" style="color: #22D6DD; text-decoration: none;">\' + email + \'</a>\';
            }
        })();
        </script>';
    }
    
    /**
     * Methode 2: HTML-Entities (mittlerer Schutz)
     */
    private function obfuscate_entities($email) {
        $encoded = '';
        for ($i = 0; $i < strlen($email); $i++) {
            $encoded .= '&#' . ord($email[$i]) . ';';
        }
        return '<a href="mailto:' . $encoded . '" style="color: #22D6DD; text-decoration: none;">' . $encoded . '</a>';
    }
    
    /**
     * Methode 3: CSS-basiert (guter Schutz)
     */
    private function obfuscate_css($email) {
        $reversed = strrev($email);
        $id = 'gf-email-' . substr(md5($email . time()), 0, 8);
        
        return '<span id="' . esc_attr($id) . '" style="unicode-bidi: bidi-override; direction: rtl;">' . 
               esc_html($reversed) . 
               '</span>
               <style>#' . esc_attr($id) . ' { color: #22D6DD; }</style>';
    }
    
    /**
     * Zählt E-Mails auf der gesamten Website
     */
    public function count_emails_on_site() {
        global $wpdb;
        
        $email_count = 0;
        
        // Zähle E-Mails in Posts/Pages
        $posts = $wpdb->get_results("
            SELECT post_content 
            FROM {$wpdb->posts} 
            WHERE post_status = 'publish' 
            AND post_type IN ('post', 'page')
        ");
        
        $pattern = '/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/';
        
        foreach ($posts as $post) {
            preg_match_all($pattern, $post->post_content, $matches);
            $email_count += count($matches[0]);
        }
        
        // Zähle E-Mails in Widgets
        $widgets = $wpdb->get_results("
            SELECT option_value 
            FROM {$wpdb->options} 
            WHERE option_name LIKE 'widget_%'
        ");
        
        foreach ($widgets as $widget) {
            if (is_serialized($widget->option_value)) {
                $data = maybe_unserialize($widget->option_value);
                $text = is_array($data) ? json_encode($data) : (string)$data;
                preg_match_all($pattern, $text, $matches);
                $email_count += count($matches[0]);
            }
        }
        
        return $email_count;
    }
}


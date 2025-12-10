<?php
/**
 * Email Obfuscation - Schützt E-Mail-Adressen vor Bots
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Email_Obfuscation {
    
    private $email_scripts = array();
    private $processed_ids = array();
    
    public function __construct() {
        add_shortcode('germanfence_email', array($this, 'email_shortcode'));
        add_action('template_redirect', array($this, 'start_buffer'), 0);
    }
    
    public function start_buffer() {
        ob_start(array($this, 'process_html'));
    }
    
    /**
     * Verarbeitet das gesamte HTML
     */
    public function process_html($html) {
        $settings = get_option('germanfence_settings', array());
        
        if (empty($settings['email_obfuscation_enabled']) || $settings['email_obfuscation_enabled'] !== '1') {
            return $html;
        }
        
        $method = $settings['email_obfuscation_method'] ?? 'javascript';
        
        // Reset
        $this->email_scripts = array();
        $this->processed_ids = array();
        
        // Schritt 1: Alle mailto-Links ersetzen
        $html = $this->replace_mailto_links($html, $method);
        
        // Schritt 2: Plain-Text E-Mails ersetzen (nur zwischen > und <)
        $html = $this->replace_plaintext_emails($html, $method);
        
        // Schritt 3: JavaScript vor </body> einfügen
        if (!empty($this->email_scripts) && $method === 'javascript') {
            $script = $this->generate_script();
            $html = preg_replace('/<\/body>/i', $script . '</body>', $html, 1);
        }
        
        return $html;
    }
    
    /**
     * Ersetzt alle mailto-Links
     */
    private function replace_mailto_links($html, $method) {
        // Pattern für mailto-Links: <a ... href="mailto:email" ...>Text</a>
        $pattern = '/<a\s+([^>]*)href\s*=\s*["\']mailto:([^"\']+)["\']([^>]*)>(.*?)<\/a>/is';
        
        return preg_replace_callback($pattern, function($m) use ($method) {
            $before_href = $m[1];
            $email = trim($m[2]);
            $after_href = $m[3];
            $link_text = $m[4];
            
            // Email validieren
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $m[0];
            }
            
            return $this->create_protected_email($email, strip_tags($link_text), $method);
        }, $html);
    }
    
    /**
     * Ersetzt Plain-Text E-Mails (nur zwischen HTML-Tags)
     */
    private function replace_plaintext_emails($html, $method) {
        // Teile HTML in Segmente: Tags und Text
        $parts = preg_split('/(<[^>]+>)/s', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        $result = '';
        $in_script = false;
        $in_style = false;
        
        foreach ($parts as $part) {
            // Prüfe ob wir in einem Script/Style-Block sind
            if (preg_match('/<script\b/i', $part)) $in_script = true;
            if (preg_match('/<\/script>/i', $part)) $in_script = false;
            if (preg_match('/<style\b/i', $part)) $in_style = true;
            if (preg_match('/<\/style>/i', $part)) $in_style = false;
            
            // Wenn es ein HTML-Tag ist oder wir in Script/Style sind, nicht ändern
            if (strpos($part, '<') === 0 || $in_script || $in_style) {
                $result .= $part;
                continue;
            }
            
            // Nur reinen Text verarbeiten
            $email_pattern = '/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/';
            
            $part = preg_replace_callback($email_pattern, function($m) use ($method) {
                $email = $m[1];
                
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return $m[0];
                }
                
                // Prüfe ob diese Email schon verarbeitet wurde
                if (in_array($email, $this->processed_ids)) {
                    return $m[0];
                }
                
                return $this->create_protected_email($email, $email, $method);
            }, $part);
            
            $result .= $part;
        }
        
        return $result;
    }
    
    /**
     * Erstellt geschützten Email-Code
     */
    private function create_protected_email($email, $display_text, $method) {
        $id = 'gfe-' . substr(md5($email . mt_rand()), 0, 8);
        
        switch ($method) {
            case 'javascript':
                $encoded_email = base64_encode($email);
                $encoded_text = base64_encode($display_text ?: $email);
                
                $this->email_scripts[$id] = array(
                    'email' => $encoded_email,
                    'text' => $encoded_text
                );
                
                $this->processed_ids[] = $email;
                
                return '<span id="' . esc_attr($id) . '" class="gf-protected-email" style="cursor:pointer">[E-Mail geschützt]</span>';
            
            case 'entities':
                $this->processed_ids[] = $email;
                $encoded_email = '';
                $encoded_text = '';
                
                for ($i = 0; $i < strlen($email); $i++) {
                    $encoded_email .= '&#' . ord($email[$i]) . ';';
                }
                for ($i = 0; $i < strlen($display_text ?: $email); $i++) {
                    $encoded_text .= '&#' . ord(($display_text ?: $email)[$i]) . ';';
                }
                
                return '<a href="mailto:' . $encoded_email . '">' . $encoded_text . '</a>';
            
            case 'css':
            default:
                $this->processed_ids[] = $email;
                $reversed = strrev($email);
                
                return '<span style="unicode-bidi:bidi-override;direction:rtl">' . esc_html($reversed) . '</span>';
        }
    }
    
    /**
     * Generiert das JavaScript
     */
    private function generate_script() {
        if (empty($this->email_scripts)) {
            return '';
        }
        
        $js_data = json_encode($this->email_scripts);
        
        $script = "\n<!-- GermanFence Email Protection -->\n";
        $script .= '<script type="text/javascript">';
        $script .= '(function(){';
        $script .= 'var d=' . $js_data . ';';
        $script .= 'function init(){';
        $script .= 'for(var id in d){';
        $script .= 'var el=document.getElementById(id);';
        $script .= 'if(el){try{';
        $script .= 'var e=atob(d[id].email);';
        $script .= 'var t=atob(d[id].text);';
        $script .= 'el.innerHTML=\'<a href="mailto:\'+e+\'">\'+t+\'</a>\';';
        $script .= '}catch(x){el.textContent="[E-Mail geschützt]";}}';
        $script .= '}}';
        $script .= 'if(document.readyState==="loading"){';
        $script .= 'document.addEventListener("DOMContentLoaded",init);';
        $script .= '}else{init();}';
        $script .= '})();';
        $script .= '</script>' . "\n";
        
        return $script;
    }
    
    /**
     * Shortcode: [germanfence_email]email@example.com[/germanfence_email]
     */
    public function email_shortcode($atts, $content = '') {
        if (empty($content)) return '';
        
        $email = sanitize_email(trim($content));
        if (!is_email($email)) return esc_html($content);
        
        $settings = get_option('germanfence_settings', array());
        
        if (empty($settings['email_obfuscation_enabled']) || $settings['email_obfuscation_enabled'] !== '1') {
            return '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>';
        }
        
        $method = $settings['email_obfuscation_method'] ?? 'javascript';
        return $this->create_protected_email($email, $email, $method);
    }
    
    /**
     * Zählt E-Mails auf der Website
     */
    public function count_emails_on_site() {
        global $wpdb;
        
        $found_emails = array();
        $pattern = '/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/';
        
        $posts = $wpdb->get_results("
            SELECT post_content 
            FROM {$wpdb->posts} 
            WHERE post_status = 'publish' 
            AND post_type IN ('post', 'page')
        ");
        
        foreach ($posts as $post) {
            preg_match_all($pattern, $post->post_content, $matches);
            if (!empty($matches[0])) {
                foreach ($matches[0] as $email) {
                    if (!isset($found_emails[$email])) $found_emails[$email] = 0;
                    $found_emails[$email]++;
                }
            }
        }
        
        return array(
            'unique' => count($found_emails),
            'total' => array_sum($found_emails)
        );
    }
}

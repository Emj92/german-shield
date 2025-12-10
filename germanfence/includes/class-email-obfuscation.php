<?php
/**
 * Email Obfuscation - Schützt E-Mail-Adressen vor Bots
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Email_Obfuscation {
    
    private $email_scripts = array();
    
    public function __construct() {
        // Shortcode registrieren
        add_shortcode('germanfence_email', array($this, 'email_shortcode'));
        
        // NUR Output Buffering verwenden - erfasst ALLES (Header, Footer, Content)
        add_action('template_redirect', array($this, 'start_buffer'), 0);
    }
    
    /**
     * Output Buffering starten für Header/Footer
     */
    public function start_buffer() {
        ob_start(array($this, 'obfuscate_emails_in_html'));
    }
    
    /**
     * Output Buffer verarbeiten
     */
    public function obfuscate_emails_in_html($html) {
        $settings = get_option('germanfence_settings', array());
        
        if (empty($settings['email_obfuscation_enabled']) || $settings['email_obfuscation_enabled'] !== '1') {
            return $html;
        }
        
        // E-Mails verschleiern
        $html = $this->obfuscate_emails_in_content($html);
        
        // JavaScript direkt vor </body> einfügen (nicht über wp_footer, da Buffer)
        if (!empty($this->email_scripts)) {
            $script = "\n<!-- GermanFence Email Protection -->\n";
            $script .= '<script type="text/javascript">' . "\n";
            $script .= '(function() {' . "\n";
            $script .= '  function gfDecodeEmails() {' . "\n";
            foreach ($this->email_scripts as $js) {
                $script .= '    ' . trim($js) . "\n";
            }
            $script .= '  }' . "\n";
            $script .= '  if (document.readyState === "loading") {' . "\n";
            $script .= '    document.addEventListener("DOMContentLoaded", gfDecodeEmails);' . "\n";
            $script .= '  } else {' . "\n";
            $script .= '    gfDecodeEmails();' . "\n";
            $script .= '  }' . "\n";
            $script .= '})();' . "\n";
            $script .= '</script>' . "\n";
            
            // Vor </body> einfügen (case-insensitive)
            $html = preg_replace('/<\/body>/i', $script . '</body>', $html, 1);
        }
        
        return $html;
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
        
        // Schritt 1: Entferne bereits geschützte Spans (falls mehrfach verarbeitet)
        $content = preg_replace('/<span[^>]*class="gf-email-protected"[^>]*>.*?<\/span>/s', '', $content);
        
        // Schritt 2: Finde E-Mails die NICHT in href="mailto:" oder bereits in <a> Tags sind
        // Wir verwenden einen anderen Ansatz: Zuerst alle <a> Tags entfernen, dann E-Mails finden
        $email_pattern = '/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i';
        
        // Finde alle E-Mails
        preg_match_all($email_pattern, $content, $all_matches, PREG_OFFSET_CAPTURE);
        
        if (empty($all_matches[0])) {
            return $content;
        }
        
        // Von hinten nach vorne ersetzen um Offsets nicht zu verschieben
        $replacements = array();
        
        foreach ($all_matches[0] as $match) {
            $email = $match[0];
            $offset = $match[1];
            
            // Prüfe ob diese E-Mail in einem <a>-Tag ist
            $before = substr($content, 0, $offset);
            $after = substr($content, $offset + strlen($email), 200); // Nächste 200 Zeichen
            
            // Ist die E-Mail in einem href="mailto:..." ?
            if (preg_match('/href\s*=\s*["\']mailto:[^"\']*$/i', $before)) {
                continue; // Überspringe mailto-Links
            }
            
            // Ist die E-Mail zwischen <a> und </a>?
            $last_a_open = strrpos($before, '<a');
            $last_a_close = strrpos($before, '</a>');
            
            if ($last_a_open !== false && ($last_a_close === false || $last_a_open > $last_a_close)) {
                continue; // Überspringe E-Mails in <a> Tags
            }
            
            // Ist die E-Mail in einem Tag-Attribut (z.B. href, value)?
            if (preg_match('/<[^>]*$/s', $before)) {
                continue; // Überspringe E-Mails in HTML-Attributen
            }
            
            $replacements[] = array(
                'offset' => $offset,
                'length' => strlen($email),
                'email' => $email,
                'replacement' => $this->obfuscate_email($email, $method)
            );
        }
        
        // Von hinten nach vorne ersetzen
        $replacements = array_reverse($replacements);
        
        foreach ($replacements as $r) {
            $content = substr_replace($content, $r['replacement'], $r['offset'], $r['length']);
        }
        
        return $content;
    }
    
    /**
     * JavaScript-Code im Footer ausgeben (nicht mehr verwendet - Output Buffering)
     */
    public function output_scripts() {
        // Wird nicht mehr verwendet - Scripts werden direkt im Buffer eingefügt
        return;
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
        $id = 'gf-email-' . substr(md5($email . microtime() . mt_rand()), 0, 10);
        
        // JavaScript in Array speichern - wird im Buffer vor </body> eingefügt
        $this->email_scripts[] = '(function(){
            var el = document.getElementById("' . esc_js($id) . '");
            if(el) {
                try {
                    var email = atob("' . esc_js($encoded) . '");
                    el.innerHTML = \'<a href="mailto:\' + email + \'">\' + email + \'</a>\';
                } catch(e) {
                    el.textContent = "[E-Mail geschützt]";
                }
            }
        })();';
        
        return '<span id="' . esc_attr($id) . '" class="gf-email-protected">[E-Mail wird geladen...]</span>';
    }
    
    /**
     * Methode 2: HTML-Entities (mittlerer Schutz)
     */
    private function obfuscate_entities($email) {
        $encoded = '';
        for ($i = 0; $i < strlen($email); $i++) {
            $encoded .= '&#' . ord($email[$i]) . ';';
        }
        return '<a href="mailto:' . $encoded . '" style="color: inherit; font-size: inherit; text-decoration: none;">' . $encoded . '</a>';
    }
    
    /**
     * Methode 3: CSS-basiert (guter Schutz)
     */
    private function obfuscate_css($email) {
        $reversed = strrev($email);
        $id = 'gf-email-' . substr(md5($email . microtime()), 0, 8);
        
        return '<a href="mailto:' . esc_attr($email) . '" id="' . esc_attr($id) . '" class="gf-email-css" style="unicode-bidi: bidi-override; direction: rtl; color: inherit; font-size: inherit; text-decoration: none;">' . 
               esc_html($reversed) . 
               '</a>';
    }
    
    /**
     * Zählt E-Mails auf der gesamten Website
     * Gibt Array zurück: ['unique' => Anzahl verschiedener E-Mails, 'total' => Gesamt-Vorkommen]
     */
    public function count_emails_on_site() {
        global $wpdb;
        
        $found_emails = array(); // Email => Anzahl
        
        $pattern = '/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/';
        
        // Zähle E-Mails in Posts/Pages
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
                    if (!isset($found_emails[$email])) {
                        $found_emails[$email] = 0;
                    }
                    $found_emails[$email]++;
                }
            }
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
                if (!empty($matches[0])) {
                    foreach ($matches[0] as $email) {
                        if (!isset($found_emails[$email])) {
                            $found_emails[$email] = 0;
                        }
                        $found_emails[$email]++;
                    }
                }
            }
        }
        
        // Zähle E-Mails in Theme-Dateien (Header/Footer)
        $theme_locations = array(
            get_template_directory() . '/header.php',
            get_template_directory() . '/footer.php',
            get_stylesheet_directory() . '/header.php',
            get_stylesheet_directory() . '/footer.php',
        );
        
        foreach ($theme_locations as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                preg_match_all($pattern, $content, $matches);
                if (!empty($matches[0])) {
                    foreach ($matches[0] as $email) {
                        if (!isset($found_emails[$email])) {
                            $found_emails[$email] = 0;
                        }
                        $found_emails[$email]++;
                    }
                }
            }
        }
        
        return array(
            'unique' => count($found_emails),
            'total' => array_sum($found_emails)
        );
    }
}


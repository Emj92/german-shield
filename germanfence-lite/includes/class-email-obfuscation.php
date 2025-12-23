<?php
/**
 * Email Obfuscation - Schützt E-Mail-Adressen vor Bots
 * 
 * Fortgeschrittene Methoden:
 * - JavaScript: Multi-Layer-Encoding (ROT13 + Base64 + XOR)
 * - Entities: Gemischte HTML-Entities (hex + dezimal)
 * - CSS: RTL-Reverse mit zusätzlichem Decoy-Text
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Email_Obfuscation {
    
    private $email_scripts = array();
    private $processed_ids = array();
    private $xor_key = 'GF2024'; // XOR-Schlüssel für zusätzliche Verschleierung
    
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
            
            return $this->create_protected_email( $email, wp_strip_all_tags( $link_text ), $method );
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
        $in_textarea = false;
        $in_input = false;
        
        foreach ($parts as $part) {
            // Prüfe ob wir in einem Script/Style/Textarea-Block sind
            if (preg_match('/<script\b/i', $part)) $in_script = true;
            if (preg_match('/<\/script>/i', $part)) $in_script = false;
            if (preg_match('/<style\b/i', $part)) $in_style = true;
            if (preg_match('/<\/style>/i', $part)) $in_style = false;
            if (preg_match('/<textarea\b/i', $part)) $in_textarea = true;
            if (preg_match('/<\/textarea>/i', $part)) $in_textarea = false;
            if (preg_match('/<input\b/i', $part)) $in_input = true;
            
            // Wenn es ein HTML-Tag ist oder wir in geschützten Bereichen sind, nicht ändern
            if (strpos($part, '<') === 0 || $in_script || $in_style || $in_textarea || $in_input) {
                $result .= $part;
                $in_input = false; // Input ist self-closing
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
     * ROT13 Encoding (Buchstaben um 13 Stellen verschieben)
     */
    private function rot13_encode($str) {
        return str_rot13($str);
    }
    
    /**
     * XOR Encoding für zusätzliche Verschleierung
     */
    private function xor_encode($str) {
        $key = $this->xor_key;
        $result = '';
        $key_length = strlen($key);
        
        for ($i = 0; $i < strlen($str); $i++) {
            $result .= chr(ord($str[$i]) ^ ord($key[$i % $key_length]));
        }
        
        return $result;
    }
    
    /**
     * Multi-Layer Encoding: ROT13 -> XOR -> Base64
     */
    private function multi_encode($str) {
        $rot13 = $this->rot13_encode($str);
        $xored = $this->xor_encode($rot13);
        return base64_encode($xored);
    }
    
    /**
     * Gemischte HTML-Entities (hex + dezimal + plain)
     */
    private function mixed_entities_encode($str) {
        $result = '';
        
        for ($i = 0; $i < strlen($str); $i++) {
            $char = $str[$i];
            $ord = ord($char);
            
            // Zufällig zwischen verschiedenen Encodings wählen
            $rand = wp_rand(0, 2);
            
            switch ($rand) {
                case 0:
                    // Hexadezimal Entity
                    $result .= '&#x' . dechex($ord) . ';';
                    break;
                case 1:
                    // Dezimal Entity
                    $result .= '&#' . $ord . ';';
                    break;
                case 2:
                default:
                    // Bei @ und . immer encodieren, sonst plain
                    if ($char === '@' || $char === '.') {
                        $result .= '&#' . $ord . ';';
                    } else {
                        $result .= $char;
                    }
                    break;
            }
        }
        
        return $result;
    }
    
    /**
     * Erstellt geschützten Email-Code
     */
    private function create_protected_email($email, $display_text, $method) {
        $id = 'gfe-' . substr( md5( $email . wp_rand() ), 0, 8 );
        
        switch ($method) {
            case 'javascript':
                // Multi-Layer-Encoding für maximalen Schutz
                $encoded_email = $this->multi_encode($email);
                $encoded_text = $this->multi_encode($display_text ?: $email);
                
                // Zusätzlich: Email in Teile splitten für noch mehr Schutz
                $email_parts = $this->split_email($email);
                
                $this->email_scripts[$id] = array(
                    'e' => $encoded_email,
                    't' => $encoded_text,
                    'p' => $email_parts, // Zusätzliche Teile für Validierung
                    'k' => $this->xor_key
                );
                
                $this->processed_ids[] = $email;
                
                // Decoy-Kommentare einfügen um Bots zu verwirren
                $decoy = '<!--' . base64_encode('noreply@example.invalid') . '-->';
                
                return $decoy . '<span id="' . esc_attr($id) . '" class="gf-protected-email" data-gf="1" style="cursor:pointer">[E-Mail geschützt]</span>';
            
            case 'entities':
                $this->processed_ids[] = $email;
                
                // Gemischte Entities für besseren Schutz
                $encoded_email = $this->mixed_entities_encode($email);
                $encoded_text = $this->mixed_entities_encode($display_text ?: $email);
                
                // Unsichtbare Decoy-Zeichen einfügen
                $decoy_chars = '&#8203;'; // Zero-width space
                $encoded_email_with_decoys = $this->insert_decoy_chars($encoded_email, $decoy_chars);
                
                return '<a href="mailto:' . $encoded_email_with_decoys . '">' . $encoded_text . '</a>';
            
            case 'css':
            default:
                $this->processed_ids[] = $email;
                $reversed = strrev($email);
                
                // Zusätzliche unsichtbare Decoy-Zeichen
                $decoy_span = '<span style="display:none;font-size:0;color:transparent;position:absolute;left:-9999px">noreply@invalid.tld</span>';
                
                return $decoy_span . '<span class="gf-rtl-email" style="unicode-bidi:bidi-override;direction:rtl">' . esc_html($reversed) . '</span>';
        }
    }
    
    /**
     * Splittet Email in Teile (user, domain, tld)
     */
    private function split_email($email) {
        $parts = explode('@', $email);
        if (count($parts) !== 2) return array();
        
        $user = $parts[0];
        $domain_parts = explode('.', $parts[1]);
        $tld = array_pop($domain_parts);
        $domain = implode('.', $domain_parts);
        
        return array(
            'u' => base64_encode($user),
            'd' => base64_encode($domain),
            't' => base64_encode($tld)
        );
    }
    
    /**
     * Fügt Decoy-Zeichen in String ein
     */
    private function insert_decoy_chars($str, $decoy) {
        $result = '';
        $len = strlen($str);
        
        for ($i = 0; $i < $len; $i++) {
            $result .= $str[$i];
            // Alle 3-5 Zeichen ein Decoy einfügen (aber nicht nach Entity-Teilen)
            if ($i < $len - 1 && $str[$i] === ';' && wp_rand(0, 1) === 1) {
                $result .= $decoy;
            }
        }
        
        return $result;
    }
    
    /**
     * Generiert das JavaScript mit Multi-Layer-Dekodierung
     */
    private function generate_script() {
        if (empty($this->email_scripts)) {
            return '';
        }
        
        $js_data = wp_json_encode($this->email_scripts);
        
        $script = "\n<!-- GermanFence Email Protection -->\n";
        $script .= '<script type="text/javascript">';
        $script .= '(function(){';
        
        // XOR Decode Funktion
        $script .= 'function xd(s,k){var r="";for(var i=0;i<s.length;i++){r+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));}return r;}';
        
        // ROT13 Decode Funktion
        $script .= 'function r13(s){return s.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});}';
        
        // Multi-Decode: Base64 -> XOR -> ROT13
        $script .= 'function md(s,k){try{var b=atob(s);var x=xd(b,k);return r13(x);}catch(e){return"";}}';
        
        // Daten
        $script .= 'var d=' . $js_data . ';';
        
        // Verzögerte Initialisierung (erschwerter Bot-Zugriff)
        $script .= 'function init(){';
        $script .= 'setTimeout(function(){';
        $script .= 'for(var id in d){';
        $script .= 'var el=document.getElementById(id);';
        $script .= 'if(el&&el.getAttribute("data-gf")==="1"){try{';
        $script .= 'var e=md(d[id].e,d[id].k);';
        $script .= 'var t=md(d[id].t,d[id].k);';
        $script .= 'if(e&&e.indexOf("@")>0){';
        $script .= 'el.innerHTML=\'<a href="mailto:\'+e+\'">\'+t+\'</a>\';';
        $script .= 'el.removeAttribute("data-gf");';
        $script .= '}}catch(x){el.textContent="[E-Mail geschützt]";}}';
        $script .= '}},100);'; // 100ms Verzögerung
        $script .= '}';
        
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
        
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Scanning for emails in posts, using $wpdb->posts which is safe
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

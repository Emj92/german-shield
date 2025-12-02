<?php
/**
 * Phrase Blocking Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_PhraseBlocking {
    
    private $settings;
    
    public function __construct() {
        $this->settings = get_option('germanfence_settings', array());
    }
    
    /**
     * Check for blocked phrases
     */
    public function check_phrases($data) {
        if (empty($this->settings['phrase_blocking_enabled'])) {
            return array(
                'valid' => true,
                'message' => 'Phrase blocking disabled'
            );
        }
        
        $blocked_phrases = $this->settings['blocked_phrases'] ?? array();
        
        if (empty($blocked_phrases)) {
            return array(
                'valid' => true,
                'message' => 'No phrases blocked'
            );
        }
        
        // Collect all text content from submission
        $content = $this->collect_content($data);
        
        // Check if regex mode is enabled
        $regex_mode = !empty($this->settings['phrase_regex_mode']);
        
        // Check each phrase
        foreach ($blocked_phrases as $phrase) {
            if (empty($phrase)) {
                continue;
            }
            
            $is_blocked = false;
            
            if ($regex_mode) {
                // Regex-Modus: Verwende Phrase als Regex-Pattern
                $is_blocked = $this->matches_regex($content, $phrase);
            } else {
                // Normal-Modus: Standard-Suche
                $is_blocked = $this->contains_phrase($content, $phrase);
            }
            
            if ($is_blocked) {
                return array(
                    'valid' => false,
                    'message' => 'Ihre Nachricht enthält nicht erlaubte Inhalte',
                    'reason' => 'Blocked phrase detected: ' . $phrase
                );
            }
        }
        
        return array(
            'valid' => true,
            'message' => 'No blocked phrases found'
        );
    }
    
    /**
     * Collect all text content from form data
     */
    private function collect_content($data) {
        $content = array();
        
        // Skip system fields
        $skip_fields = array(
            'gs_timestamp', 'gs_js_token', '_wpnonce', '_wp_http_referer',
            'action', 'submit', 'germanfence_nonce'
        );
        
        foreach ($data as $key => $value) {
            // Skip system fields
            if (in_array($key, $skip_fields) || strpos($key, 'gs_') === 0) {
                continue;
            }
            
            // Handle arrays (checkboxes, multi-select)
            if (is_array($value)) {
                $content[] = implode(' ', $value);
            } else {
                $content[] = $value;
            }
        }
        
        return implode(' ', $content);
    }
    
    /**
     * Check if content matches regex pattern
     */
    private function matches_regex($content, $pattern) {
        // Sichere Regex-Ausführung mit Error-Handling
        try {
            // Füge Delimiter hinzu falls nicht vorhanden
            if (!preg_match('/^[\/\#\~\@\|]/', $pattern)) {
                $pattern = '/' . $pattern . '/ui';
            }
            
            // Teste Pattern auf Gültigkeit
            if (@preg_match($pattern, '') === false) {
                GermanFence_Logger::log('[PHRASE-REGEX] Ungültiges Regex-Pattern: ' . $pattern);
                return false;
            }
            
            // Führe Regex-Match aus
            $result = preg_match($pattern, $content);
            
            if ($result === 1) {
                GermanFence_Logger::log('[PHRASE-REGEX] Match gefunden: ' . $pattern);
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            GermanFence_Logger::log_error('[PHRASE-REGEX] Exception: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check if content contains phrase (Normal-Modus)
     */
    private function contains_phrase($content, $phrase) {
        // Case-insensitive search
        $content = mb_strtolower($content, 'UTF-8');
        $phrase = mb_strtolower($phrase, 'UTF-8');
        
        // Exact match
        if (mb_strpos($content, $phrase) !== false) {
            return true;
        }
        
        // Check with word boundaries (whole word match)
        $pattern = '/\b' . preg_quote($phrase, '/') . '\b/ui';
        if (preg_match($pattern, $content)) {
            return true;
        }
        
        // Check for variations (with spaces, dots, etc.)
        $phrase_normalized = preg_replace('/\s+/', '\s*', preg_quote($phrase, '/'));
        $pattern = '/' . $phrase_normalized . '/ui';
        if (preg_match($pattern, $content)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Add common spam phrases
     */
    public function get_common_spam_phrases() {
        return array(
            // English spam phrases
            'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner',
            'click here', 'buy now', 'limited time', 'act now',
            'free money', 'make money fast', 'work from home',
            'weight loss', 'lose weight', 'credit card',
            'online pharmacy', 'prescription drugs',
            
            // German spam phrases
            'gewinnspiel', 'kostenlos', 'gratis',
            'schnell geld verdienen', 'von zu hause arbeiten',
            'abnehmen', 'gewicht verlieren',
            'kreditkarte', 'kredit ohne schufa',
            
            // Common spam patterns
            'http://', 'https://', 'www.',
            '[url=', '[link=', '<a href',
            
            // Crypto spam
            'bitcoin', 'crypto', 'investment opportunity',
            'kryptowährung', 'investitionsmöglichkeit',
            
            // SEO spam
            'seo services', 'backlinks', 'page rank',
            'seo dienstleistungen', 'suchmaschinenoptimierung',
        );
    }
    
    /**
     * Import common spam phrases
     */
    public function import_common_phrases() {
        $current_phrases = $this->settings['blocked_phrases'] ?? array();
        $common_phrases = $this->get_common_spam_phrases();
        
        // Merge and remove duplicates
        $merged = array_unique(array_merge($current_phrases, $common_phrases));
        
        $this->settings['blocked_phrases'] = $merged;
        update_option('germanfence_settings', $this->settings);
        
        return count($merged) - count($current_phrases);
    }
    
    /**
     * Check for suspicious patterns
     */
    public function check_suspicious_patterns($content) {
        $suspicious_patterns = array(
            // Multiple URLs
            '/https?:\/\/[^\s]+.*https?:\/\/[^\s]+/i',
            
            // Excessive special characters
            '/[^a-zA-Z0-9\s]{10,}/',
            
            // Repeated characters
            '/(.)\1{10,}/',
            
            // All caps (more than 50% of text)
            '/[A-Z\s]{50,}/',
            
            // Excessive numbers
            '/\d{15,}/',
            
            // Email pattern repeated
            '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}.*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i',
        );
        
        foreach ($suspicious_patterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Analyze content for spam score
     */
    public function get_spam_score($content) {
        $score = 0;
        
        // Check length
        if (strlen($content) < 10) {
            $score += 20;
        }
        
        // Check for URLs
        $url_count = preg_match_all('/https?:\/\//i', $content);
        $score += $url_count * 15;
        
        // Check for email addresses
        $email_count = preg_match_all('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i', $content);
        $score += $email_count * 10;
        
        // Check for excessive special characters
        $special_char_ratio = $this->get_special_char_ratio($content);
        if ($special_char_ratio > 0.3) {
            $score += 25;
        }
        
        // Check for all caps
        $caps_ratio = $this->get_caps_ratio($content);
        if ($caps_ratio > 0.5) {
            $score += 20;
        }
        
        // Check for blocked phrases
        $blocked_phrases = $this->settings['blocked_phrases'] ?? array();
        foreach ($blocked_phrases as $phrase) {
            if ($this->contains_phrase($content, $phrase)) {
                $score += 30;
            }
        }
        
        // Check for suspicious patterns
        if ($this->check_suspicious_patterns($content)) {
            $score += 25;
        }
        
        return min($score, 100);
    }
    
    /**
     * Get ratio of special characters
     */
    private function get_special_char_ratio($content) {
        $total = strlen($content);
        if ($total === 0) {
            return 0;
        }
        
        $special = preg_match_all('/[^a-zA-Z0-9\s]/', $content);
        return $special / $total;
    }
    
    /**
     * Get ratio of capital letters
     */
    private function get_caps_ratio($content) {
        $letters = preg_match_all('/[a-zA-Z]/', $content);
        if ($letters === 0) {
            return 0;
        }
        
        $caps = preg_match_all('/[A-Z]/', $content);
        return $caps / $letters;
    }
    
    /**
     * Export blocked phrases
     */
    public function export_phrases() {
        $phrases = $this->settings['blocked_phrases'] ?? array();
        return implode("\n", $phrases);
    }
    
    /**
     * Import blocked phrases from text
     */
    public function import_phrases($text) {
        $lines = explode("\n", $text);
        $phrases = array_map('trim', $lines);
        $phrases = array_filter($phrases); // Remove empty lines
        
        $this->settings['blocked_phrases'] = array_unique($phrases);
        update_option('germanfence_settings', $this->settings);
        
        return count($phrases);
    }
}


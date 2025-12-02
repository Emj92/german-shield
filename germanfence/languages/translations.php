<?php
/**
 * GermanFence Translations
 * Quick translation helper for English/German
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Translations {
    
    private static $translations = array(
        'en_US' => array(
            // Plugin Namen
            'GermanFence' => 'GermanFence',
            
            // Admin Navigation
            'Dashboard' => 'Dashboard',
            'Anti-Spam' => 'Anti-Spam',
            'GEO Blocking' => 'GEO Blocking',
            'Phrasen-Blocking' => 'Phrase Blocking',
            'Badge' => 'Badge',
            'Einstellungen' => 'Settings',
            'Lizenz' => 'License',
            
            // Dashboard
            'Spam geblockt (Heute)' => 'Spam Blocked (Today)',
            'Spam geblockt (Gesamt)' => 'Spam Blocked (Total)',
            'Blockierte Länder' => 'Blocked Countries',
            'Erlaubte Länder' => 'Allowed Countries',
            'Blockierte Phrasen' => 'Blocked Phrases',
            
            // Anti-Spam
            'Honeypot' => 'Honeypot',
            'Unsichtbares Feld, das nur Bots ausfüllen. Sehr effektiv und benutzerfreundlich.' => 'Invisible field that only bots fill out. Very effective and user-friendly.',
            'JavaScript-Prüfung' => 'JavaScript Check',
            'Stellt sicher, dass JavaScript aktiviert ist. Blockiert einfache Bots.' => 'Ensures JavaScript is enabled. Blocks simple bots.',
            'User-Agent-Prüfung' => 'User-Agent Check',
            'Blockiert bekannte Bot User-Agents.' => 'Blocks known bot user agents.',
            'Tippgeschwindigkeit-Analyse' => 'Typing Speed Analysis',
            'Erkennt unnatürlich schnelle Bot-Eingaben.' => 'Detects unnaturally fast bot inputs.',
            'Timestamp-Prüfung' => 'Timestamp Check',
            'Blockiert Formulare, die zu schnell oder zu langsam ausgefüllt werden.' => 'Blocks forms filled out too quickly or too slowly.',
            'Kommentar-Bots blockieren' => 'Block Comment Bots',
            'Blockiert automatisierte Bot-Kommentare durch erweiterte Anti-Spam-Prüfungen.' => 'Blocks automated bot comments through advanced anti-spam checks.',
            
            // Honeypot Settings
            'Honeypot-Verwaltung' => 'Honeypot Management',
            'Anzahl aktiver Honeypots:' => 'Number of Active Honeypots:',
            'Mehr Honeypots = besserer Schutz, aber minimal höherer Performance-Impact' => 'More honeypots = better protection, but slightly higher performance impact',
            'Honeypot-Feldnamen:' => 'Honeypot Field Names:',
            'Neu generieren' => 'Regenerate',
            
            // Timestamp Settings
            'Timestamp-Einstellungen' => 'Timestamp Settings',
            'Minimale Ausfüllzeit (Sekunden):' => 'Minimum Fill Time (Seconds):',
            'Formulare, die schneller ausgefüllt werden, werden blockiert. Empfohlen: 3-5 Sekunden' => 'Forms filled faster will be blocked. Recommended: 3-5 seconds',
            'Maximale Formular-Gültigkeit (Sekunden):' => 'Maximum Form Validity (Seconds):',
            'Formulare, die nach dieser Zeit abgesendet werden, sind ungültig. Empfohlen: 3600 (1 Stunde)' => 'Forms submitted after this time are invalid. Recommended: 3600 (1 hour)',
            
            // GEO Blocking
            'GEO Blocking aktivieren' => 'Enable GEO Blocking',
            'Blockiere Anfragen aus bestimmten Ländern.' => 'Block requests from specific countries.',
            'Modus wählen' => 'Select Mode',
            'Einschließlich' => 'Inclusive',
            'Nur ausgewählte Länder sind erlaubt' => 'Only selected countries are allowed',
            'Ausschließlich' => 'Exclusive',
            'Ausgewählte Länder sind blockiert' => 'Selected countries are blocked',
            'Nur diese Länder dürfen Formulare absenden.' => 'Only these countries can submit forms.',
            'Diese Länder können keine Formulare absenden.' => 'These countries cannot submit forms.',
            'Land suchen...' => 'Search country...',
            
            // Phrase Blocking
            'Phrasen-Blocking' => 'Phrase Blocking',
            'PRO-Feature' => 'PRO Feature',
            'ist nur mit einer aktiven Lizenz verfügbar.' => 'is only available with an active license.',
            'Jetzt Lizenz aktivieren' => 'Activate License Now',
            
            // Badge
            'Badge-Einstellungen' => 'Badge Settings',
            'Badge anzeigen' => 'Display Badge',
            'Zeige das "Geschützt durch GermanFence" Badge auf deiner Website.' => 'Show the "Protected by GermanFence" badge on your website.',
            'Badge-Position' => 'Badge Position',
            'Badge-Anzeigetyp' => 'Badge Display Type',
            'Auf ganzer Website anzeigen' => 'Display on entire website',
            'Nur bei Formularen anzeigen' => 'Display only on forms',
            'Farb-Modus' => 'Color Mode',
            'Hell (Standard)' => 'Light (Default)',
            'Dunkel' => 'Dark',
            
            // License
            'Lizenz-Verwaltung' => 'License Management',
            'Lizenzschlüssel' => 'License Key',
            'Lizenz aktivieren' => 'Activate License',
            'Gültig bis' => 'Valid until',
            'Lizenztyp' => 'License Type',
            
            // Buttons & Actions
            'Speichern' => 'Save',
            'Abbrechen' => 'Cancel',
            'Löschen' => 'Delete',
            'Hinzufügen' => 'Add',
            'Bearbeiten' => 'Edit',
            'Aktivieren' => 'Activate',
            'Deaktivieren' => 'Deactivate',
            
            // Messages
            'Einstellungen gespeichert' => 'Settings saved',
            'Fehler beim Speichern' => 'Error saving',
            'Lizenz aktiviert' => 'License activated',
            'Ungültiger Lizenzschlüssel' => 'Invalid license key',
            
            // Stats
            'Heute' => 'Today',
            'Diese Woche' => 'This Week',
            'Dieser Monat' => 'This Month',
            'Gesamt' => 'Total',
            'Keine Daten verfügbar' => 'No data available',
        )
    );
    
    /**
     * Get translation
     */
    public static function get($text) {
        $locale = get_locale();
        
        // Return German text as-is
        if ($locale === 'de_DE' || strpos($locale, 'de') === 0) {
            return $text;
        }
        
        // Return English translation if available
        if (isset(self::$translations['en_US'][$text])) {
            return self::$translations['en_US'][$text];
        }
        
        // Fallback to original text
        return $text;
    }
    
    /**
     * Short alias
     */
    public static function __($text) {
        return self::get($text);
    }
}

/**
 * Helper function
 */
function gf__($text) {
    return GermanFence_Translations::get($text);
}


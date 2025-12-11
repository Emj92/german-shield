<?php
/**
 * Form Detector Class
 * Detects and protects forms from all page builders
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_FormDetector {
    
    private $antispam;
    
    public function __construct() {
        $this->antispam = new GermanFence_AntiSpam();
    }
    
    /**
     * Detect and protect all forms
     */
    public function detect_and_protect_forms() {
        // Contact Form 7 - KRITISCH: Mehrere Hooks für maximalen Schutz!
        add_filter('wpcf7_form_elements', array($this, 'protect_cf7_form'));
        add_filter('wpcf7_spam', array($this, 'validate_cf7_spam'), 10, 2);
        add_action('wpcf7_before_send_mail', array($this, 'block_cf7_mail'), 1, 3);
        add_filter('wpcf7_skip_mail', array($this, 'skip_cf7_mail'), 10, 2);
        
        // CF7 Fehlermeldung anpassen
        add_filter('wpcf7_display_message', array($this, 'cf7_custom_message'), 10, 2);
        
        // Elementor Pro Forms
        add_action('elementor_pro/forms/validation', array($this, 'validate_elementor_form'), 10, 2);
        add_filter('elementor_pro/forms/render/item', array($this, 'protect_elementor_form'), 10, 3);
        
        // Divi Contact Form
        add_filter('et_pb_contact_form_content', array($this, 'protect_divi_form'), 10, 3);
        add_filter('et_contact_page_options', array($this, 'validate_divi_form'), 10, 3);
        
        // Gravity Forms
        add_filter('gform_get_form_filter', array($this, 'protect_gravity_form'), 10, 2);
        add_filter('gform_validation', array($this, 'validate_gravity_form'));
        
        // WPForms
        add_filter('wpforms_frontend_output', array($this, 'protect_wpforms'), 10, 5);
        add_filter('wpforms_process_before_filter', array($this, 'validate_wpforms'), 10, 3);
        
        // Ninja Forms
        add_filter('ninja_forms_display_form_settings', array($this, 'protect_ninja_forms'), 10, 2);
        add_filter('ninja_forms_submit_data', array($this, 'validate_ninja_forms'));
        
        // Formidable Forms
        add_filter('frm_form_fields', array($this, 'protect_formidable'), 10, 2);
        add_filter('frm_validate_entry', array($this, 'validate_formidable'), 10, 2);
        
        // Fluent Forms
        add_filter('fluentform_rendering_form', array($this, 'protect_fluent_forms'), 10, 2);
        add_action('fluentform_before_insert_submission', array($this, 'validate_fluent_forms'), 10, 3);
        
        // Generic WordPress comment form
        add_filter('comment_form_defaults', array($this, 'protect_comment_form'));
        
        // Generic form protection via content filter
        add_filter('the_content', array($this, 'protect_generic_forms'), 999);
    }
    
    /**
     * Contact Form 7 Protection
     */
    public function protect_cf7_form($form) {
        $protection_fields = $this->antispam->get_protection_fields();
        return $form . $protection_fields;
    }
    
    /**
     * CF7 Block-Nachricht für die aktuelle Anfrage speichern
     */
    private $cf7_block_message = '';
    
    /**
     * CF7 Custom Message - Zeigt unsere Fehlermeldung statt "Error"
     */
    public function cf7_custom_message($message, $status) {
        // Wenn wir eine Block-Nachricht haben und Status spam/aborted ist
        if (!empty($this->cf7_block_message) && in_array($status, array('spam', 'aborted', 'mail_failed'))) {
            return $this->cf7_block_message;
        }
        return $message;
    }
    
    public function validate_cf7_spam($spam, $submission) {
        if ($spam) {
            return $spam;
        }
        
        $data = $submission->get_posted_data();
        $validation = $this->perform_validation($data);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[CF7] 🚫 SPAM erkannt: ' . $validation['message']);
            $this->cf7_block_message = $validation['message'];
        }
        
        return !$validation['valid'];
    }
    
    /**
     * Block CF7 mail BEFORE it's sent - CRITICAL for stopping spam!
     */
    public function block_cf7_mail($contact_form, &$abort, $submission) {
        // Nur prüfen wenn noch nicht als Spam markiert
        if ($submission->get_status() === 'spam') {
            $abort = true;
            return;
        }
        
        $data = $submission->get_posted_data();
        $validation = $this->perform_validation($data);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[CF7] 🛑 MAIL GESTOPPT: ' . $validation['message']);
            $abort = true;
            $this->cf7_block_message = $validation['message'];
        }
    }
    
    /**
     * Alternative: Skip mail sending if spam detected
     */
    public function skip_cf7_mail($skip_mail, $contact_form) {
        // Wenn bereits blockiert, überspringen
        if (!empty($this->cf7_block_message)) {
            return true;
        }
        
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[CF7] ⛔ MAIL ÜBERSPRUNGEN: ' . $validation['message']);
            $this->cf7_block_message = $validation['message'];
            return true;
        }
        
        return $skip_mail;
    }
    
    /**
     * Elementor Pro Forms Protection
     */
    public function protect_elementor_form($item, $item_index, $widget) {
        // Add hidden fields to form
        static $protected = false;
        
        if (!$protected) {
            $protection_fields = $this->antispam->get_protection_fields();
            $item['field_html'] .= $protection_fields;
            $protected = true;
        }
        
        return $item;
    }
    
    public function validate_elementor_form($record, $ajax_handler) {
        $data = $record->get('fields');
        
        // Convert to array format
        $form_data = array();
        foreach ($data as $field) {
            $form_data[$field['id']] = $field['value'];
        }
        
        // Add POST data
        $form_data = array_merge($form_data, $_POST);
        
        $validation = $this->perform_validation($form_data);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[Elementor] 🚫 SPAM erkannt: ' . $validation['message']);
            
            // Fehlermeldung setzen
            $ajax_handler->add_error_message($validation['message']);
            
            // Alle Felder als fehlerhaft markieren (stoppt E-Mail-Versand)
            $fields = $record->get('fields');
            foreach ($fields as $field_id => $field) {
                $ajax_handler->add_error($field_id, $validation['message']);
                break; // Nur erstes Feld
            }
        }
    }
    
    /**
     * Divi Contact Form Protection
     */
    public function protect_divi_form($output, $module_id, $function_name) {
        $protection_fields = $this->antispam->get_protection_fields();
        
        // Insert before closing form tag
        $output = str_replace('</form>', $protection_fields . '</form>', $output);
        
        return $output;
    }
    
    public function validate_divi_form($options, $contact_email, $contact_name) {
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[Divi] 🚫 SPAM erkannt: ' . $validation['reason']);
            // KRITISCH: Error zurückgeben stoppt den Versand
            return array('error' => $validation['message']);
        }
        
        return $options;
    }
    
    /**
     * Gravity Forms Protection
     */
    public function protect_gravity_form($form_string, $form) {
        $protection_fields = $this->antispam->get_protection_fields();
        
        // Insert before closing form tag
        $form_string = str_replace('</form>', $protection_fields . '</form>', $form_string);
        
        return $form_string;
    }
    
    public function validate_gravity_form($validation_result) {
        $form = $validation_result['form'];
        
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[GravityForms] 🚫 SPAM erkannt: ' . $validation['reason']);
            
            // KRITISCH: Form als ungültig markieren
            $validation_result['is_valid'] = false;
            
            // Add error to first field
            foreach ($form['fields'] as &$field) {
                $field->failed_validation = true;
                $field->validation_message = $validation['message'];
                break;
            }
        }
        
        $validation_result['form'] = $form;
        return $validation_result;
    }
    
    /**
     * WPForms Protection
     */
    public function protect_wpforms($form_data, $deprecated, $title, $description, $errors) {
        $protection_fields = $this->antispam->get_protection_fields();
        
        // Insert before closing form tag
        $form_data = str_replace('</form>', $protection_fields . '</form>', $form_data);
        
        return $form_data;
    }
    
    public function validate_wpforms($fields, $entry, $form_data) {
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[WPForms] 🚫 SPAM erkannt: ' . $validation['reason']);
            wpforms()->process->errors[$form_data['id']]['header'] = $validation['message'];
            
            // KRITISCH: Felder als ungültig markieren um Versand zu stoppen
            foreach ($fields as $field_id => $field) {
                $fields[$field_id]['error'] = $validation['message'];
                break; // Nur erstes Feld
            }
        }
        
        return $fields;
    }
    
    /**
     * Ninja Forms Protection
     */
    public function protect_ninja_forms($form_settings, $form_id) {
        // Add hidden fields via JavaScript (Ninja Forms uses AJAX)
        add_action('wp_footer', function() {
            ?>
            <script>
            jQuery(document).ready(function($) {
                if (typeof Marionette !== 'undefined') {
                    var germanfenceController = Marionette.Object.extend({
                        initialize: function() {
                            this.listenTo(Backbone.Radio.channel('forms'), 'render:view', this.addProtection);
                        },
                        addProtection: function(view) {
                            var protectionFields = '<?php echo addslashes($this->antispam->get_protection_fields()); ?>';
                            view.$el.find('form').append(protectionFields);
                        }
                    });
                    new germanfenceController();
                }
            });
            </script>
            <?php
        });
        
        return $form_settings;
    }
    
    public function validate_ninja_forms($form_data) {
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[NinjaForms] 🚫 SPAM erkannt: ' . $validation['reason']);
            $form_data['errors']['form']['germanfence'] = $validation['message'];
            $form_data['errors']['fields']['germanfence'] = $validation['message'];
        }
        
        return $form_data;
    }
    
    /**
     * Formidable Forms Protection
     */
    public function protect_formidable($fields, $form) {
        // Add hidden fields
        static $protected = array();
        
        if (!isset($protected[$form->id])) {
            add_filter('frm_form_fields_' . $form->id, function($form_html) {
                $protection_fields = $this->antispam->get_protection_fields();
                return str_replace('</form>', $protection_fields . '</form>', $form_html);
            });
            
            $protected[$form->id] = true;
        }
        
        return $fields;
    }
    
    public function validate_formidable($errors, $values) {
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[Formidable] 🚫 SPAM erkannt: ' . $validation['reason']);
            $errors['form'] = $validation['message'];
        }
        
        return $errors;
    }
    
    /**
     * Fluent Forms Protection
     */
    public function protect_fluent_forms($form, $form_id) {
        add_filter('fluentform_rendering_field_html_' . $form_id, function($html) {
            static $added = false;
            
            if (!$added) {
                $protection_fields = $this->antispam->get_protection_fields();
                $html .= $protection_fields;
                $added = true;
            }
            
            return $html;
        });
        
        return $form;
    }
    
    public function validate_fluent_forms($insertData, $data, $form) {
        $validation = $this->perform_validation($_POST);
        
        if (!$validation['valid']) {
            GermanFence_Logger::log('[FluentForms] 🚫 SPAM erkannt: ' . $validation['reason']);
            
            // KRITISCH: JSON-Fehler senden und Ausführung stoppen
            wp_send_json_error(array(
                'message' => $validation['message'],
                'errors' => array('germanfence' => $validation['message'])
            ), 422);
            exit; // Sicherheitshalber
        }
        
        return $insertData;
    }
    
    /**
     * Comment Form Protection
     */
    public function protect_comment_form($defaults) {
        $protection_fields = $this->antispam->get_protection_fields();
        
        $defaults['comment_field'] .= $protection_fields;
        
        return $defaults;
    }
    
    /**
     * Generic Form Protection
     */
    public function protect_generic_forms($content) {
        // Only process if content contains forms
        if (strpos($content, '<form') === false) {
            return $content;
        }
        
        $protection_fields = $this->antispam->get_protection_fields();
        
        // Insert protection fields before each closing form tag
        $content = preg_replace('/<\/form>/i', $protection_fields . '</form>', $content);
        
        return $content;
    }
    
    /**
     * Perform validation
     */
    private function perform_validation($data) {
        $germanfence = GermanFence::get_instance();
        return $germanfence->perform_validation($data);
    }
    
    /**
     * Detect form builder
     */
    public function detect_active_form_builders() {
        $builders = array();
        
        // Contact Form 7
        if (defined('WPCF7_VERSION')) {
            $builders[] = array(
                'name' => 'Contact Form 7',
                'version' => WPCF7_VERSION,
                'status' => 'active'
            );
        }
        
        // Elementor Pro
        if (defined('ELEMENTOR_PRO_VERSION')) {
            $builders[] = array(
                'name' => 'Elementor Pro',
                'version' => ELEMENTOR_PRO_VERSION,
                'status' => 'active'
            );
        }
        
        // Divi
        if (function_exists('et_divi_fonts_url')) {
            $builders[] = array(
                'name' => 'Divi Builder',
                'version' => et_get_theme_version(),
                'status' => 'active'
            );
        }
        
        // Gravity Forms
        if (class_exists('GFForms')) {
            $builders[] = array(
                'name' => 'Gravity Forms',
                'version' => GFForms::$version,
                'status' => 'active'
            );
        }
        
        // WPForms
        if (function_exists('wpforms')) {
            $builders[] = array(
                'name' => 'WPForms',
                'version' => WPFORMS_VERSION,
                'status' => 'active'
            );
        }
        
        // Ninja Forms
        if (class_exists('Ninja_Forms')) {
            $builders[] = array(
                'name' => 'Ninja Forms',
                'version' => Ninja_Forms::VERSION,
                'status' => 'active'
            );
        }
        
        // Formidable Forms
        if (class_exists('FrmAppHelper')) {
            $builders[] = array(
                'name' => 'Formidable Forms',
                'version' => FrmAppHelper::plugin_version(),
                'status' => 'active'
            );
        }
        
        // Fluent Forms
        if (defined('FLUENTFORM_VERSION')) {
            $builders[] = array(
                'name' => 'Fluent Forms',
                'version' => FLUENTFORM_VERSION,
                'status' => 'active'
            );
        }
        
        return $builders;
    }
}


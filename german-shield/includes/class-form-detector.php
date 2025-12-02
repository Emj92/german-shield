<?php
/**
 * Form Detector Class
 * Detects and protects forms from all page builders
 */

if (!defined('ABSPATH')) {
    exit;
}

class German_Shield_FormDetector {
    
    private $antispam;
    
    public function __construct() {
        $this->antispam = new German_Shield_AntiSpam();
    }
    
    /**
     * Detect and protect all forms
     */
    public function detect_and_protect_forms() {
        // Contact Form 7
        add_filter('wpcf7_form_elements', array($this, 'protect_cf7_form'));
        add_filter('wpcf7_spam', array($this, 'validate_cf7_spam'), 10, 2);
        
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
    
    public function validate_cf7_spam($spam, $submission) {
        if ($spam) {
            return $spam;
        }
        
        $data = $submission->get_posted_data();
        $validation = $this->perform_validation($data);
        
        return !$validation['valid'];
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
            // Nur add_error_message verwenden, nicht add_error (sonst doppelt)
            $ajax_handler->add_error_message($validation['message']);
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
            wpforms()->process->errors[$form_data['id']]['header'] = $validation['message'];
        }
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
                    var germanShieldController = Marionette.Object.extend({
                        initialize: function() {
                            this.listenTo(Backbone.Radio.channel('forms'), 'render:view', this.addProtection);
                        },
                        addProtection: function(view) {
                            var protectionFields = '<?php echo addslashes($this->antispam->get_protection_fields()); ?>';
                            view.$el.find('form').append(protectionFields);
                        }
                    });
                    new germanShieldController();
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
            $form_data['errors']['form'] = $validation['message'];
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
            $errors['german_shield'] = $validation['message'];
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
            wp_send_json_error(array(
                'message' => $validation['message']
            ), 422);
        }
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
        $german_shield = German_Shield::get_instance();
        return $german_shield->perform_validation($data);
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


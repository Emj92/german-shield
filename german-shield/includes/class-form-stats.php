<?php
/**
 * Form Stats Class - Erkennt Formulare und Hersteller
 */

if (!defined('ABSPATH')) {
    exit;
}

class German_Shield_Form_Stats {
    
    public function get_detected_forms() {
        $forms = array();
        $total = 0;
        
        // Contact Form 7
        if (defined('WPCF7_VERSION')) {
            $cf7_forms = get_posts(array(
                'post_type' => 'wpcf7_contact_form',
                'posts_per_page' => -1
            ));
            $count = count($cf7_forms);
            if ($count > 0) {
                $forms[] = array(
                    'name' => 'Contact Form 7',
                    'count' => $count,
                    'icon' => '📧',
                    'version' => WPCF7_VERSION
                );
                $total += $count;
            }
        }
        
        // Elementor Pro Forms
        if (defined('ELEMENTOR_PRO_VERSION')) {
            // Elementor Forms sind in Templates gespeichert
            $elementor_forms = $this->count_elementor_forms();
            if ($elementor_forms > 0) {
                $forms[] = array(
                    'name' => 'Elementor Pro',
                    'count' => $elementor_forms,
                    'icon' => '⚡',
                    'version' => ELEMENTOR_PRO_VERSION
                );
                $total += $elementor_forms;
            }
        }
        
        // Gravity Forms
        if (class_exists('GFForms')) {
            $gf_forms = \GFAPI::get_forms();
            $count = count($gf_forms);
            if ($count > 0) {
                $forms[] = array(
                    'name' => 'Gravity Forms',
                    'count' => $count,
                    'icon' => '🎯',
                    'version' => \GFForms::$version
                );
                $total += $count;
            }
        }
        
        // WPForms
        if (function_exists('wpforms')) {
            $wpforms = wpforms()->form->get();
            $count = count($wpforms);
            if ($count > 0) {
                $forms[] = array(
                    'name' => 'WPForms',
                    'count' => $count,
                    'icon' => '📝',
                    'version' => WPFORMS_VERSION
                );
                $total += $count;
            }
        }
        
        // Ninja Forms
        if (class_exists('Ninja_Forms')) {
            $ninja_forms = Ninja_Forms()->form()->get_forms();
            $count = count($ninja_forms);
            if ($count > 0) {
                $forms[] = array(
                    'name' => 'Ninja Forms',
                    'count' => $count,
                    'icon' => '🥷',
                    'version' => Ninja_Forms::VERSION
                );
                $total += $count;
            }
        }
        
        // Formidable Forms
        if (class_exists('FrmForm')) {
            $frm_forms = \FrmForm::get_published_forms();
            $count = count($frm_forms);
            if ($count > 0) {
                $forms[] = array(
                    'name' => 'Formidable Forms',
                    'count' => $count,
                    'icon' => '💪',
                    'version' => \FrmAppHelper::plugin_version()
                );
                $total += $count;
            }
        }
        
        // Fluent Forms
        if (defined('FLUENTFORM_VERSION')) {
            global $wpdb;
            $count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}fluentform_forms WHERE status = 'published'");
            if ($count > 0) {
                $forms[] = array(
                    'name' => 'Fluent Forms',
                    'count' => $count,
                    'icon' => '💧',
                    'version' => FLUENTFORM_VERSION
                );
                $total += $count;
            }
        }
        
        return array(
            'forms' => $forms,
            'total' => $total
        );
    }
    
    private function count_elementor_forms() {
        if (!class_exists('\Elementor\Plugin')) {
            return 0;
        }
        
        global $wpdb;
        
        // Hole alle VERÖFFENTLICHTEN Posts/Pages mit Elementor Data
        $posts = $wpdb->get_results("
            SELECT DISTINCT pm.post_id, pm.meta_value 
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            WHERE pm.meta_key = '_elementor_data'
            AND p.post_status = 'publish'
            AND p.post_type IN ('page', 'post')
        ");
        
        $form_count = 0;
        
        foreach ($posts as $post) {
            $data = json_decode($post->meta_value, true);
            if (is_array($data)) {
                $form_count += $this->count_forms_in_elementor_data($data);
            }
        }
        
        return $form_count;
    }
    
    private function count_forms_in_elementor_data($elements) {
        $count = 0;
        
        if (!is_array($elements)) {
            return 0;
        }
        
        foreach ($elements as $element) {
            // Prüfe ob es ein Form Widget ist
            if (isset($element['widgetType']) && $element['widgetType'] === 'form') {
                $count++;
            }
            
            // Rekursiv in Kindern suchen
            if (isset($element['elements']) && is_array($element['elements'])) {
                $count += $this->count_forms_in_elementor_data($element['elements']);
            }
        }
        
        return $count;
    }
}


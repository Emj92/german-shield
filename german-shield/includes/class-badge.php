<?php
/**
 * Badge Class - Frontend Badge Display
 */

if (!defined('ABSPATH')) {
    exit;
}

class German_Shield_Badge {
    
    private $settings;
    
    public function __construct() {
        $this->settings = get_option('german_shield_settings', array());
        
        if (!empty($this->settings['badge_enabled'])) {
            $display_type = $this->settings['badge_display_type'] ?? 'global';
            
            if ($display_type === 'global') {
                // Global: Auf jeder Seite anzeigen
                add_action('wp_footer', array($this, 'render_badge'));
            } else {
                // Forms: Nur bei Formularen anzeigen (JS-basiert)
                add_action('wp_footer', array($this, 'render_badge_forms_mode'));
            }
            
            add_action('wp_enqueue_scripts', array($this, 'enqueue_badge_styles'));
        }
    }
    
    public function enqueue_badge_styles() {
        // Inline-Style direkt im Head ausgeben
        $display_type = $this->settings['badge_display_type'] ?? 'global';
        add_action('wp_head', function() use ($display_type) {
            echo '<style>' . $this->get_badge_css($display_type) . '</style>';
        });
    }
    
    public function render_badge() {
        $position = $this->settings['badge_position'] ?? 'bottom-right';
        $text = $this->settings['badge_text'] ?? 'Geschützt durch German Shield';
        $custom_image = $this->settings['badge_custom_image'] ?? '';
        $text_color = $this->settings['badge_text_color'] ?? '#1d2327';
        
        $position_styles = array(
            'bottom-right' => 'bottom: 20px; right: 20px;',
            'bottom-left' => 'bottom: 20px; left: 20px;',
            'top-right' => 'top: 20px; right: 20px;',
            'top-left' => 'top: 20px; left: 20px;',
        );
        
        $style = $position_styles[$position] ?? $position_styles['bottom-right'];
        
        ?>
        <div class="german-shield-badge" style="<?php echo esc_attr($style); ?>">
            <div class="german-shield-badge-inner">
                <?php if ($custom_image): ?>
                    <img src="<?php echo esc_url($custom_image); ?>" alt="Shield" class="german-shield-badge-icon">
                <?php else: ?>
                    <img src="<?php echo GERMAN_SHIELD_PLUGIN_URL . 'assets/images/logo_klein.png'; ?>" alt="German Shield" class="german-shield-badge-icon">
                <?php endif; ?>
                <span class="german-shield-badge-text" style="color: <?php echo esc_attr($text_color); ?>;"><?php echo esc_html($text); ?></span>
            </div>
        </div>
        <?php
    }
    
    public function render_badge_forms_mode() {
        $position = $this->settings['badge_position'] ?? 'bottom-right';
        $text = $this->settings['badge_text'] ?? 'Geschützt durch German Shield';
        $custom_image = $this->settings['badge_custom_image'] ?? '';
        $text_color = $this->settings['badge_text_color'] ?? '#1d2327';
        
        // Position für lokal am Formular: above/below
        $alignment_map = array(
            'bottom-right' => 'right',
            'bottom-left' => 'left',
            'top-right' => 'right',
            'top-left' => 'left',
        );
        
        $position_type = (strpos($position, 'top') !== false) ? 'above' : 'below';
        $alignment = $alignment_map[$position] ?? 'right';
        
        ?>
        <!-- Badge Template (wird per JS zu Formularen hinzugefügt) -->
        <template id="german-shield-badge-template">
            <div class="german-shield-badge-form-local" style="text-align: <?php echo esc_attr($alignment); ?>; margin: 15px 0;">
                <div class="german-shield-badge-inner">
                    <?php if ($custom_image): ?>
                        <img src="<?php echo esc_url($custom_image); ?>" alt="Shield" class="german-shield-badge-icon">
                    <?php else: ?>
                        <img src="<?php echo GERMAN_SHIELD_PLUGIN_URL . 'assets/images/logo_klein.png'; ?>" alt="German Shield" class="german-shield-badge-icon">
                    <?php endif; ?>
                    <span class="german-shield-badge-text" style="color: <?php echo esc_attr($text_color); ?>;"><?php echo esc_html($text); ?></span>
                </div>
            </div>
        </template>
        
        <script>
        (function() {
            const positionType = '<?php echo esc_js($position_type); ?>'; // 'above' oder 'below'
            
            function addBadgeToForms() {
                const template = document.getElementById('german-shield-badge-template');
                if (!template) return;
                
                // Suche alle Formular-Wrapper
                const formSelectors = [
                    '.wpcf7',                    // Contact Form 7
                    '.wpforms-container',        // WPForms
                    '.gform_wrapper',            // Gravity Forms
                    '.nf-form-wrap',             // Ninja Forms
                    'form.elementor-form',       // Elementor Forms
                    'form[data-german-shield]'   // Custom Forms mit Marker
                ];
                
                formSelectors.forEach(function(selector) {
                    const containers = document.querySelectorAll(selector);
                    
                    containers.forEach(function(container) {
                        // Prüfe ob Badge schon vorhanden
                        if (container.querySelector('.german-shield-badge-form-local')) {
                            return;
                        }
                        
                        // Clone Badge aus Template
                        const badge = template.content.cloneNode(true);
                        
                        // Füge Badge hinzu
                        if (positionType === 'above') {
                            container.insertBefore(badge, container.firstChild);
                        } else {
                            container.appendChild(badge);
                        }
                    });
                });
                
                // Fallback: Normale Forms ohne spezielle Wrapper
                const normalForms = document.querySelectorAll('form:not([class*="comment"]):not([role="search"])');
                normalForms.forEach(function(form) {
                    // Nur wenn noch nicht in einem der oberen Container
                    const isInFormContainer = formSelectors.some(function(sel) {
                        return form.closest(sel) !== null;
                    });
                    
                    if (!isInFormContainer && !form.querySelector('.german-shield-badge-form-local')) {
                        const badge = template.content.cloneNode(true);
                        
                        if (positionType === 'above') {
                            form.insertBefore(badge, form.firstChild);
                        } else {
                            form.appendChild(badge);
                        }
                    }
                });
            }
            
            // Beim Laden ausführen
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(addBadgeToForms, 500);
                });
            } else {
                setTimeout(addBadgeToForms, 500);
            }
            
            // Auch nach 2s nochmal (für dynamisch geladene Formulare)
            setTimeout(addBadgeToForms, 2000);
        })();
        </script>
        <?php
    }
    
    private function get_badge_css($display_type = 'global') {
        $css = '
        /* Common Styles */
        .german-shield-badge-icon {
            width: 24px;
            height: 24px;
            object-fit: contain;
        }
        
        .german-shield-badge-icon img {
            width: 20px;
            height: 20px;
            object-fit: contain;
        }
        
        .german-shield-badge-text {
            font-size: 13px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        @keyframes german-shield-fade-in {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        ';
        
        if ($display_type === 'global') {
            // NUR Global-Badge CSS (Fixed Position)
            $css .= '
        /* Global Badge (Fixed Position) */
        .german-shield-badge {
            position: fixed !important;
            z-index: 999999;
            animation: german-shield-fade-in 0.5s ease;
        }
        
        .german-shield-badge > .german-shield-badge-inner {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            padding: 10px 16px;
            border-radius: 6px;
            border: 1px solid #22D6DD;
            box-shadow: 0 2px 8px rgba(34, 214, 221, 0.2);
            transition: all 0.3s ease;
            cursor: default;
        }
        
        .german-shield-badge > .german-shield-badge-inner:hover {
            box-shadow: 0 4px 12px rgba(34, 214, 221, 0.3);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .german-shield-badge > .german-shield-badge-inner {
                padding: 8px 12px;
                font-size: 11px;
            }
        }
            ';
        } else {
            // NUR Form-Local Badge CSS (Static Position)
            $css .= '
        /* Form-Local Badge (Static/Relative Position) */
        .german-shield-badge-form-local {
            position: relative !important;
            z-index: 10;
            animation: german-shield-fade-in 0.5s ease;
        }
        
        .german-shield-badge-form-local .german-shield-badge-inner {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            padding: 10px 16px;
            border-radius: 6px;
            border: 1px solid #22D6DD;
            box-shadow: 0 2px 8px rgba(34, 214, 221, 0.2);
            transition: all 0.3s ease;
            cursor: default;
        }
        
        .german-shield-badge-form-local .german-shield-badge-inner:hover {
            box-shadow: 0 4px 12px rgba(34, 214, 221, 0.3);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .german-shield-badge-form-local .german-shield-badge-inner {
                padding: 8px 12px;
                font-size: 11px;
            }
            .german-shield-badge-form-local {
                margin: 10px 0;
            }
        }
            ';
        }
        
        return $css;
    }
}


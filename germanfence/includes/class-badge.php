<?php
/**
 * Badge Class - Frontend Badge Display
 */

if (!defined('ABSPATH')) {
    exit;
}

class GermanFence_Badge {
    
    private $settings;
    
    public function __construct() {
        $this->settings = get_option('germanfence_settings', array());
        
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
        $text = $this->settings['badge_text'] ?? 'Geschützt durch GermanFence';
        $custom_image = $this->settings['badge_custom_image'] ?? '';
        $text_color = $this->settings['badge_text_color'] ?? '#1d2327';
        $border_color = $this->settings['badge_border_color'] ?? '#22D6DD';
        $background_color = $this->settings['badge_background_color'] ?? '#ffffff';
        $shadow_color = $this->settings['badge_shadow_color'] ?? '#22D6DD';
        $border_radius = $this->settings['badge_border_radius'] ?? 6;
        
        $position_styles = array(
            'bottom-right' => 'bottom: 20px; right: 20px;',
            'bottom-left' => 'bottom: 20px; left: 20px;',
            'top-right' => 'top: 20px; right: 20px;',
            'top-left' => 'top: 20px; left: 20px;',
        );
        
        $style = $position_styles[$position] ?? $position_styles['bottom-right'];
        
        // Konvertiere Hex zu RGB für Shadow
        $shadow_rgb = $this->hex_to_rgb($shadow_color);
        
        ?>
        <div class="germanfence-badge" style="<?php echo esc_attr($style); ?>">
            <a href="https://germanfence.de" target="_blank" rel="noopener noreferrer" class="germanfence-badge-inner" 
               style="text-decoration: none; background: <?php echo esc_attr($background_color); ?>; border-color: <?php echo esc_attr($border_color); ?>; border-radius: <?php echo esc_attr($border_radius); ?>px; box-shadow: 0 2px 8px rgba(<?php echo esc_attr($shadow_rgb); ?>, 0.2);">
                <?php if ($custom_image): ?>
                    <img src="<?php echo esc_url($custom_image); ?>" alt="Shield" class="germanfence-badge-icon">
                <?php else: ?>
                    <img src="<?php echo GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence-icon.png'; ?>" alt="GermanFence" class="germanfence-badge-icon">
                <?php endif; ?>
                <span class="germanfence-badge-text" style="color: <?php echo esc_attr($text_color); ?>;"><?php echo esc_html($text); ?></span>
            </a>
        </div>
        <?php
    }
    
    public function render_badge_forms_mode() {
        $position = $this->settings['badge_position'] ?? 'bottom-right';
        $text = $this->settings['badge_text'] ?? 'Geschützt durch GermanFence';
        $custom_image = $this->settings['badge_custom_image'] ?? '';
        $text_color = $this->settings['badge_text_color'] ?? '#1d2327';
        $border_color = $this->settings['badge_border_color'] ?? '#22D6DD';
        $background_color = $this->settings['badge_background_color'] ?? '#ffffff';
        $shadow_color = $this->settings['badge_shadow_color'] ?? '#22D6DD';
        $border_radius = $this->settings['badge_border_radius'] ?? 6;
        
        // Position für lokal am Formular: above/below
        $alignment_map = array(
            'bottom-right' => 'right',
            'bottom-left' => 'left',
            'top-right' => 'right',
            'top-left' => 'left',
        );
        
        $position_type = (strpos($position, 'top') !== false) ? 'above' : 'below';
        $alignment = $alignment_map[$position] ?? 'right';
        
        // Konvertiere Hex zu RGB für Shadow
        $shadow_rgb = $this->hex_to_rgb($shadow_color);
        
        ?>
        <!-- Badge Template (wird per JS zu Formularen hinzugefügt) -->
        <template id="germanfence-badge-template">
            <div class="germanfence-badge-form-local" style="text-align: <?php echo esc_attr($alignment); ?>; margin: 15px 0;">
                <a href="https://germanfence.de" target="_blank" rel="noopener noreferrer" class="germanfence-badge-inner" 
                   style="text-decoration: none; background: <?php echo esc_attr($background_color); ?>; border-color: <?php echo esc_attr($border_color); ?>; border-radius: <?php echo esc_attr($border_radius); ?>px; box-shadow: 0 2px 8px rgba(<?php echo esc_attr($shadow_rgb); ?>, 0.2);">
                    <?php if ($custom_image): ?>
                        <img src="<?php echo esc_url($custom_image); ?>" alt="Shield" class="germanfence-badge-icon">
                    <?php else: ?>
                        <img src="<?php echo GERMANFENCE_PLUGIN_URL . 'assets/images/germanfence-icon.png'; ?>" alt="GermanFence" class="germanfence-badge-icon">
                    <?php endif; ?>
                    <span class="germanfence-badge-text" style="color: <?php echo esc_attr($text_color); ?>;"><?php echo esc_html($text); ?></span>
                </a>
            </div>
        </template>
        
        <script>
        (function() {
            const positionType = '<?php echo esc_js($position_type); ?>'; // 'above' oder 'below'
            
            function addBadgeToForms() {
                const template = document.getElementById('germanfence-badge-template');
                if (!template) return;
                
                // Suche alle Formular-Wrapper
                const formSelectors = [
                    '.wpcf7',                    // Contact Form 7
                    '.wpforms-container',        // WPForms
                    '.gform_wrapper',            // Gravity Forms
                    '.nf-form-wrap',             // Ninja Forms
                    'form.elementor-form',       // Elementor Forms
                    'form[data-germanfence]'   // Custom Forms mit Marker
                ];
                
                formSelectors.forEach(function(selector) {
                    const containers = document.querySelectorAll(selector);
                    
                    containers.forEach(function(container) {
                        // Prüfe ob Badge schon vorhanden
                        if (container.querySelector('.germanfence-badge-form-local')) {
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
                    
                    if (!isInFormContainer && !form.querySelector('.germanfence-badge-form-local')) {
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
        $shadow_color = $this->settings['badge_shadow_color'] ?? '#22D6DD';
        $border_radius = $this->settings['badge_border_radius'] ?? 6;
        $shadow_rgb = $this->hex_to_rgb($shadow_color);
        
        $css = '
        /* Common Styles */
        .germanfence-badge-icon {
            width: 24px;
            height: 24px;
            object-fit: contain;
        }
        
        .germanfence-badge-icon img {
            width: 20px;
            height: 20px;
            object-fit: contain;
        }
        
        .germanfence-badge-text {
            font-size: 13px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        @keyframes germanfence-fade-in {
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
        .germanfence-badge {
            position: fixed !important;
            z-index: 999999;
            animation: germanfence-fade-in 0.5s ease;
        }
        
        .germanfence-badge > .germanfence-badge-inner {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            padding: 10px 16px;
            border-radius: ' . esc_attr($border_radius) . 'px;
            border: 1px solid #22D6DD;
            box-shadow: 0 2px 8px rgba(' . esc_attr($shadow_rgb) . ', 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .germanfence-badge > .germanfence-badge-inner:hover {
            box-shadow: 0 4px 12px rgba(' . esc_attr($shadow_rgb) . ', 0.3);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .germanfence-badge > .germanfence-badge-inner {
                padding: 8px 12px;
                font-size: 11px;
            }
        }
            ';
        } else {
            // NUR Form-Local Badge CSS (Static Position)
            $css .= '
        /* Form-Local Badge (Static/Relative Position) */
        .germanfence-badge-form-local {
            position: relative !important;
            z-index: 10;
            animation: germanfence-fade-in 0.5s ease;
        }
        
        .germanfence-badge-form-local .germanfence-badge-inner {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            padding: 10px 16px;
            border-radius: ' . esc_attr($border_radius) . 'px;
            border: 1px solid #22D6DD;
            box-shadow: 0 2px 8px rgba(' . esc_attr($shadow_rgb) . ', 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .germanfence-badge-form-local .germanfence-badge-inner:hover {
            box-shadow: 0 4px 12px rgba(' . esc_attr($shadow_rgb) . ', 0.3);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .germanfence-badge-form-local .germanfence-badge-inner {
                padding: 8px 12px;
                font-size: 11px;
            }
            .germanfence-badge-form-local {
                margin: 10px 0;
            }
        }
            ';
        }
        
        return $css;
    }
    
    private function hex_to_rgb($hex) {
        $hex = ltrim($hex, '#');
        
        if (strlen($hex) == 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        return "$r, $g, $b";
    }
}


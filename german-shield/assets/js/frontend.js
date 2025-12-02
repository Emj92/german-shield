/**
 * German Shield Frontend JavaScript - Optimiert
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Generate JavaScript token mit Session-Token
        function generateToken(timestamp, sessionToken) {
            // SHA-256 Hash (vereinfacht)
            return CryptoJS ? 
                CryptoJS.SHA256(sessionToken + timestamp).toString() : 
                simpleHash(sessionToken + timestamp);
        }
        
        // Simple hash function (Fallback ohne CryptoJS)
        function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16).padStart(16, '0');
        }
        
        // Add protection fields to all forms
        function protectForms() {
            $('form').each(function() {
                const $form = $(this);
                
                // Skip if already protected
                if ($form.hasClass('gs-protected')) {
                    return;
                }
                
                // Skip admin forms
                if ($form.closest('#wpadminbar, .wp-admin').length > 0) {
                    return;
                }
                
                // Skip search forms
                if ($form.attr('role') === 'search' || $form.hasClass('search-form')) {
                    return;
                }
                
                // Skip login/register forms
                if ($form.attr('id') === 'loginform' || $form.attr('id') === 'registerform') {
                    return;
                }
                
                // Add honeypot field
                if (germanShield.honeypot) {
                    $form.append(
                        $('<input>')
                            .attr('type', 'text')
                            .attr('name', germanShield.honeypot)
                            .addClass('gs-honeypot')
                            .attr('tabindex', '-1')
                            .attr('autocomplete', 'new-password')
                            .attr('aria-hidden', 'true')
                            .val('')
                    );
                }
                
                // Add timestamp field
                $form.append(
                    $('<input>')
                        .attr('type', 'hidden')
                        .attr('name', 'gs_timestamp')
                        .addClass('gs-timestamp')
                        .val(germanShield.timestamp)
                );
                
                // Add JavaScript token field
                const jsToken = $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'gs_js_token')
                    .addClass('gs-js-token')
                    .val('');
                
                $form.append(jsToken);
                
                // Add nonce field
                $form.append(
                    $('<input>')
                        .attr('type', 'hidden')
                        .attr('name', 'gs_nonce')
                        .val(germanShield.nonce)
                );
                
                // Mark as protected
                $form.addClass('gs-protected');
                
                // Trigger custom event
                $(document).trigger('germanShieldProtected', {form: $form[0]});
            });
        }
        
        // Generate and set JS tokens
        function setJsTokens() {
            $('.gs-js-token').each(function() {
                const $form = $(this).closest('form');
                const timestamp = $form.find('input[name="gs_timestamp"]').val();
                
                if (timestamp && germanShield.sessionToken) {
                    const token = simpleHash(germanShield.sessionToken + timestamp);
                    $(this).val(token);
                }
            });
        }
        
        // Mouse movement tracking (Bot-Erkennung)
        let mouseMovements = 0;
        let lastMouseTime = Date.now();
        
        $(document).on('mousemove', function() {
            const now = Date.now();
            if (now - lastMouseTime > 100) { // Throttle
                mouseMovements++;
                lastMouseTime = now;
            }
        });
        
        // Keyboard interaction tracking mit Tippgeschwindigkeit
        let keyPresses = 0;
        let keyTimes = [];
        let firstKeyTime = null;
        let lastKeyTime = null;
        
        $(document).on('keydown', 'form input[type="text"], form input[type="email"], form textarea', function(e) {
            // Nur sichtbare Zeichen zählen (keine Ctrl/Alt/Shift etc.)
            if (e.key.length === 1) {
                const now = Date.now();
                keyPresses++;
                
                if (firstKeyTime === null) {
                    firstKeyTime = now;
                } else {
                    // Zeit seit letztem Tastendruck
                    if (lastKeyTime !== null) {
                        keyTimes.push(now - lastKeyTime);
                    }
                }
                
                lastKeyTime = now;
            }
        });
        
        // Protect forms on page load
        protectForms();
        setJsTokens();
        
        // Re-protect forms after AJAX (for dynamic forms)
        $(document).ajaxComplete(function() {
            setTimeout(function() {
                protectForms();
                setJsTokens();
            }, 100);
        });
        
        // Handle Elementor forms
        if (typeof elementorFrontend !== 'undefined' && elementorFrontend.hooks) {
            elementorFrontend.hooks.addAction('frontend/element_ready/form.default', function($scope) {
                setTimeout(function() {
                    protectForms();
                    setJsTokens();
                }, 100);
            });
        }
        
        // Handle Contact Form 7
        $(document).on('wpcf7:init wpcf7mailsent wpcf7invalid', function() {
            setTimeout(function() {
                protectForms();
                setJsTokens();
            }, 100);
        });
        
        // Handle Divi forms
        if (typeof window.et_pb_custom !== 'undefined') {
            $(window).on('load', function() {
                setTimeout(function() {
                    protectForms();
                    setJsTokens();
                }, 500);
            });
        }
        
        // Monitor for new forms (MutationObserver)
        const observer = new MutationObserver(function(mutations) {
            let formsAdded = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.tagName === 'FORM' || $(node).find('form').length > 0) {
                                formsAdded = true;
                            }
                        }
                    });
                }
            });
            
            if (formsAdded) {
                setTimeout(function() {
                    protectForms();
                    setJsTokens();
                }, 100);
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Update fields before form submission
        $('body').on('submit', 'form.gs-protected', function(e) {
            const $form = $(this);
            
            // Update timestamp to actual submission time
            const submitTimestamp = Math.floor(Date.now() / 1000);
            const $timestampField = $form.find('input[name="gs_timestamp"]');
            
            // Nur updaten wenn Differenz > 1 Sekunde
            if (Math.abs(submitTimestamp - $timestampField.val()) > 1) {
                $timestampField.val(germanShield.timestamp);
            }
            
            // Regenerate JS token with current values
            if (germanShield.sessionToken) {
                const token = simpleHash(germanShield.sessionToken + germanShield.timestamp);
                $form.find('.gs-js-token').val(token);
            }
            
            // Ensure honeypot is still empty
            $form.find('.gs-honeypot').val('');
            
            // Add human behavior indicators
            $form.append(
                $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'gs_mouse_movements')
                    .val(mouseMovements)
            );
            
            $form.append(
                $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'gs_key_presses')
                    .val(keyPresses)
            );
            
            // Tippgeschwindigkeit berechnen
            let avgTypingSpeed = 0;
            if (keyTimes.length > 0) {
                const sum = keyTimes.reduce((a, b) => a + b, 0);
                avgTypingSpeed = Math.round(sum / keyTimes.length); // Durchschnitt in ms
            }
            
            $form.append(
                $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'gs_typing_speed')
                    .val(avgTypingSpeed)
            );
            
            $form.append(
                $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'gs_typing_keys')
                    .val(keyTimes.length)
            );
            
            // Check if form was filled too quickly (additional client-side check)
            const formLoadTime = parseInt($timestampField.val());
            const timeSpent = submitTimestamp - formLoadTime;
            
            if (timeSpent < 2) {
                e.preventDefault();
                alert('Bitte nehmen Sie sich einen Moment Zeit, um das Formular auszufüllen.');
                return false;
            }
        });
        
        // Prevent bots from filling honeypot
        $(document).on('focus change', '.gs-honeypot', function() {
            // If a real user somehow interacts with honeypot, clear it
            $(this).val('');
        });
        
        // Add aria-hidden to honeypot for accessibility
        $('.gs-honeypot').attr('aria-hidden', 'true');
        
        // Prevent form resubmission on back button
        if (window.performance && window.performance.navigation.type === 2) {
            // Page was accessed by navigating back
            $('form.gs-protected').each(function() {
                this.reset();
                protectForms();
                setJsTokens();
            });
        }
        
        // Add visual feedback for blocked submissions (optional)
        $(document).on('germanShieldBlocked', function(e, data) {
            console.warn('German Shield: Submission blocked', data);
        });
        
        // Debug mode (nur wenn WP_DEBUG aktiv)
        if (typeof germanShield.debug !== 'undefined' && germanShield.debug) {
            console.log('German Shield: Forms protected', $('.gs-protected').length);
            console.log('German Shield: Honeypot field', germanShield.honeypot);
            console.log('German Shield: Timestamp', germanShield.timestamp);
        }
    });
    
})(jQuery);

/**
 * German Shield Admin JavaScript
 * STABLE VERSION - Minimal, Robust, Fehler-Tolerant
 */

(function($) {
    'use strict';
    
    // Log Helper
    function log(msg, data) {
        console.log('[GS] ' + msg, data || '');
    }
    
    // Error Helper
    function error(msg, err) {
        console.error('[GS] ERROR: ' + msg, err || '');
    }

    $(document).ready(function() {
        log('Initialisiere Admin JS...');
        log('jQuery Version:', $.fn.jquery);
        log('Document Ready gefeuert');
        
        // 1. Basis-Checks
        if (typeof germanfenceAdmin === 'undefined') {
            error('germanfenceAdmin Object fehlt!');
            return;
        }
        
        log('germanfenceAdmin vorhanden:', germanfenceAdmin);
        
        // 1.5 Theme Switcher
        var darkMode = localStorage.getItem('germanfence_darkMode') === 'true';
        if (darkMode) {
            $('body').addClass('germanfence-dark-mode');
            $('.theme-icon-light').hide();
            $('.theme-icon-dark').show();
        }
        
        $('#germanfence-theme-toggle').on('click', function() {
            $('body').toggleClass('germanfence-dark-mode');
            var isDark = $('body').hasClass('germanfence-dark-mode');
            localStorage.setItem('germanfence_darkMode', isDark);
            
            if (isDark) {
                $('.theme-icon-light').hide();
                $('.theme-icon-dark').show();
            } else {
                $('.theme-icon-light').show();
                $('.theme-icon-dark').hide();
            }
            
            log('Theme gewechselt:', isDark ? 'Dark' : 'Light');
        });
        
        // 1.6 Language Switcher mit echten Übersetzungen
        var currentLang = localStorage.getItem('germanfence_language') || 'de';
        
        var translations = {
            de: {
                'Dashboard': 'Dashboard',
                'Anti-Spam': 'Anti-Spam',
                'GEO Blocking': 'GEO Blocking',
                'Phrasen-Blocking': 'Phrasen-Blocking',
                'Badge': 'Badge',
                'WordPress Spam': 'WordPress Spam',
                'Lizenz': 'Lizenz',
                'Blockierte Anfragen': 'Blockierte Anfragen',
                'Legitime Anfragen': 'Legitime Anfragen',
                'Block-Rate': 'Block-Rate',
                'Heute blockiert': 'Heute blockiert',
                'Geschützte Formulare': 'Geschützte Formulare',
                'Letzte Anfragen': 'Letzte Anfragen',
                'Zeit': 'Zeit',
                'Status': 'Status',
                'IP-Adresse': 'IP-Adresse',
                'Land': 'Land',
                'Details': 'Details',
                'Aktion': 'Aktion',
                'Alle': 'Alle',
                'Blockiert': 'Geblockt',
                'Legitim': 'Legitim'
            },
            en: {
                'Dashboard': 'Dashboard',
                'Anti-Spam': 'Anti-Spam',
                'GEO Blocking': 'GEO Blocking',
                'Phrasen-Blocking': 'Phrase Blocking',
                'Badge': 'Badge',
                'WordPress Spam': 'WordPress Spam',
                'Lizenz': 'License',
                'Blockierte Anfragen': 'Blocked Requests',
                'Legitime Anfragen': 'Legitimate Requests',
                'Block-Rate': 'Block Rate',
                'Heute blockiert': 'Blocked Today',
                'Geschützte Formulare': 'Protected Forms',
                'Letzte Anfragen': 'Recent Requests',
                'Zeit': 'Time',
                'Status': 'Status',
                'IP-Adresse': 'IP Address',
                'Land': 'Country',
                'Details': 'Details',
                'Aktion': 'Action',
                'Alle': 'All',
                'Blockiert': 'Blocked',
                'Geblockt': 'Blocked',
                'Legitim': 'Legitimate'
            }
        };
        
        function translateUI(lang) {
            var t = translations[lang];
            
            // Tab-Namen übersetzen
            $('.germanfence-tab').each(function() {
                var $tab = $(this);
                var text = $tab.text().trim();
                if (t[text]) {
                    var icon = $tab.find('.dashicons').prop('outerHTML');
                    var proBadge = $tab.find('.pro-badge').prop('outerHTML') || '';
                    $tab.html(icon + ' ' + t[text] + ' ' + proBadge);
                }
            });
            
            // Stat-Card Beschreibungen
            $('.germanfence-stat-card p').each(function() {
                var $p = $(this);
                var text = $p.text().trim();
                if (t[text]) {
                    $p.text(t[text]);
                }
            });
            
            // Tabellen-Header
            $('.germanfence-table thead th').each(function() {
                var $th = $(this);
                var text = $th.text().trim();
                if (t[text]) {
                    $th.text(t[text]);
                }
            });
            
            // Filter-Buttons
            $('.stats-filter-btn').each(function() {
                var $btn = $(this);
                var filter = $btn.data('filter');
                if (filter === 'all') {
                    $btn.html('📊 ' + t['Alle']);
                } else if (filter === 'blocked') {
                    $btn.html('🚫 ' + t['Blockiert']);
                } else if (filter === 'legitimate') {
                    $btn.html('✅ ' + t['Legitim']);
                }
            });
            
            // "Verlauf löschen" Button
            if ($('#clear-history-btn').length) {
                $('#clear-history-btn').html('🗑️ ' + (currentLang === 'en' ? 'Clear History' : 'Verlauf löschen'));
            }
            
            // Überschriften
            $('.germanfence-recent-blocks h2').each(function() {
                var $h = $(this);
                var text = $h.text().trim();
                if (t[text]) {
                    $h.text(t[text]);
                }
            });
        }
        
        $('#germanfence-language-toggle').on('click', function() {
            currentLang = currentLang === 'de' ? 'en' : 'de';
            localStorage.setItem('germanfence_language', currentLang);
            
            var $btn = $(this);
            if (currentLang === 'en') {
                $btn.find('.language-flag').html('<img src="https://flagcdn.com/w20/gb.png" width="20" height="15" alt="EN" style="vertical-align: middle;">');
                $btn.find('.language-code').text('EN');
                showToast('Language switched to English', 'success');
            } else {
                $btn.find('.language-flag').html('<img src="https://flagcdn.com/w20/de.png" width="20" height="15" alt="DE" style="vertical-align: middle;">');
                $btn.find('.language-code').text('DE');
                showToast('Sprache auf Deutsch gewechselt', 'success');
            }
            
            translateUI(currentLang);
            log('Sprache gewechselt:', currentLang);
        });
        
        // Language beim Start setzen
        if (currentLang === 'en') {
            $('#germanfence-language-toggle .language-flag').html('<img src="https://flagcdn.com/w20/gb.png" width="20" height="15" alt="EN" style="vertical-align: middle;">');
            $('#germanfence-language-toggle .language-code').text('EN');
            setTimeout(function() {
                translateUI('en');
            }, 100);
        }
        
        // 2. Toast Notification
        function showToast(message, type) {
            type = type || 'success';
            var $toast = $('<div class="germanfence-toast">')
                .addClass('toast-' + type)
                .html('<span class="dashicons dashicons-yes-alt"></span> ' + message);
            
            $('body').append($toast);
            
            // Animation frame für flüssiges Einblenden
            requestAnimationFrame(function() {
                $toast.addClass('show');
            });
            
            setTimeout(function() {
                $toast.removeClass('show');
                setTimeout(function() { $toast.remove(); }, 300);
            }, 2000);
        }
        
        // 3. Auto-Save Core
        function performAutoSave(field, value) {
            log('Auto-Save Start:', field + ' = ' + value);
            
            // Keine Toast für GEO-Felder (wird in geo-blocking.js gehandhabt)
            var skipToast = (field === 'geo_blocking_enabled' || field === 'blocked_countries');
            
            $.post({
                url: germanfenceAdmin.ajaxUrl,
                data: {
                    action: 'germanfence_auto_save',
                    nonce: germanfenceAdmin.nonce,
                    field: field,
                    value: value
                },
                success: function(response) {
                    if (!skipToast) {
                        if (response && response.success) {
                            showToast('Gespeichert', 'success');
                        } else {
                            showToast('Fehler beim Speichern', 'error');
                        }
                    }
                },
                error: function(xhr, status, err) {
                    error('Auto-Save Failed:', err);
                    if (!skipToast) {
                        showToast('Verbindungsproblem', 'error');
                    }
                }
            });
        }
        
        // 4. Toggle Handler (Generic)
        // Bindet an ALLE Toggles, inkl. GEO, aber NICHT Länder (da diese keine .germanfence-toggle Klasse haben)
        log('Binde Toggle-Handler...');
        var toggleCount = $('.germanfence-toggle input[type="checkbox"]').length;
        log('Gefundene Toggles:', toggleCount);
        
        // DIREKTE Bindung an ALLE Toggles (nicht Delegation!)
        $('.germanfence-toggle input[type="checkbox"]').each(function() {
            var $toggle = $(this);
            var toggleName = $toggle.attr('name');
            log('Binde direkten Handler für:', toggleName);
            
            $toggle.on('change', function(e) {
                try {
                    // WICHTIG: Stoppe JEGLICHE Propagation!
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    var name = $toggle.attr('name');
                    var value = $toggle.is(':checked') ? '1' : '0';
                    
                    log('>>> TOGGLE Change Event!', {name: name, value: value});
                    
                    // Speichern
                    performAutoSave(name, value);
                    
                    // UI Updates
                    handleToggleUI(name, $toggle.is(':checked'));
                    
                } catch(err) {
                    error('Toggle Change Error:', err);
                }
            });
        });
        
        // 5. UI Update Logik (Sichtbarkeiten)
        function handleToggleUI(name, isChecked) {
            var $target = null;
            
            switch(name) {
                case 'geo_blocking_enabled':
                case 'blocked_countries':
                    // Wird von geo-blocking.js gehandhabt - keinen Toast hier
                    return;
                case 'honeypot_enabled':
                    // Zeige/verstecke Einstellungsfelder
                    $('#honeypot-settings').toggle(isChecked);
                    return;
                case 'basic_protection_enabled':
                    // Zeige/verstecke Basisschutz-Einstellungen
                    $('#basic-protection-settings').toggle(isChecked);
                    return;
                case 'timestamp_enabled':
                    // Zeige/verstecke Einstellungsfelder
                    $('#timestamp-settings').toggle(isChecked);
                    return;
                case 'url_limit_enabled':
                    $('#url-limit-settings').toggle(isChecked);
                    return;
                case 'domain_blocking_enabled':
                    $('#domain-blocking-settings').toggle(isChecked);
                    return;
                case 'login_limit_enabled':
                    $('#login-limit-settings').toggle(isChecked);
                    return;
                case 'phrase_blocking_enabled':
                    $target = $('#phrase-settings');
                    break;
                case 'badge_enabled':
                    $target = $('#badge-settings');
                    break;
                case 'phrase_regex_mode':
                    toggleRegexUI(isChecked);
                    return; // Spezialfall
            }
            
            if ($target && $target.length) {
                // Benutze .toggle() statt show/hide/slide für maximale Robustheit
                // false/true als Parameter erzwingt den State
                $target.toggle(isChecked);
            }
        }
        
        // Spezialfall: Regex UI
        function toggleRegexUI(isRegex) {
            var $textarea = $('textarea[name="blocked_phrases_text"]');
            var val = $textarea.val();
            
            if (isRegex) {
                $('#phrase-help-normal, #phrase-examples-normal').hide();
                $('#phrase-help-regex, #phrase-examples-regex').show();
                
                // Konvertiere Komma -> Newline
                if (val.indexOf(',') !== -1) {
                    $textarea.val(val.split(',').map(function(s){ return s.trim(); }).filter(Boolean).join('\n'));
                }
                $textarea.css('font-family', 'monospace').attr('placeholder', 'z.B.: V.*i.*a.*g.*r.*a');
            } else {
                $('#phrase-help-normal, #phrase-examples-normal').show();
                $('#phrase-help-regex, #phrase-examples-regex').hide();
                
                // Konvertiere Newline -> Komma
                if (val.indexOf('\n') !== -1) {
                    $textarea.val(val.split('\n').map(function(s){ return s.trim(); }).filter(Boolean).join(', '));
                }
                $textarea.css('font-family', 'inherit').attr('placeholder', 'z.B.: casino, viagra');
            }
        }
        
        // 6. GEO-Blocking wird jetzt vom separaten geo-blocking.js gehandhabt!
        
        // 7. Tab Navigation (Simpel & Stabil)
        $('.germanfence-tab').on('click', function(e) {
            e.preventDefault();
            try {
                var $tab = $(this);
                var tabId = $tab.data('tab');
                log('Tab Wechsel:', tabId);
                
                // PRO-Feature-Check: Blockiere Tabs mit pro-feature Klasse
                if ($tab.hasClass('pro-feature')) {
                    showToast('🔒 Dieses Feature ist nur in der PRO-Version verfügbar', 'error');
                    return; // Tab nicht öffnen!
                }
                
                // Disabled-Check: Blockiere deaktivierte Tabs
                if ($tab.hasClass('disabled') || $tab.prop('disabled')) {
                    showToast('⚠️ Bitte aktiviere zuerst eine Lizenz', 'error');
                    return;
                }
                
                // Buttons umschalten
                $('.germanfence-tab').removeClass('active');
                $tab.addClass('active');
                
                // Content umschalten
                $('.germanfence-tab-content').hide(); // Sicherer als removeClass
                $('#tab-' + tabId).show(); // Sicherer als addClass
                
                // Speichern (außer GEO)
                if (window.localStorage && tabId !== 'geo') {
                    localStorage.setItem('germanfence_active_tab', tabId);
                } else if (window.localStorage) {
                    localStorage.removeItem('germanfence_active_tab');
                }
                
            } catch(err) {
                error('Tab Error:', err);
            }
        });
        
        // 8. Restore Tab (Beim Laden)
        if (window.localStorage) {
            var savedTab = localStorage.getItem('germanfence_active_tab');
            if (savedTab && savedTab !== 'geo') {
                var $tabBtn = $('.germanfence-tab[data-tab="' + savedTab + '"]');
                if ($tabBtn.length) {
                    // Trigger Click für konsistentes Verhalten
                    $tabBtn.trigger('click');
                }
            }
        }
        
        // 9. Text-Input Auto-Save (Debounced)
        var inputTimeout;
        $('input[type="text"], input[type="number"], textarea').not('#country-search').on('input', function() {
            var $input = $(this);
            var name = $input.attr('name');
            
            // Ignoriere Felder ohne Name oder Search
            if (!name) return;
            
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(function() {
                performAutoSave(name, $input.val());
            }, 1000);
        });
        
        // 9a. Select-Dropdown Auto-Save (Sofort bei Änderung)
        $('select').on('change', function() {
            var $select = $(this);
            var name = $select.attr('name');
            
            // Ignoriere Felder ohne Name
            if (!name) return;
            
            log('Select geändert:', name + ' = ' + $select.val());
            performAutoSave(name, $select.val());
        });
        
        // 10. Spezial: Add/Remove Phrase Buttons
        $('#add-phrase').on('click', function() {
            var tmpl = '<div class="phrase-item"><input type="text" name="blocked_phrases[]" placeholder="Phrase..."><button type="button" class="germanfence-btn-danger remove-phrase"><span class="dashicons dashicons-trash"></span></button></div>';
            $('#phrase-list').append(tmpl);
        });
        
        $(document).on('click', '.remove-phrase', function() {
            $(this).closest('.phrase-item').remove();
        });
        
        // 11. Log Clear
        $('#clear-debug-log').on('click', function() {
            if (!confirm('Log wirklich leeren?')) return;
            
            $.post({
                url: germanfenceAdmin.ajaxUrl,
                data: { 
                    action: 'germanfence_clear_log', 
                    nonce: germanfenceAdmin.nonce 
                },
                success: function() {
                    alert('Log geleert.');
                    location.reload();
                }
            });
        });
        
        // 9. Statistik-Filter
        $('.stats-filter-btn').on('click', function() {
            var filter = $(this).data('filter');
            log('Statistik-Filter:', filter);
            
            // Button-Status
            $('.stats-filter-btn').removeClass('active').css({
                'background': 'transparent',
                'color': function() {
                    var f = $(this).data('filter');
                    if (f === 'blocked') return '#F06292';
                    if (f === 'legitimate') return '#22D6DD';
                    return '#22D6DD';
                }
            });
            
            $(this).addClass('active').css({
                'background': function() {
                    if (filter === 'blocked') return '#F06292';
                    if (filter === 'legitimate') return '#22D6DD';
                    return '#22D6DD';
                },
                'color': '#fff'
            });
            
            // Filter Zeilen
            if (filter === 'all') {
                $('.stats-row').show();
            } else {
                $('.stats-row').hide();
                $('.stats-row[data-type="' + filter + '"]').show();
            }
        });
        
        // 9.5 Verlauf löschen Button
        $(document).on('click', '#clear-history-btn', function() {
            if (!confirm('Möchtest du wirklich den kompletten Anfragen-Verlauf löschen? Dies kann nicht rückgängig gemacht werden!')) {
                return;
            }
            
            var $btn = $(this);
            $btn.prop('disabled', true).text('🔄 Lösche...');
            
            log('Sende AJAX Request: germanfence_clear_history');
            
            $.ajax({
                url: germanfenceAdmin.ajaxurl,
                type: 'POST',
                data: {
                    action: 'germanfence_clear_history',
                    nonce: germanfenceAdmin.nonce
                },
                success: function(response) {
                    log('AJAX Response:', response);
                    if (response.success) {
                        showToast('Verlauf erfolgreich gelöscht!', 'success');
                        // Seite neu laden nach 1 Sekunde
                        setTimeout(function() {
                            location.reload();
                        }, 1000);
                    } else {
                        showToast('Fehler: ' + (response.data || 'Unbekannter Fehler'), 'error');
                        $btn.prop('disabled', false).html('🗑️ Verlauf löschen');
                    }
                },
                error: function(xhr, status, err) {
                    error('AJAX Fehler beim Verlauf löschen:', err);
                    log('XHR:', xhr);
                    log('Status:', status);
                    showToast('Fehler beim Löschen des Verlaufs', 'error');
                    $btn.prop('disabled', false).html('🗑️ Verlauf löschen');
                }
            });
        });
        
        // 10. Details-Modal
        $('.view-details-btn').on('click', function() {
            var $row = $(this).closest('tr');
            var id = $(this).data('id');
            var type = $row.data('type');
            var reason = $row.data('reason');
            var formDataJson = $row.data('form-data');
            var ip = $row.find('td:eq(2)').text();
            var country = $row.find('td:eq(3)').text().trim();
            var time = $row.find('td:eq(0)').text();
            
            // Formular-Daten parsen
            var formDataHtml = '';
            if (formDataJson) {
                try {
                    var formData = JSON.parse(formDataJson);
                    formDataHtml = '<div style="margin-top: 20px;"><strong>📝 Eingegebene Formulardaten:</strong><div style="background: #fff; padding: 15px; border-radius: 6px; margin-top: 10px; max-height: 200px; overflow-y: auto;">';
                    
                    for (var key in formData) {
                        if (formData.hasOwnProperty(key)) {
                            formDataHtml += '<div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd;"><strong style="color: #22D6DD;">' + key + ':</strong><br><span style="font-family: monospace; font-size: 13px; word-wrap: break-word;">' + formData[key] + '</span></div>';
                        }
                    }
                    
                    formDataHtml += '</div></div>';
                } catch (e) {
                    formDataHtml = '';
                }
            }
            
            // Modal erstellen
            var modalHtml = '<div class="germanfence-modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center;">' +
                '<div class="germanfence-modal" style="background: #fff; border-radius: 12px; max-width: 700px; width: 90%; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">' +
                        '<h2 style="margin: 0; color: #1d2327;">📋 Anfrage-Details</h2>' +
                        '<button class="modal-close-btn" style="background: #F06292; color: #fff; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold;">×</button>' +
                    '</div>' +
                    '<div style="background: #F2F5F8; padding: 20px; border-radius: 8px; margin-bottom: 15px;">' +
                        '<div style="margin-bottom: 15px;"><strong>Status:</strong> <span style="margin-left: 10px;">' + (type === 'blocked' ? '🚫 Geblockt' : '✅ Legitim') + '</span></div>' +
                        '<div style="margin-bottom: 15px;"><strong>Zeit:</strong> <span style="margin-left: 10px;">' + time + '</span></div>' +
                        '<div style="margin-bottom: 15px;"><strong>IP-Adresse:</strong> <span style="margin-left: 10px;">' + ip + '</span></div>' +
                        '<div style="margin-bottom: 15px;"><strong>Land:</strong> <span style="margin-left: 10px;">' + country + '</span></div>' +
                        '<div><strong>Grund/Details:</strong><br><div style="background: #fff; padding: 15px; border-radius: 6px; margin-top: 10px; font-family: monospace; font-size: 13px; word-wrap: break-word; max-height: 200px; overflow-y: auto;">' + reason + '</div></div>' +
                        formDataHtml +
                    '</div>' +
                '</div>' +
            '</div>';
            
            $('body').append(modalHtml);
            
            // Modal schließen
            $('.modal-close-btn, .germanfence-modal-overlay').on('click', function(e) {
                if (e.target === this) {
                    $('.germanfence-modal-overlay').fadeOut(200, function() {
                        $(this).remove();
                    });
                }
            });
        });
        
        // 11. Free License Registration
        $('#register-free-btn').on('click', function() {
            var $btn = $(this);
            var $input = $('#free-email-input');
            var $checkbox = $('#free-agb-checkbox');
            var email = $input.val().trim();
            
            if (!email || !email.includes('@')) {
                showToast('Bitte gültige E-Mail eingeben', 'error');
                return;
            }
            
            if (!$checkbox.is(':checked')) {
                showToast('Bitte akzeptiere die AGB und Datenschutzerklärung', 'error');
                return;
            }
            
            $btn.prop('disabled', true).html('<span class="dashicons dashicons-update dashicons-spin"></span> Wird gesendet...');
            
            $.post({
                url: germanfenceAdmin.ajaxUrl,
                data: {
                    action: 'germanfence_register_free',
                    nonce: germanfenceAdmin.nonce,
                    email: email
                },
                success: function(response) {
                    if (response.success) {
                        showToast('📧 Mail gesendet, bitte prüfe Mails u. ggf. Spamordner', 'success');
                        $input.val('');
                        $checkbox.prop('checked', false);
                    } else {
                        showToast(response.data || 'Fehler beim Registrieren', 'error');
                    }
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-email-alt"></span> Bestätigungsmail senden');
                },
                error: function(xhr) {
                    log('AJAX Error:', xhr.responseText);
                    showToast('Verbindungsfehler', 'error');
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-email-alt"></span> Bestätigungsmail senden');
                }
            });
        });
        
        // Badge-Vorschau Live-Update
        function updateBadgePreview() {
            var text = $('input[name="badge_text"]').val() || 'Geschützt durch GermanFence';
            var textColor = $('input[name="badge_text_color"]').val() || '#1d2327';
            var borderColor = $('input[name="badge_border_color"]').val() || '#22D6DD';
            var backgroundColor = $('input[name="badge_background_color"]').val() || '#ffffff';
            var shadowColor = $('input[name="badge_shadow_color"]').val() || '#22D6DD';
            var borderRadius = $('input[name="badge_border_radius"]').val() || 6;
            var customImage = $('input[name="badge_custom_image"]').val();
            
            var shadowRgb = hexToRgb(shadowColor);
            
            $('#badge-text-preview').text(text).css('color', textColor);
            $('#badge-preview').css({
                'border-color': borderColor,
                'background-color': backgroundColor,
                'border-radius': borderRadius + 'px',
                'box-shadow': '0 2px 8px rgba(' + shadowRgb + ', 0.2)'
            });
            
            $('input[name="badge_text_color_hex"]').val(textColor);
            $('input[name="badge_border_color_hex"]').val(borderColor);
            $('input[name="badge_background_color_hex"]').val(backgroundColor);
            $('input[name="badge_shadow_color_hex"]').val(shadowColor);
            
            // Icon aktualisieren
            if (customImage && customImage.trim() !== '') {
                $('#badge-icon').html('<img src="' + customImage + '" alt="Custom Icon" style="width: 24px; height: 24px; object-fit: contain;">');
            } else {
                $('#badge-icon').html('<img src="' + germanfenceAdmin.pluginUrl + 'assets/images/germanfence_logo.png" alt="GermanFence" style="width: 24px; height: 24px; object-fit: contain;">');
            }
        }
        
        // Event-Listener
        $('input[name="badge_text"]').on('input', updateBadgePreview);
        $('input[name="badge_custom_image"]').on('input', updateBadgePreview);
        
        // Initiale Preview-Aktualisierung beim Laden
        updateBadgePreview();
        
        // Color Picker Sync
        $('input[name="badge_text_color"]').on('input change', function() {
            var color = $(this).val();
            $('input[name="badge_text_color_hex"]').val(color);
            $('#badge-text-preview').css('color', color);
            
            // Auto-Save
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(function() {
                performAutoSave('badge_text_color', color);
            }, 500);
        });
        
        $('input[name="badge_text_color_hex"]').on('input change', function() {
            var color = $(this).val();
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                $('input[name="badge_text_color"]').val(color);
                $('#badge-text-preview').css('color', color);
                
                // Auto-Save
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(function() {
                    performAutoSave('badge_text_color', color);
                }, 500);
            }
        });
        
        // Rahmenfarbe
        $('input[name="badge_border_color"]').on('input change', function() {
            var color = $(this).val();
            $('input[name="badge_border_color_hex"]').val(color);
            $('#badge-preview').css('border-color', color);
            
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(function() {
                performAutoSave('badge_border_color', color);
            }, 500);
        });
        
        $('input[name="badge_border_color_hex"]').on('input change', function() {
            var color = $(this).val();
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                $('input[name="badge_border_color"]').val(color);
                $('#badge-preview').css('border-color', color);
                
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(function() {
                    performAutoSave('badge_border_color', color);
                }, 500);
            }
        });
        
        // Hintergrundfarbe
        $('input[name="badge_background_color"]').on('input change', function() {
            var color = $(this).val();
            $('input[name="badge_background_color_hex"]').val(color);
            $('#badge-preview').css('background-color', color);
            
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(function() {
                performAutoSave('badge_background_color', color);
            }, 500);
        });
        
        $('input[name="badge_background_color_hex"]').on('input change', function() {
            var color = $(this).val();
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                $('input[name="badge_background_color"]').val(color);
                $('#badge-preview').css('background-color', color);
                
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(function() {
                    performAutoSave('badge_background_color', color);
                }, 500);
            }
        });
        
        // Schattenfarbe
        $('input[name="badge_shadow_color"]').on('input change', function() {
            var color = $(this).val();
            $('input[name="badge_shadow_color_hex"]').val(color);
            var rgb = hexToRgb(color);
            $('#badge-preview').css('box-shadow', '0 2px 8px rgba(' + rgb + ', 0.2)');
            
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(function() {
                performAutoSave('badge_shadow_color', color);
            }, 500);
        });
        
        $('input[name="badge_shadow_color_hex"]').on('input change', function() {
            var color = $(this).val();
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                $('input[name="badge_shadow_color"]').val(color);
                var rgb = hexToRgb(color);
                $('#badge-preview').css('box-shadow', '0 2px 8px rgba(' + rgb + ', 0.2)');
                
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(function() {
                    performAutoSave('badge_shadow_color', color);
                }, 500);
            }
        });
        
        // Hilfsfunktion: Hex zu RGB
        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
            return r + ', ' + g + ', ' + b;
        }
        
        // Free-License Tab-Switching
        $('.germanfence-free-tab').on('click', function() {
            $('.germanfence-free-tab').removeClass('active').css({
                'color': '#646970',
                'background': 'transparent'
            });
            $(this).addClass('active').css({
                'color': '#22D6DD',
                'background': '#ffffff'
            });
            
            var isEmailTab = $(this).attr('id') === 'free-email-tab';
            if (isEmailTab) {
                $('#free-email-content').show();
                $('#free-key-content').hide();
            } else {
                $('#free-email-content').hide();
                $('#free-key-content').show();
            }
        });
        
        // Free-License Key-Aktivierung
        $('#activate-free-key-btn').on('click', function() {
            var $btn = $(this);
            var key = $('#free-key-input').val().trim();
            
            if (!key) {
                showToast('Bitte License-Key eingeben', 'error');
                return;
            }
            
            $btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin-animation"></span> Aktiviere...');
            
            $.ajax({
                url: germanfenceAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'germanfence_activate_free_key',
                    nonce: germanfenceAdmin.nonce,
                    license_key: key
                },
                success: function(response) {
                    if (response.success) {
                        showToast(response.data, 'success');
                        setTimeout(function() {
                            window.location.reload();
                        }, 1000);
                    } else {
                        showToast(response.data || 'Aktivierung fehlgeschlagen', 'error');
                        $btn.prop('disabled', false).html('<span class="dashicons dashicons-unlock"></span> Mit Key aktivieren');
                    }
                },
                error: function(xhr) {
                    log('AJAX Error:', xhr.responseText);
                    showToast('Verbindungsfehler', 'error');
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-unlock"></span> Mit Key aktivieren');
                }
            });
        });
        
        // Tab-Styling beim Laden
        $('.germanfence-free-tab.active').css({
            'color': '#22D6DD'
        });
        
        // Premium-Lizenz-Aktivierung (AJAX + Auto-Reload)
        $('#premium-license-form').on('submit', function(e) {
            e.preventDefault();
            
            var $form = $(this);
            var $btn = $('#activate-premium-btn');
            var licenseKey = $('#premium-license-key').val().trim();
            
            if (!licenseKey) {
                showToast('Bitte Lizenzschlüssel eingeben', 'error');
                return;
            }
            
            $btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin-animation"></span> Aktiviere...');
            
            $.ajax({
                url: germanfenceAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'germanfence_activate_premium',
                    nonce: germanfenceAdmin.nonce,
                    license_key: licenseKey
                },
                success: function(response) {
                    if (response.success) {
                        showToast(response.data || 'Lizenz erfolgreich aktiviert!', 'success');
                        setTimeout(function() {
                            window.location.reload();
                        }, 1000);
                    } else {
                        showToast(response.data || 'Aktivierung fehlgeschlagen', 'error');
                        $btn.prop('disabled', false).html('<span class="dashicons dashicons-yes"></span> Lizenz aktivieren');
                    }
                },
                error: function(xhr) {
                    log('AJAX Error:', xhr.responseText);
                    showToast('Verbindungsfehler', 'error');
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-yes"></span> Lizenz aktivieren');
                }
            });
        });
        
        // Honeypot-Verwaltung (DIREKT in der Seite, KEINE Modals!)
        // Toggle für Honeypot-Subsetting
        $('input[name="honeypot_enabled"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('#honeypot-settings').slideDown(300);
            } else {
                $('#honeypot-settings').slideUp(300);
            }
        });
        
        // Toggle für Timestamp-Subsetting
        $('input[name="timestamp_enabled"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('#timestamp-settings').slideDown(300);
            } else {
                $('#timestamp-settings').slideUp(300);
            }
        });
        
        // Toggle für URL-Limit
        $('input[name="url_limit_enabled"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('#url-limit-settings').slideDown(300);
            } else {
                $('#url-limit-settings').slideUp(300);
            }
        });
        
        // Toggle für Domain-Blocking
        $('input[name="domain_blocking_enabled"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('#domain-blocking-settings').slideDown(300);
            } else {
                $('#domain-blocking-settings').slideUp(300);
            }
        });
        
        // Toggle für Login-Limit (Brute-Force Schutz)
        $('input[name="login_limit_enabled"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('#login-limit-settings').slideDown(300);
            } else {
                $('#login-limit-settings').slideUp(300);
            }
        });
        
        // Slider für Honeypot-Anzahl
        $('#honeypot-count-slider').on('input', function() {
            var count = $(this).val();
            $('#honeypot-count-value').text(count);
            updateHoneypotFields(count);
        });
        
        // Slider für URL-Limit
        $('#url-limit-slider').on('input', function() {
            var limit = $(this).val();
            $('#url-limit-value').text(limit);
        });
        
        // Slider für Badge Border Radius
        $('#badge-border-radius-slider').on('input', function() {
            var radius = $(this).val();
            $('#badge-border-radius-value').text(radius + 'px');
            // Live-Vorschau aktualisieren
            $('#badge-preview').css('border-radius', radius + 'px');
        });
        
        function updateHoneypotFields(targetCount) {
            var $list = $('#honeypot-fields-list');
            var currentCount = $list.find('.honeypot-field-item').length;
            targetCount = parseInt(targetCount);
            
            if (targetCount > currentCount) {
                // Felder hinzufügen
                for (var i = currentCount; i < targetCount; i++) {
                    var newField = generateHoneypotField(i);
                    $list.append(newField);
                }
            } else if (targetCount < currentCount) {
                // Felder entfernen
                $list.find('.honeypot-field-item').slice(targetCount).remove();
            }
            
            // Index-Nummern aktualisieren
            $list.find('.honeypot-field-item').each(function(index) {
                $(this).find('span').first().text('#' + (index + 1));
                $(this).find('.regenerate-honeypot-btn').attr('data-index', index);
            });
        }
        
        function generateHoneypotField(index) {
            var fieldNames = [
                'website_url', 'homepage_link', 'user_website', 'site_url',
                'contact_url', 'company_site', 'web_address', 'url_field',
                'business_url', 'personal_site'
            ];
            var baseName = fieldNames[index % fieldNames.length];
            var randomSuffix = Math.random().toString(36).substring(2, 8);
            var fieldName = baseName + '_' + randomSuffix;
            
            return '<div class="honeypot-field-item" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #F2F5F8; border: 1px solid #c3cbd5; border-radius: 6px; margin-bottom: 10px;">' +
                '<span style="min-width: 30px; font-weight: 600; color: #646970;">#' + (index + 1) + '</span>' +
                '<input type="text" name="honeypot_fields[]" value="' + fieldName + '" style="flex: 1; padding: 8px 12px; border: 1px solid #c3cbd5; border-radius: 6px; font-family: monospace;" placeholder="feldname">' +
                '<button type="button" class="regenerate-honeypot-btn" data-index="' + index + '" style="padding: 8px 12px; background: #22D6DD; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;" title="Neu generieren">' +
                '<span class="dashicons dashicons-update"></span>' +
                '</button>' +
                '</div>';
        }
        
        // Regenerate einzelne Honeypot-Felder
        $(document).on('click', '.regenerate-honeypot-btn', function() {
            var $btn = $(this);
            var $input = $btn.siblings('input[name="honeypot_fields[]"]');
            
            // Animation
            $btn.addClass('rotating');
            
            var fieldNames = [
                'website_url', 'homepage_link', 'user_website', 'site_url',
                'contact_url', 'company_site', 'web_address', 'url_field',
                'business_url', 'personal_site', 'portal_link', 'page_address'
            ];
            
            var baseName = fieldNames[Math.floor(Math.random() * fieldNames.length)];
            var randomSuffix = Math.random().toString(36).substring(2, 8);
            var newName = baseName + '_' + randomSuffix;
            
            setTimeout(function() {
                $input.val(newName);
                $btn.removeClass('rotating');
            }, 300);
        });
        
        // CSS für Honeypot Rotation
        if (!$('#honeypot-rotate-css').length) {
            $('<style id="honeypot-rotate-css">' +
                '.regenerate-honeypot-btn:hover { background: #1EBEC5 !important; transform: scale(1.05); }' +
                '.regenerate-honeypot-btn.rotating { animation: rotate 0.5s linear; }' +
                '@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' +
            '</style>').appendTo('head');
        }
        
        // URL-Parameter Toast-Meldungen (statt WP admin_notices)
        var urlParams = new URLSearchParams(window.location.search);
        
        // E-Mail-Verifizierung erfolgreich
        if (urlParams.get('verified') === '1') {
            showToast('✅ E-Mail erfolgreich verifiziert! German Shield ist jetzt aktiviert.', 'success');
            // URL bereinigen
            var cleanUrl = window.location.href.split('?')[0] + '?page=germanfence&tab=license';
            window.history.replaceState({}, '', cleanUrl);
        }
        
        // Verifizierungsfehler
        var verifyError = urlParams.get('verify_error');
        if (verifyError) {
            showToast('❌ ' + decodeURIComponent(verifyError), 'error');
            // URL bereinigen
            var cleanUrl = window.location.href.split('?')[0] + '?page=germanfence&tab=license';
            window.history.replaceState({}, '', cleanUrl);
        }
        
        // Lizenz aktiviert
        if (urlParams.get('license_activated') === '1') {
            showToast('✅ Lizenz erfolgreich aktiviert!', 'success');
            var cleanUrl = window.location.href.split('?')[0] + '?page=germanfence&tab=license';
            window.history.replaceState({}, '', cleanUrl);
        }
        
        // Lizenz deaktiviert
        if (urlParams.get('license_deactivated') === '1') {
            showToast('🔓 Lizenz deaktiviert', 'success');
            var cleanUrl = window.location.href.split('?')[0] + '?page=germanfence&tab=license';
            window.history.replaceState({}, '', cleanUrl);
        }
        
        // .htaccess Generator
        $('#generate-htaccess-btn').on('click', function() {
            var htaccessCode = "# GermanFence Security & Performance Rules\n# Generated: " + new Date().toLocaleString() + "\n";
            htaccessCode += "# Basierend auf Best Practices 2025\n\n";
            
            if ($('#htaccess-directory-listing').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# Directory Listings deaktivieren\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "Options -Indexes\n\n";
            }
            
            if ($('#htaccess-xmlrpc').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# XML-RPC blockieren\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<Files xmlrpc.php>\n";
                htaccessCode += "    Require all denied\n";
                htaccessCode += "</Files>\n\n";
            }
            
            if ($('#htaccess-wp-config').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# WordPress Dateien schützen\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<FilesMatch \"^(wp-config\\.php|php\\.ini|php5\\.ini|readme\\.html|license\\.txt)\">\n";
                htaccessCode += "    Require all denied\n";
                htaccessCode += "</FilesMatch>\n\n";
            }
            
            if ($('#htaccess-htaccess').is(':checked')) {
                htaccessCode += "# .htaccess selbst schützen\n";
                htaccessCode += "<Files .htaccess>\n";
                htaccessCode += "    Require all denied\n";
                htaccessCode += "</Files>\n\n";
            }
            
            if ($('#htaccess-uploads').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# PHP in Uploads blockieren\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_rewrite.c>\n";
                htaccessCode += "    RewriteEngine On\n";
                htaccessCode += "    RewriteCond %{REQUEST_URI} ^.*/wp-content/uploads/.*$ [NC]\n";
                htaccessCode += "    RewriteCond %{REQUEST_FILENAME} \\.php$ [NC]\n";
                htaccessCode += "    RewriteRule .* - [F,L]\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if ($('#htaccess-author-scan').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# Autoren-Scans blockieren\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_rewrite.c>\n";
                htaccessCode += "    RewriteCond %{QUERY_STRING} ^author=\\d+ [NC]\n";
                htaccessCode += "    RewriteRule .* - [F,L]\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if ($('#htaccess-sql-injection').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# SQL-Injection Schutz\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_rewrite.c>\n";
                htaccessCode += "    RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=http:// [OR]\n";
                htaccessCode += "    RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=(\\.\\.//?)+ [OR]\n";
                htaccessCode += "    RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=/([a-z0-9_.]//?)+ [OR]\n";
                htaccessCode += "    RewriteCond %{QUERY_STRING} (union|select|insert|drop|delete|update|replace|truncate) [NC]\n";
                htaccessCode += "    RewriteRule .* - [F,L]\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if ($('#htaccess-security-headers').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# HTTP Security Headers\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_headers.c>\n";
                htaccessCode += "    # HSTS - Force HTTPS (2 Jahre)\n";
                htaccessCode += "    Header always set Strict-Transport-Security \"max-age=63072000; includeSubDomains; preload\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # X-Frame-Options - Clickjacking Schutz\n";
                htaccessCode += "    Header always set X-Frame-Options \"SAMEORIGIN\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # X-Content-Type-Options - MIME-Sniffing verhindern\n";
                htaccessCode += "    Header always set X-Content-Type-Options \"nosniff\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # Referrer-Policy - Datenschutz\n";
                htaccessCode += "    Header always set Referrer-Policy \"strict-origin-when-cross-origin\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # Permissions-Policy - Browser Features einschränken\n";
                htaccessCode += "    Header always set Permissions-Policy \"geolocation=(), microphone=(), camera=()\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # Content-Security-Policy - Upgrade zu HTTPS\n";
                htaccessCode += "    Header always set Content-Security-Policy \"upgrade-insecure-requests;\"\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if ($('#htaccess-caching').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# Browser Caching\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_expires.c>\n";
                htaccessCode += "    ExpiresActive On\n";
                htaccessCode += "    ExpiresDefault \"access plus 1 month\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # Bilder\n";
                htaccessCode += "    ExpiresByType image/jpg \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType image/jpeg \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType image/gif \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType image/png \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType image/webp \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType image/svg+xml \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType image/x-icon \"access plus 1 year\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # CSS und JavaScript\n";
                htaccessCode += "    ExpiresByType text/css \"access plus 1 month\"\n";
                htaccessCode += "    ExpiresByType text/javascript \"access plus 1 month\"\n";
                htaccessCode += "    ExpiresByType application/javascript \"access plus 1 month\"\n";
                htaccessCode += "    \n";
                htaccessCode += "    # Fonts\n";
                htaccessCode += "    ExpiresByType font/woff2 \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType font/woff \"access plus 1 year\"\n";
                htaccessCode += "    ExpiresByType font/ttf \"access plus 1 year\"\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if ($('#htaccess-compression').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# GZIP Komprimierung\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_deflate.c>\n";
                htaccessCode += "    AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml\n";
                htaccessCode += "    AddOutputFilterByType DEFLATE text/javascript application/javascript application/x-javascript\n";
                htaccessCode += "    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml application/rss+xml\n";
                htaccessCode += "    AddOutputFilterByType DEFLATE application/json\n";
                htaccessCode += "    AddOutputFilterByType DEFLATE image/svg+xml\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if ($('#htaccess-hotlink').is(':checked')) {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# Hotlink Protection (Bilder)\n";
                htaccessCode += "# WICHTIG: Ersetze DEINE-DOMAIN.DE mit deiner Domain!\n";
                htaccessCode += "# ============================================\n";
                htaccessCode += "<IfModule mod_rewrite.c>\n";
                htaccessCode += "    RewriteCond %{HTTP_REFERER} !^$\n";
                htaccessCode += "    RewriteCond %{HTTP_REFERER} !^https?://(.+\\.)?(DEINE-DOMAIN\\.DE) [NC]\n";
                htaccessCode += "    RewriteCond %{HTTP_REFERER} !google\\. [NC]\n";
                htaccessCode += "    RewriteCond %{HTTP_REFERER} !bing\\. [NC]\n";
                htaccessCode += "    RewriteRule \\.(jpg|jpeg|png|gif|webp|svg)$ - [F,NC,L]\n";
                htaccessCode += "</IfModule>\n\n";
            }
            
            if (htaccessCode === "# GermanFence Security & Performance Rules\n# Generated: " + new Date().toLocaleString() + "\n# Basierend auf Best Practices 2025\n\n") {
                htaccessCode += "# ⚠️ Keine Regeln ausgewählt\n";
            } else {
                htaccessCode += "# ============================================\n";
                htaccessCode += "# Ende der GermanFence Regeln\n";
                htaccessCode += "# ============================================\n";
            }
            
            $('#htaccess-output').val(htaccessCode);
            showToast('✅ .htaccess erfolgreich generiert!', 'success');
        });
        
        // .htaccess Code kopieren
        $('#copy-htaccess-btn').on('click', function() {
            var $textarea = $('#htaccess-output');
            var code = $textarea.val();
            
            if (!code || code.includes('Keine Regeln ausgewählt') || code.includes('Wähle Sicherheitsregeln')) {
                showToast('Bitte erst .htaccess generieren', 'error');
                return;
            }
            
            $textarea.select();
            document.execCommand('copy');
            showToast('Code kopiert!', 'success');
        });
        
        log('Init abgeschlossen.');
    });
    
})(jQuery);

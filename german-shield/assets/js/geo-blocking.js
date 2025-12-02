/**
 * GEO Blocking - Auto-Save für ALLES
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        console.log('[GEO] Init gestartet');
        
        // 1. Toggle Handler (Auto-Save)
        var $geoToggle = $('#geo-main-toggle input[type="checkbox"]');
        
        if ($geoToggle.length === 0) {
            console.log('[GEO] Toggle nicht gefunden');
            return;
        }
        
        console.log('[GEO] Toggle gefunden');
        
        $geoToggle.on('change', function(e) {
            e.stopPropagation();
            var isChecked = $(this).is(':checked');
            console.log('[GEO] Toggle Change:', isChecked);
            
            // Speichern
            $.post({
                url: germanShieldAdmin.ajaxUrl,
                data: {
                    action: 'german_shield_auto_save',
                    nonce: germanShieldAdmin.nonce,
                    field: 'geo_blocking_enabled',
                    value: isChecked ? '1' : '0'
                },
                success: function(response) {
                    console.log('[GEO] Toggle gespeichert!', response);
                    showToast('GEO Blocking ' + (isChecked ? 'aktiviert' : 'deaktiviert'), 'success');
                },
                error: function(xhr, status, error) {
                    console.error('[GEO] Toggle speichern fehlgeschlagen!');
                    console.error('[GEO] Status:', status);
                    console.error('[GEO] Error:', error);
                    console.error('[GEO] Response:', xhr.responseText);
                    showToast('Fehler beim Speichern: ' + error, 'error');
                }
            });
            
            // Sektion ein/ausblenden
            if (isChecked) {
                $('#geo-countries-section').slideDown(300);
            } else {
                $('#geo-countries-section').slideUp(300);
            }
        });
        
        // 2. Suchleiste
        var searchTimeout;
        $('#country-search').on('input', function() {
            clearTimeout(searchTimeout);
            var searchTerm = $(this).val().toLowerCase();
            
            searchTimeout = setTimeout(function() {
                console.log('[GEO] Suche:', searchTerm);
                
                $('.country-item').each(function() {
                    var $item = $(this);
                    var countryCode = $item.data('country');
                    var countryName = $item.data('country-name');
                    
                    if (countryCode.toLowerCase().indexOf(searchTerm) !== -1 || 
                        countryName.indexOf(searchTerm) !== -1) {
                        $item.show();
                    } else {
                        $item.hide();
                    }
                });
            }, 200);
        });
        
        // 3. Länder-Handler - CHECKBOX Change Event (nicht Click!)
        $('#geo-country-grid').on('change', '.country-item input[type="checkbox"]', function(e) {
            e.stopPropagation();
            
            var $checkbox = $(this);
            var $item = $checkbox.closest('.country-item');
            var country = $checkbox.val();
            var newState = $checkbox.is(':checked'); // Neuer State nach dem Change
            
            console.log('[GEO] Land GEÄNDERT:', country, 'Item:', $item.index(), 'zu', newState);
            
            // State ist bereits geändert durch Browser, kein manuelles Toggle nötig!
            
            // UI Update SOFORT
            if (newState) {
                $item.addClass('blocked');
            } else {
                $item.removeClass('blocked');
            }
            
            // ALLE aktuell blockierten Länder sammeln
            var blockedCountries = [];
            $('#geo-country-grid .country-item input[type="checkbox"]:checked').each(function() {
                blockedCountries.push($(this).val());
            });
            
            console.log('[GEO] Speichere jetzt:', blockedCountries);
            
            // Als JSON speichern
            $.post({
                url: germanShieldAdmin.ajaxUrl,
                data: {
                    action: 'german_shield_auto_save',
                    nonce: germanShieldAdmin.nonce,
                    field: 'blocked_countries',
                    value: JSON.stringify(blockedCountries)
                },
                success: function(response) {
                    console.log('[GEO] Länder gespeichert!', response);
                    showToast('Land ' + country + (newState ? ' blockiert' : ' freigegeben'), 'success');
                },
                error: function(xhr, status, error) {
                    console.error('[GEO] FEHLER beim Speichern!');
                    console.error('[GEO] Status:', status);
                    console.error('[GEO] Error:', error);
                    console.error('[GEO] Response:', xhr.responseText);
                    
                    // Rollback bei Fehler - zurück zum vorherigen State
                    var previousState = !newState;
                    $checkbox.prop('checked', previousState);
                    if (previousState) {
                        $item.addClass('blocked');
                    } else {
                        $item.removeClass('blocked');
                    }
                    
                    showToast('Fehler beim Speichern: ' + error, 'error');
                }
            });
        });
        
        // Toast Helper
        function showToast(message, type) {
            var $toast = $('<div class="german-shield-toast">')
                .addClass('toast-' + (type || 'success'))
                .html('<span class="dashicons dashicons-yes-alt"></span> ' + message);
            
            $('body').append($toast);
            
            setTimeout(function() { $toast.addClass('show'); }, 10);
            setTimeout(function() {
                $toast.removeClass('show');
                setTimeout(function() { $toast.remove(); }, 300);
            }, 2000);
        }
        
        console.log('[GEO] Init abgeschlossen - Toggle + Countries + Search bereit');
    });
    
})(jQuery);

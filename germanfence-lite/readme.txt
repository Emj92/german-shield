=== GermanFence Light ===
Contributors: germanproweb
Donate link: https://germanfence.de
Tags: antispam, spam protection, security, firewall, contact form
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.9.3
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Free Anti-Spam solution from Germany! Protects all forms with honeypot, timestamp & JS-check. Made in Germany 🇩🇪

== Description ==

**GermanFence Light** is the free anti-spam solution from Germany! This version includes all essential spam protection features to keep your WordPress forms safe.

= 🛡️ Main Features =

* **Intelligent Honeypot** - Invisible spam trap
* **Timestamp Validation** - Detects bot submissions
* **JavaScript Check** - Blocks primitive bots
* **User-Agent Verification** - Filters known bot signatures
* **Typing Speed Analysis** - Detects unnaturally fast inputs
* **Badge System** - Show visitors your site is protected
* **Live Statistics** - Real-time monitoring of all requests
* **WordPress Spam Blocker** - Block admin notices, plugin ads, update emails
* **Email Obfuscation** - Protect email addresses from spam bots

= 🌟 Form Compatibility =

Works automatically with:
* Contact Form 7
* WPForms
* Gravity Forms
* Ninja Forms
* Elementor Forms
* Formidable Forms
* All standard WordPress forms (comments, registration, etc.)

= 🇩🇪 Made in Germany =

* GDPR compliant
* German servers
* German development
* German support

= 🚀 Performance =

* No external requests
* Minimal code approach
* No jQuery in frontend
* Cache-friendly

== Installation ==

1. Upload the plugin or install it via WordPress
2. Activate the plugin
3. Go to "GermanFence" in the admin menu
4. Configure settings as desired
5. Done! All forms are automatically protected

== Frequently Asked Questions ==

= Is the plugin free? =

Yes! The base version is completely free and includes:
- Honeypot
- Timestamp validation
- JavaScript check
- User-Agent verification
- Basic statistics
- Badge system
- Email obfuscation
- WordPress spam blocker

= Does it work with my theme/page builder? =

Yes! GermanFence works at the form level and is compatible with all themes and page builders.

= Will it slow down my site? =

No! GermanFence is extremely performant and causes no measurable delays.

= Is it GDPR compliant? =

Yes! All data is stored locally in your WordPress database. No external services are used.

= Does it work with caching plugins? =

Yes! GermanFence is fully cache-compatible.

= Commercial use allowed? =

Yes! Free for personal and commercial use on your own websites and client projects.

See LICENSE.txt for details.

== Screenshots ==

1. Modern dashboard with live statistics
2. Anti-spam settings
3. Badge configuration
4. WordPress spam blocker
5. Statistics filter
6. Email obfuscation settings

== Changelog ==

= 1.9.3 =
* NEW: GDPR-compliant telemetry with DPA (Data Processing Agreement) consent
* NEW: Anonymous spam pattern sharing for better protection (opt-in)
* IMPROVED: Badge logo updated to new design
* IMPROVED: Statistics now show country flags via CDN
* IMPROVED: DPA consent required before telemetry activation
* FIX: All font sizes standardized to 15px (design consistency)
* FIX: Nonce verification warnings resolved
* FIX: Checkbox design with accent color #22D6DD
* REMOVED: All license checking (Lite version is completely free)
* REMOVED: Pro features (Security/Firewall) - available in Pro version only

= 1.7.8 =
* SECURITY: WordPress.org compliance fixes
* FIX: Proper input sanitization for all $_SESSION, $_POST, $_GET
* FIX: Replaced inline scripts/styles with wp_add_inline_script/style
* FIX: Proper ob_start/ob_end_flush pairing
* IMPROVED: Code quality and WordPress coding standards

= 1.7.2 =
* SECURITY: All WordPress coding standards met
* FIX: SQL queries secured with prepared statements
* FIX: Input sanitization for all $_POST, $_GET, $_SERVER access
* FIX: Output escaping for all dynamic outputs
* FIX: Nonce verification for all admin actions
* IMPROVED: License system renamed to "API-Key"
* IMPROVED: Branding updated from "German Shield" to "GermanFence"

= 1.6.1 =
* Badge color live preview works
* Test prices for Mollie tests

= 1.6.0 =
* Admin license management: checkbox for email sending
* Admin license management: show all licenses
* Admin license management: search function
* Admin license management: delete & block
* Badge: customizable border & background color

= 1.5.4 =
* Portal build error fixed (Suspense)

= 1.5.3 =
* Email display corrected (real email instead of placeholder)
* Password-set link auto-fills email
* Verify-email link correctly leads to WP-Admin

= 1.5.2 =
* CRITICAL: FREE license now correctly has NO PRO features (GEO/Phrases)
* Background color uniformly set to #F2F5F8
* Plugin header version corrected

= 1.5.1 =
* Badge now shows "GermanFence" instead of "German Shield"
* Badge is now clickable and leads to https://germanfence.de

= 1.5.0 =
* CRITICAL: GEO-Blocking & Phrase-Blocking tabs now correctly unlocked with PRO licenses
* SECURITY: Single licenses can no longer be activated on multiple domains simultaneously
* Bug fixed: License validation was not correctly evaluated

= 1.4.9 =
* Immediate license activation after key entry
* Email sending after purchase optimized

= 0.93 Beta =
* NEW: Badge "Show at forms" - local/static position at form
* FIX: Select dropdown auto-save for badge_display_type
* FIX: badge_text_color now correctly saved
* NEW: Split license for WordPress/ThemeForest compatibility
* IMPROVED: Badge CSS optimized for forms mode

= 0.92 Beta =
* NEW: Badge system with custom branding
* NEW: Badge position selectable (4 corners)
* NEW: Badge text & color customizable
* IMPROVED: Admin UI/UX improved

= 0.91 Beta =
* NEW: GEO-Blocking with interactive country selection
* NEW: Phrase-blocking with regex support
* IMPROVED: Statistics with filter
* FIX: Multiple bug fixes

= 0.9 Beta =
* Initial beta release
* Honeypot protection
* Timestamp validation
* JavaScript check
* User agent check
* Typing speed analysis
* Live statistics

== Upgrade Notice ==

= 1.9.3 =
Major update: Lite version now completely free with optional GDPR-compliant telemetry. All license checks removed.

== License ==

This plugin is licensed under GNU General Public License v2 or later.

**Free to use for:**
- Personal websites
- Client projects
- Commercial websites

See LICENSE.txt for complete terms.

== Support ==

**Free Support:**
- WordPress.org Forum: https://wordpress.org/support/plugin/germanfence-light

**Documentation:**
- https://germanfence.de/docs


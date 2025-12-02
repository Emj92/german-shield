# GeoIP Database Directory

This directory is for storing GeoIP database files (optional).

## MaxMind GeoLite2

If you want to use local GeoIP lookups instead of API calls, you can download the MaxMind GeoLite2 database:

1. Sign up for a free account at https://www.maxmind.com/en/geolite2/signup
2. Download the GeoLite2-Country database (MMDB format)
3. Place the `GeoLite2-Country.mmdb` file in this directory

The plugin will automatically use the local database if available, which is faster and doesn't require external API calls.

## Alternative

If no local database is found, the plugin will automatically use free GeoIP APIs:
- ip-api.com
- ipapi.co
- Cloudflare headers (if behind Cloudflare)

Results are cached for 24 hours to minimize API calls.


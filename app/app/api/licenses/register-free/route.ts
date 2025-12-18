import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/licenses/register-free
 * Registriert eine FREE-License in der Portal-Datenbank
 * 
 * Body: { email: string, licenseKey: string, domain: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, licenseKey, domain } = body;

    // Validierung
    if (!email || !licenseKey) {
      return NextResponse.json(
        { success: false, error: 'E-Mail und License-Key sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfen ob License-Key bereits existiert
    const existingLicense = await prisma.license.findUnique({
      where: { licenseKey: licenseKey },
      include: { activeDomains: true }
    });

    if (existingLicense) {
      console.log(`[FREE-LICENSE-API] License ${licenseKey} existiert bereits (${existingLicense.id})`);
      
      // Wenn Domain angegeben wurde, füge sie hinzu (falls noch nicht vorhanden)
      if (domain) {
        const domainExists = existingLicense.activeDomains.some(d => d.domain === domain);
        
        if (!domainExists && existingLicense.activeDomains.length < existingLicense.maxDomains) {
          await prisma.licenseDomain.create({
            data: {
              licenseId: existingLicense.id,
              domain: domain,
              lastSeenAt: new Date()
            }
          });
          console.log(`[FREE-LICENSE-API] Domain hinzugefügt: ${domain}`);
        } else if (domainExists) {
          // Domain bereits vorhanden, aktualisiere lastSeenAt
          await prisma.licenseDomain.updateMany({
            where: { 
              licenseId: existingLicense.id,
              domain: domain 
            },
            data: { lastSeenAt: new Date() }
          });
          console.log(`[FREE-LICENSE-API] Domain aktualisiert: ${domain}`);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'License bereits registriert',
        licenseId: existingLicense.id 
      });
    }

    // Suche oder erstelle User
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Wenn User nicht existiert, erstelle Shadow-Account mit verificationToken
    let isNewUser = false;
    if (!user) {
      console.log(`[FREE-LICENSE-API] Erstelle Shadow-User für ${email}`);
      
      // Generiere Token für Passwort-Setup
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7); // 7 Tage gültig
      
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0], // Name aus E-Mail ableiten
          password: '', // Kein Passwort für Shadow-Accounts
          role: 'USER',
          emailVerified: true, // Als verifiziert markieren
          verificationToken: verificationToken,
          verificationTokenExpiry: tokenExpiry
        }
      });
      
      isNewUser = true;
      console.log(`[FREE-LICENSE-API] Shadow-User erstellt: ${user.id} mit Token für Passwort-Setup`);
    }

    // Erstelle FREE-License in DB
    // FREE API-Keys "laufen nie ab" = 100 Jahre in der Zukunft
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 100);
    
    const license = await prisma.license.create({
      data: {
        licenseKey: licenseKey,
        userId: user.id,
        packageType: 'FREE',
        status: 'ACTIVE',
        isActive: true,
        maxDomains: 1,
        expiresAt: farFuture,
        activeDomains: domain ? {
          create: {
            domain: domain,
            lastSeenAt: new Date()
          }
        } : undefined
      }
    });

    console.log(`[FREE-LICENSE-API] ✅ FREE-License erstellt: ${license.id} für User ${user.id} (${email})`);

    // Optional: Willkommens-E-Mail senden (nur wenn neuer User)
    if (isNewUser && user.verificationToken) {
      try {
        const passwordSetupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://portal.germanfence.de'}/set-password?token=${user.verificationToken}`;
        
        await resend.emails.send({
          from: 'GermanFence <noreply@germanfence.de>',
          to: email,
          subject: '🎉 Willkommen bei GermanFence!',
          html: `
            <h2>Willkommen bei GermanFence! 🇩🇪</h2>
            <p>Dein kostenloser API-Key wurde erfolgreich aktiviert!</p>
            
            <div style="background: #F2F5F8; padding: 20px; border-radius: 9px; margin: 20px 0;">
              <strong>Dein License-Key:</strong><br/>
              <code style="font-size: 16px; background: white; padding: 8px; border-radius: 9px; display: inline-block; margin-top: 10px;">${licenseKey}</code>
            </div>

            <h3>🔐 Portal-Zugang einrichten</h3>
            <p>Um dich im GermanFence Portal einloggen zu können, musst du zuerst ein Passwort setzen:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${passwordSetupUrl}" style="display: inline-block; padding: 14px 28px; background: #22D6DD; color: #ffffff; text-decoration: none; border-radius: 9px; font-weight: 600; font-size: 15px;">
                🔐 Passwort setzen
              </a>
            </div>

            <p style="color: #666; font-size: 13px;">Der Link ist 7 Tage gültig.</p>

            <p>Bei Fragen stehen wir dir gerne zur Verfügung!<br/>
            Dein GermanFence Team 🛡️</p>
          `
        });
        console.log(`[FREE-LICENSE-API] Willkommens-E-Mail mit Passwort-Setup-Link gesendet an ${email}`);
      } catch (emailError) {
        console.error('[FREE-LICENSE-API] E-Mail-Fehler:', emailError);
        // Fehler nicht durchreichen, da License trotzdem erstellt wurde
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'FREE-License erfolgreich registriert',
      licenseId: license.id,
      userId: user.id,
      passwordSetupToken: isNewUser ? user.verificationToken : null
    });

  } catch (error) {
    console.error('[FREE-LICENSE-API] Fehler:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}


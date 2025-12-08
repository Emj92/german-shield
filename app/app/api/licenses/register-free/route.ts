import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

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
      where: { licenseKey: licenseKey }
    });

    if (existingLicense) {
      console.log(`[FREE-LICENSE-API] License ${licenseKey} existiert bereits (${existingLicense.id})`);
      
      // Wenn Domain angegeben wurde, füge sie hinzu (falls noch nicht vorhanden)
      if (domain && existingLicense.activatedDomain !== domain) {
        await prisma.license.update({
          where: { id: existingLicense.id },
          data: { 
            activatedDomain: domain,
            lastChecked: new Date()
          }
        });
        console.log(`[FREE-LICENSE-API] Domain aktualisiert: ${domain}`);
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

    // Wenn User nicht existiert, erstelle Shadow-Account
    if (!user) {
      console.log(`[FREE-LICENSE-API] Erstelle Shadow-User für ${email}`);
      
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0], // Name aus E-Mail ableiten
          password: '', // Kein Passwort für Shadow-Accounts
          role: 'USER',
          emailVerified: new Date() // Als verifiziert markieren
        }
      });
      
      console.log(`[FREE-LICENSE-API] Shadow-User erstellt: ${user.id}`);
    }

    // Erstelle FREE-License in DB
    const license = await prisma.license.create({
      data: {
        licenseKey: licenseKey,
        userId: user.id,
        type: 'FREE',
        status: 'ACTIVE',
        isActive: true,
        activatedDomain: domain || null,
        maxDomains: 1,
        expiresAt: null, // FREE-Lizenzen laufen nie ab
        lastChecked: new Date()
      }
    });

    console.log(`[FREE-LICENSE-API] ✅ FREE-License erstellt: ${license.id} für User ${user.id} (${email})`);

    // Optional: Willkommens-E-Mail senden (nur wenn neuer User)
    if (user.createdAt.getTime() === license.createdAt.getTime()) {
      try {
        await resend.emails.send({
          from: 'GermanFence <noreply@germanfence.de>',
          to: email,
          subject: '🎉 Willkommen bei GermanFence!',
          html: `
            <h2>Willkommen bei GermanFence! 🇩🇪</h2>
            <p>Deine kostenlose Lizenz wurde erfolgreich aktiviert!</p>
            
            <div style="background: #F2F5F8; padding: 20px; border-radius: 9px; margin: 20px 0;">
              <strong>Dein License-Key:</strong><br/>
              <code style="font-size: 16px; background: white; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 10px;">${licenseKey}</code>
            </div>

            <p><strong>Portal-Zugang:</strong><br/>
            Du kannst dich jetzt im GermanFence Portal einloggen:<br/>
            <a href="https://portal.germanfence.de/login">https://portal.germanfence.de/login</a></p>

            <p>Bei Fragen stehen wir dir gerne zur Verfügung!<br/>
            Dein GermanFence Team 🛡️</p>
          `
        });
        console.log(`[FREE-LICENSE-API] Willkommens-E-Mail gesendet an ${email}`);
      } catch (emailError) {
        console.error('[FREE-LICENSE-API] E-Mail-Fehler:', emailError);
        // Fehler nicht durchreichen, da License trotzdem erstellt wurde
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'FREE-License erfolgreich registriert',
      licenseId: license.id,
      userId: user.id
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


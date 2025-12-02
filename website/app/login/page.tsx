"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22D6DD]/10 to-[#F06292]/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#22D6DD] mb-8 transition">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Homepage
        </Link>

        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image 
                src="/screenshots/logo_klein.png" 
                alt="German Shield" 
                width={80} 
                height={80}
                className="drop-shadow-md"
              />
            </div>
            <CardTitle className="text-3xl">
              <span className="bg-gradient-to-r from-[#22D6DD] to-[#F06292] bg-clip-text text-transparent">
                Willkommen zurück
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              Melde dich an, um deine Downloads und Rechnungen einzusehen
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-300 focus:border-[#22D6DD] focus:ring-[#22D6DD]"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link href="/forgot-password" className="text-sm text-[#22D6DD] hover:underline">
                    Vergessen?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300 focus:border-[#22D6DD] focus:ring-[#22D6DD]"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#22D6DD] to-[#F06292] hover:opacity-90 text-white"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Anmelden
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Noch kein Konto?{" "}
              <Link href="/register" className="text-[#22D6DD] hover:underline font-semibold">
                Jetzt registrieren
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Probleme beim Login?{" "}
          <a href="mailto:support@german-shield.com" className="text-[#22D6DD] hover:underline">
            Kontaktiere uns
          </a>
        </p>
      </div>
    </div>
  );
}


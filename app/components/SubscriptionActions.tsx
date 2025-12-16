'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TrendingUp, X, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

type PackageType = 'SINGLE' | 'FREELANCER' | 'AGENCY'

interface SubscriptionActionsProps {
  subscriptionId: string
  currentPackage: PackageType
  currentPrice: number
}

const PACKAGES = {
  SINGLE: { name: 'Single', price: 39, domains: 1, color: 'bg-blue-500' },
  FREELANCER: { name: 'Freelancer', price: 0.50, domains: 5, color: 'bg-purple-500' }, // TEST
  AGENCY: { name: 'Agency', price: 0.80, domains: 20, color: 'bg-orange-500' }, // TEST
}

const PACKAGE_ORDER: PackageType[] = ['SINGLE', 'FREELANCER', 'AGENCY']

export function SubscriptionActions({ subscriptionId, currentPackage, currentPrice }: SubscriptionActionsProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const currentIndex = PACKAGE_ORDER.indexOf(currentPackage)
  const availableUpgrades = PACKAGE_ORDER.slice(currentIndex + 1)

  const calculateUpgradePrice = (targetPackage: PackageType) => {
    const targetPrice = PACKAGES[targetPackage].price
    const difference = targetPrice - currentPrice
    return difference > 0 ? difference : 0
  }

  const handleUpgrade = async () => {
    if (!selectedPackage) return

    setLoading(true)
    try {
      const upgradePrice = calculateUpgradePrice(selectedPackage)
      
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          targetPackage: selectedPackage,
          upgradeFee: upgradePrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upgrade fehlgeschlagen')
      }

      // Redirect to Mollie payment
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        addToast({ type: 'success', title: 'Upgrade erfolgreich!' })
        setUpgradeOpen(false)
        window.location.reload()
      }
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: 'Fehler beim Upgrade',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kündigung fehlgeschlagen')
      }

      addToast({ type: 'success', title: 'Abo erfolgreich gekündigt' })
      setCancelOpen(false)
      window.location.reload()
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: 'Fehler bei der Kündigung',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-3 pt-4 border-t border-[#d9dde1]">
        <Button 
          onClick={() => setUpgradeOpen(true)}
          disabled={availableUpgrades.length === 0}
          className="flex-1 bg-[#22D6DD] text-white hover:bg-[#22D6DD]/90 border-[#22D6DD] transition-transform hover:-translate-y-0.5"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Paket upgraden
        </Button>
        <Button 
          onClick={() => setCancelOpen(true)}
          className="flex-1 bg-[#F06292] text-white hover:bg-[#F06292]/90 border-[#F06292] transition-transform hover:-translate-y-0.5"
        >
          <X className="mr-2 h-4 w-4" />
          Abo kündigen
        </Button>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Paket upgraden</DialogTitle>
            <DialogDescription>
              Wähle dein neues Paket. Du zahlst nur die Differenz zum aktuellen Paket.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-[#F2F5F8] rounded-[9px] p-4 border border-[#d9dde1]">
              <div className="text-sm font-medium text-muted-foreground mb-1">Aktuelles Paket</div>
              <div className="text-lg font-bold">
                GermanFence {PACKAGES[currentPackage].name} - {currentPrice}€/Jahr
              </div>
            </div>

            {availableUpgrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Du hast bereits das höchste Paket! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {availableUpgrades.map((pkg) => {
                  const upgradePrice = calculateUpgradePrice(pkg)
                  const isSelected = selectedPackage === pkg
                  
                  return (
                    <button
                      key={pkg}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`w-full p-4 rounded-[9px] border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#22D6DD] bg-[#22D6DD]/5'
                          : 'border-[#d9dde1] hover:border-[#22D6DD]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`${PACKAGES[pkg].color} text-white`}>
                          {PACKAGES[pkg].name}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#22D6DD]">
                            +{upgradePrice}€
                          </div>
                          <div className="text-xs text-muted-foreground">Upgrade-Gebühr</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {PACKAGES[pkg].domains} Domain{PACKAGES[pkg].domains > 1 ? 's' : ''} • {PACKAGES[pkg].price}€/Jahr
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={!selectedPackage || loading}
              className="bg-[#22D6DD] text-white hover:bg-[#22D6DD]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                <>
                  Jetzt upgraden
                  {selectedPackage && ` für ${calculateUpgradePrice(selectedPackage)}€`}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abo wirklich kündigen?</DialogTitle>
            <DialogDescription>
              Dein Abo läuft bis zum Ende der aktuellen Laufzeit weiter. Danach wird es nicht mehr verlängert.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[9px] p-4">
            <div className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Nach der Kündigung verlierst du den Zugriff auf Premium-Features am Ende der Laufzeit.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Behalten
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              className="bg-[#F06292] text-white hover:bg-[#F06292]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gekündigt...
                </>
              ) : (
                'Ja, kündigen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


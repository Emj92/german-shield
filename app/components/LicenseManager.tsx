'use client'

import { useState } from 'react'

interface Installation {
  id: string
  siteUrl: string
  siteName: string | null
  apiKey: string
  version: string
  isActive: boolean
  lastSeen: Date
  createdAt: Date
  user: {
    email: string
    name: string | null
  }
}

interface LicenseManagerProps {
  installations: Installation[]
}

export default function LicenseManager({ installations: initialInstallations }: LicenseManagerProps) {
  const [installations, setInstallations] = useState(initialInstallations)
  const [searchTerm, setSearchTerm] = useState('')
  const [showApiKey, setShowApiKey] = useState<string | null>(null)

  const filteredInstallations = installations.filter(
    (inst) =>
      inst.siteUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.siteName && inst.siteName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/installations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        setInstallations((prev) =>
          prev.map((inst) =>
            inst.id === id ? { ...inst, isActive: !currentStatus } : inst
          )
        )
      }
    } catch (error) {
      console.error('Error toggling installation:', error)
    }
  }

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    // TODO: Toast notification
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
        <input
          type="text"
          placeholder="Suche nach URL, E-Mail oder Site-Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">Gesamt</p>
          <p className="text-3xl font-bold text-white">{installations.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">Aktiv</p>
          <p className="text-3xl font-bold text-white">
            {installations.filter((i) => i.isActive).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">Inaktiv</p>
          <p className="text-3xl font-bold text-white">
            {installations.filter((i) => !i.isActive).length}
          </p>
        </div>
      </div>

      {/* Installations Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Nutzer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Zuletzt gesehen
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredInstallations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Keine Installationen gefunden
                  </td>
                </tr>
              ) : (
                filteredInstallations.map((installation) => (
                  <tr key={installation.id} className="hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {installation.siteName || 'Unbenannt'}
                        </p>
                        <p className="text-sm text-gray-400">{installation.siteUrl}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{installation.user.name || 'Unbekannt'}</p>
                        <p className="text-sm text-gray-400">{installation.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm text-cyan-400 bg-gray-900/50 px-2 py-1 rounded">
                          {showApiKey === installation.id
                            ? installation.apiKey
                            : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() =>
                            setShowApiKey(
                              showApiKey === installation.id ? null : installation.id
                            )
                          }
                          className="text-gray-400 hover:text-white transition"
                        >
                          {showApiKey === installation.id ? '🙈' : '👁️'}
                        </button>
                        <button
                          onClick={() => copyApiKey(installation.apiKey)}
                          className="text-gray-400 hover:text-white transition"
                          title="Kopieren"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{installation.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          installation.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {installation.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(installation.lastSeen).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(installation.id, installation.isActive)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          installation.isActive
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                        }`}
                      >
                        {installation.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


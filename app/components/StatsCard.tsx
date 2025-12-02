interface StatsCardProps {
  title: string
  value: number
  icon: string
  color: 'cyan' | 'green' | 'blue' | 'red'
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-500/10 to-cyan-600/10 border-cyan-500/20',
    green: 'from-green-500/10 to-green-600/10 border-green-500/20',
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
    red: 'from-red-500/10 to-red-600/10 border-red-500/20',
  }

  const iconColorClasses = {
    cyan: 'from-cyan-400 to-cyan-600',
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    red: 'from-red-400 to-red-600',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-2xl p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${iconColorClasses[color]} rounded-xl opacity-80`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}


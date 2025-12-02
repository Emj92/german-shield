// Theme-Konfiguration basierend auf Plugin-Farben
export const theme = {
  colors: {
    primary: '#22D6DD', // Türkis/Cyan (Plugin-Hauptfarbe)
    
    // White Mode
    light: {
      bg: {
        primary: '#ffffff',
        secondary: '#f0f0f1',
        tertiary: '#F9FAFB',
      },
      text: {
        primary: '#1d2327',
        secondary: '#646970',
      },
      border: {
        primary: '#c3cbd5',
        secondary: '#e5e7eb',
      },
    },
    
    // Dark Mode
    dark: {
      bg: {
        primary: '#1D2327',
        secondary: '#2c3338',
        tertiary: '#23282d',
      },
      text: {
        primary: '#f0f0f1',
        secondary: '#a7aaad',
      },
      border: {
        primary: '#3c434a',
        secondary: '#50575e',
      },
    },
    
    // Status-Farben
    status: {
      success: '#00ba37',
      warning: '#f0b849',
      error: '#d63638',
      info: '#2271b1',
    },
  },
}

export type Theme = 'light' | 'dark'


/**
 * Sistema de gestión de temas para Astro + Tailwind CSS
 * Maneja el cambio entre tema oscuro y claro con persistencia
 */

export type Theme = 'light' | 'dark';

export const THEME_CONFIG = {
  DEFAULT_THEME: 'dark' as Theme,
  STORAGE_KEY: 'theme-preference',
  HTML_CLASS: 'dark',
  ATTRIBUTE: 'data-theme'
} as const;

/**
 * Clase principal para gestionar el sistema de temas
 */
export class ThemeManager {
  private currentTheme: Theme;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    this.currentTheme = this.getInitialTheme();
  }

  /**
   * Obtiene el tema inicial basado en localStorage o el tema por defecto
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return THEME_CONFIG.DEFAULT_THEME;
    }

    try {
      const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Error accessing localStorage for theme:', error);
    }

    return THEME_CONFIG.DEFAULT_THEME;
  }

  /**
   * Obtiene el tema actual
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Establece un nuevo tema
   */
  setTheme(theme: Theme): void {
    if (this.currentTheme === theme) return;

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.notifyListeners(theme);
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Aplica el tema al DOM
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add(THEME_CONFIG.HTML_CLASS);
    } else {
      html.classList.remove(THEME_CONFIG.HTML_CLASS);
    }

    // También establecer un atributo data para CSS adicional si es necesario
    html.setAttribute(THEME_CONFIG.ATTRIBUTE, theme);
  }

  /**
   * Guarda el tema en localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Inicializa el tema en el DOM (llamar al cargar la página)
   */
  init(): void {
    this.applyTheme(this.currentTheme);
  }

  /**
   * Suscribe un listener para cambios de tema
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    
    // Retorna función para desuscribirse
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica a todos los listeners sobre el cambio de tema
   */
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme listener:', error);
      }
    });
  }
}

// Instancia singleton del gestor de temas
export const themeManager = new ThemeManager();

/**
 * Hook para usar en componentes que necesiten reaccionar a cambios de tema
 */
export function useTheme() {
  return {
    theme: themeManager.getTheme(),
    setTheme: (theme: Theme) => themeManager.setTheme(theme),
    toggleTheme: () => themeManager.toggleTheme(),
    subscribe: (listener: (theme: Theme) => void) => themeManager.subscribe(listener)
  };
}

/**
 * Función para inicializar el tema (llamar en el script principal)
 */
export function initTheme(): void {
  themeManager.init();
}

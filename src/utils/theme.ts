/**
 * Sistema de gestión de temas para Astro + Tailwind CSS
 * Maneja el cambio entre tema oscuro y claro con persistencia
 *
 * CARACTERÍSTICAS:
 * - ✅ Anti-flicker: Script SSR que aplica tema antes del render
 * - ✅ Persistencia: Guarda preferencia en localStorage
 * - ✅ Reactivo: Sistema de listeners para cambios de tema
 * - ✅ Accesible: Actualiza meta theme-color para móviles
 * - ✅ TypeScript: Tipado estricto y validación
 *
 * USO EN LAYOUTS:
 * ```astro
 * ---
 * import ThemeScript from '../components/layout/ThemeScript.astro';
 * ---
 * <head>
 *   <!-- IMPORTANTE: Debe ir temprano en el <head> para evitar flicker -->
 *   <ThemeScript />
 * </head>
 * ```
 *
 * USO EN COMPONENTES:
 * ```typescript
 * import { useTheme } from '../utils/theme.ts';
 *
 * const { theme, setTheme, toggleTheme, subscribe } = useTheme();
 * ```
 *
 * REEMPLAZA A:
 * - ❌ theme-init.ts (eliminado - era redundante)
 * - ❌ Lógica duplicada en ThemeScript.astro (ahora usa getThemeInitScript)
 *
 * @author Matías Cappato
 * @version 2.0.0 - Unificado y optimizado
 */

export type Theme = 'light' | 'dark';

export const THEME_CONFIG = {
  DEFAULT_THEME: 'dark' as Theme,
  STORAGE_KEY: 'theme-preference',
  HTML_CLASS: 'dark',
  ATTRIBUTE: 'data-theme'
} as const;

/**
 * Colores para meta theme-color en dispositivos móviles
 */
export const THEME_COLORS = {
  DARK: '#111827',
  LIGHT: '#ffffff',
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

    // Establecer atributo data-theme para CSS adicional
    html.setAttribute(THEME_CONFIG.ATTRIBUTE, theme);

    // Establecer dataset para acceso más fácil desde JavaScript
    html.dataset.theme = theme;

    // Actualizar meta theme-color para móviles
    this.updateMetaThemeColor(theme);
  }

  /**
   * Actualiza el meta theme-color para dispositivos móviles
   */
  private updateMetaThemeColor(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? THEME_COLORS.DARK : THEME_COLORS.LIGHT;
      metaThemeColor.setAttribute('content', color);
    }
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

/**
 * Script anti-flicker que debe ejecutarse en el <head>
 * Aplica el tema inmediatamente para prevenir flash de contenido
 *
 * @param minify - Si true, minifica el script para mejor performance
 */
export function getThemeInitScript(minify: boolean = true): string {
  const script = `
    (function() {
      const STORAGE_KEY = '${THEME_CONFIG.STORAGE_KEY.replace(/'/g, "\\'")}';
      const DEFAULT_THEME = '${THEME_CONFIG.DEFAULT_THEME}';
      const HTML_CLASS = '${THEME_CONFIG.HTML_CLASS}';

      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      let theme = DEFAULT_THEME;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          theme = stored;
        }
      } catch (error) {
        console.warn('Theme init: localStorage not available');
      }

      const html = document.documentElement;

      if (theme === 'dark') {
        html.classList.add(HTML_CLASS);
      } else {
        html.classList.remove(HTML_CLASS);
      }

      html.setAttribute('${THEME_CONFIG.ATTRIBUTE}', theme);
    })();
  `;

  if (minify) {
    return script
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, ';}')
      .replace(/{\s*/g, '{')
      .replace(/\s*}/g, '}')
      .trim();
  }

  return script;
}

/**
 * Script de inicialización de tema para prevenir flickers
 * Este script debe ejecutarse lo antes posible en el <head>
 */

// Configuración del tema (duplicada para evitar dependencias)
const THEME_CONFIG = {
  DEFAULT_THEME: 'dark',
  STORAGE_KEY: 'theme-preference',
  HTML_CLASS: 'dark'
} as const;

/**
 * Función que se ejecuta inmediatamente para aplicar el tema
 * antes de que se renderice el contenido
 */
(function initThemeImmediate() {
  // Solo ejecutar en el navegador
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  let theme = THEME_CONFIG.DEFAULT_THEME;

  // Intentar obtener el tema guardado
  try {
    const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    }
  } catch (error) {
    // Fallar silenciosamente si localStorage no está disponible
    console.warn('Theme init: localStorage not available');
  }

  // Aplicar el tema inmediatamente
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add(THEME_CONFIG.HTML_CLASS);
  } else {
    html.classList.remove(THEME_CONFIG.HTML_CLASS);
  }

  // Establecer atributo data-theme
  html.setAttribute('data-theme', theme);

  // Opcional: Establecer una variable CSS custom para uso adicional
  html.style.setProperty('--theme', theme);
})();

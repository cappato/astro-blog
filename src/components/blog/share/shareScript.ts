/**
 * Script TypeScript para manejar la funcionalidad de compartir
 * Se ejecuta en el cliente para manejar eventos de click
 */

import type { ShareData, ShareResult } from './types';
import { SocialPlatform } from './types';
import { 
  copyToClipboard, 
  handleFacebookShare, 
  dispatchToastEvent,
  validateShareData,
  sanitizeTitle 
} from './utils';

/**
 * Inicializa los event listeners para los botones de compartir
 */
export const initializeShareButtons = (): void => {
  if (typeof document === 'undefined') return;

  // Manejar botones de copiar enlace
  const copyButtons = document.querySelectorAll('[data-action="copy"]');
  copyButtons.forEach(button => {
    button.addEventListener('click', handleCopyClick);
  });

  // Manejar botones de Facebook
  const facebookButtons = document.querySelectorAll('[data-action="facebook-share"]');
  facebookButtons.forEach(button => {
    button.addEventListener('click', handleFacebookClick);
  });
};

/**
 * Maneja el click en botones de copiar enlace
 */
const handleCopyClick = async (event: Event): Promise<void> => {
  event.preventDefault();
  
  const button = event.currentTarget as HTMLElement;
  const url = button.getAttribute('data-url') || window.location.href;
  
  try {
    const result = await copyToClipboard(url);
    dispatchToastEvent(result.message || 'Enlace copiado', !result.success);
    
    // Feedback visual temporal
    if (result.success) {
      addTemporaryFeedback(button, 'success');
    }
  } catch (error) {
    console.error('Error al copiar enlace:', error);
    dispatchToastEvent('Error al copiar el enlace', true);
  }
};

/**
 * Maneja el click en botones de Facebook
 */
const handleFacebookClick = (event: Event): void => {
  event.preventDefault();
  
  const button = event.currentTarget as HTMLElement;
  const url = button.getAttribute('data-url') || '';
  const title = button.getAttribute('data-title') || '';
  
  const shareData: ShareData = {
    url,
    title: sanitizeTitle(title)
  };
  
  if (!validateShareData(shareData)) {
    console.error('Datos de compartir inválidos:', shareData);
    dispatchToastEvent('Error: datos de compartir inválidos', true);
    return;
  }
  
  try {
    handleFacebookShare(shareData);
  } catch (error) {
    console.error('Error al compartir en Facebook:', error);
    dispatchToastEvent('Error al compartir en Facebook', true);
  }
};

/**
 * Añade feedback visual temporal a un botón
 */
const addTemporaryFeedback = (element: HTMLElement, type: 'success' | 'error'): void => {
  const originalClasses = element.className;
  const feedbackClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  // Añadir clase de feedback
  element.classList.add(feedbackClass);
  
  // Remover después de 1 segundo
  setTimeout(() => {
    element.className = originalClasses;
  }, 1000);
};

/**
 * Maneja errores globales relacionados con compartir
 */
const handleShareError = (error: Error, platform: SocialPlatform): void => {
  console.error(`Error al compartir en ${platform}:`, error);
  dispatchToastEvent(`Error al compartir en ${platform}`, true);
};

/**
 * Inicialización cuando el DOM está listo
 */
const initWhenReady = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShareButtons);
  } else {
    initializeShareButtons();
  }
};

// Auto-inicialización
initWhenReady();

// Exportar para uso manual si es necesario
export { handleCopyClick, handleFacebookClick, addTemporaryFeedback };

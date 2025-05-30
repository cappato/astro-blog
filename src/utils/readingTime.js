/**
 * Calcula el tiempo estimado de lectura en minutos
 * @param {string} content - El contenido del artículo
 * @param {number} wordsPerMinute - Palabras por minuto (por defecto: 200)
 * @returns {number} - Tiempo de lectura en minutos
 */
export function getReadingTime(content, wordsPerMinute = 200) {
  const text = content.replace(/<\/?[^>]+(>|$)/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return minutes;
}

/**
 * Formatea el tiempo de lectura para mostrar
 * @param {number} minutes - Tiempo en minutos
 * @returns {string} - Texto formateado
 */
export function formatReadingTime(minutes) {
  if (minutes < 1) {
    return 'Menos de 1 min de lectura';
  } else if (minutes === 1) {
    return '1 min de lectura';
  } else {
    return `${minutes} min de lectura`;
  }
}
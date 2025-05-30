/**
 * Calcula el tiempo estimado de lectura en minutos
 * @param content Contenido del artículo
 * @param wordsPerMinute Palabras por minuto (por defecto 200)
 * @returns Tiempo de lectura en minutos
 */
export function getReadingTime(content: string, wordsPerMinute: number = 200): number {
  const text = content.replace(/<\/?[^>]+(>|$)/g, '');
  const words = text.split(/\s+/g).filter(word => word.length > 0);
  const wordCount = words.length;

  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

/**
 * Formatea el tiempo de lectura con la unidad correcta
 * @param minutes Tiempo de lectura en minutos
 * @returns Texto formateado (ej: "5 min de lectura")
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min de lectura`;
}
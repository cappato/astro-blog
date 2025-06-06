#!/usr/bin/env node

/**
 * CSS Classes Optimization Script
 * Reemplaza clases CSS repetitivas por clases semánticas
 */

import fs from 'fs/promises';
import path from 'path';

// Patrones de clases decorativas a eliminar (mantener solo estructura)
const DECORATIVE_PATTERNS = [
  // Colores de texto - todos los grises, azules, verdes, etc.
  /^text-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:text-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^text-white$/,
  /^dark:text-white$/,
  /^text-black$/,
  /^dark:text-black$/,

  // Colores de fondo - todos los colores
  /^bg-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:bg-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^bg-white$/,
  /^dark:bg-white$/,
  /^bg-black$/,
  /^dark:bg-black$/,
  /^bg-.*\/\d+$/,  // bg-blue-600/10, etc.
  /^dark:bg-.*\/\d+$/,
  /^bg-opacity-\d+$/,

  // Bordes - colores y estilos
  /^border-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:border-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^border-.*\/\d+$/,  // border-blue-600/20, etc.
  /^dark:border-.*\/\d+$/,
  /^border-white$/,
  /^dark:border-white$/,
  /^border-black$/,
  /^dark:border-black$/,
  /^border-t$/,
  /^border-b$/,
  /^border-l$/,
  /^border-r$/,

  // Sombras
  /^shadow-(sm|md|lg|xl|2xl|inner|none)$/,
  /^shadow-.*$/,

  // Border radius
  /^rounded(-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
  /^rounded-(t|b|l|r|tl|tr|bl|br)(-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,

  // Estados hover
  /^hover:text-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:hover:text-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^hover:bg-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:hover:bg-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^hover:border-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:hover:border-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^hover:shadow-.*$/,
  /^hover:opacity-\d+$/,
  /^hover:scale-\d+$/,
  /^hover:underline$/,
  /^hover:no-underline$/,

  // Estados focus
  /^focus:outline-none$/,
  /^focus:ring(-\d+)?$/,
  /^focus:ring-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^focus:ring-offset(-\d+)?$/,
  /^focus:ring-offset-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^dark:focus:ring-offset-(gray|blue|green|red|yellow|purple|pink|indigo|teal|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/,
  /^focus:border-.*$/,

  // Transiciones y animaciones
  /^transition(-all|-colors|-opacity|-shadow|-transform)?$/,
  /^duration-\d+$/,
  /^ease-(in|out|in-out|linear)$/,
  /^delay-\d+$/,
  /^animate-.*$/,

  // Otros decorativos
  /^italic$/,
  /^not-italic$/,
  /^underline$/,
  /^no-underline$/,
  /^line-through$/,
  /^no-line-through$/,
  /^opacity-\d+$/,
  /^backdrop-.*$/,
  /^filter$/,
  /^blur-.*$/,
  /^brightness-.*$/,
  /^contrast-.*$/,
  /^grayscale$/,
  /^hue-rotate-.*$/,
  /^invert$/,
  /^saturate-.*$/,
  /^sepia$/,

  // Clases semánticas personalizadas
  /^text-content$/,
  /^text-secondary$/,
  /^bg-card$/,
  /^border-card$/,
  /^card-base$/,
  /^bg-surface$/,
  /^bg-muted$/,

  // Clases específicas adicionales que se escaparon
  /^hidden$/,
  /^inline$/,
  /^inline-flex$/,
  /^inline-block$/,
  /^dark:inline$/,
  /^dark:inline-flex$/,
  /^dark:inline-block$/,
  /^dark:hidden$/,

  // Line clamp (decorativo)
  /^line-clamp-\d+$/,

  // CAPTURA AGRESIVA: Cualquier clase que contenga colores
  /.*blue.*/,
  /.*green.*/,
  /.*red.*/,
  /.*yellow.*/,
  /.*purple.*/,
  /.*pink.*/,
  /.*indigo.*/,
  /.*teal.*/,
  /.*orange.*/,
  /.*cyan.*/,
  /.*gray.*/,
  /.*grey.*/,
  /.*white.*/,
  /.*black.*/,

  // Clases con efectos visuales
  /.*shadow.*/,
  /.*rounded.*/,
  /.*border.*/,
  /.*bg-.*/,
  /.*text-(?!xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify).*/,
  /.*hover.*/,
  /.*focus.*/,
  /.*transition.*/,
  /.*duration.*/,
  /.*ease.*/,
  /.*animate.*/,
  /.*opacity.*/,
  /.*scale.*/,
  /.*rotate.*/,
  /.*translate.*/,
  /.*skew.*/,
  /.*transform.*/,

  // Clases semánticas específicas del proyecto
  /.*card.*/,
  /.*btn.*/,
  /.*input.*/,
  /.*divider.*/,
  /.*primary.*/,
  /.*secondary.*/,
  /.*accent.*/,
  /.*muted.*/,
  /.*surface.*/,
  /.*content.*/

  // Efectos y filtros
  /^backdrop-blur.*$/,
  /^backdrop-brightness.*$/,
  /^backdrop-contrast.*$/,
  /^backdrop-grayscale.*$/,
  /^backdrop-hue-rotate.*$/,
  /^backdrop-invert.*$/,
  /^backdrop-opacity.*$/,
  /^backdrop-saturate.*$/,
  /^backdrop-sepia.*$/
];

// Clases estructurales que DEBEN mantenerse (whitelist MUY RESTRICTIVA)
const STRUCTURAL_CLASSES_TO_KEEP = [
  // Layout básico SOLO
  /^flex$/,
  /^grid$/,
  /^block$/,
  /^inline-block$/,
  /^inline-flex$/,
  /^container$/,

  // Flexbox
  /^flex-col$/,
  /^flex-row$/,
  /^flex-wrap$/,
  /^flex-1$/,
  /^flex-shrink-0$/,
  /^flex-grow$/,
  /^justify-(start|end|center|between|around|evenly)$/,
  /^items-(start|end|center|baseline|stretch)$/,
  /^content-(start|end|center|between|around|evenly)$/,
  /^self-(auto|start|end|center|stretch|baseline)$/,

  // Grid
  /^grid-cols-\d+$/,
  /^grid-rows-\d+$/,
  /^col-span-\d+$/,
  /^row-span-\d+$/,
  /^col-start-\d+$/,
  /^col-end-\d+$/,
  /^row-start-\d+$/,
  /^row-end-\d+$/,

  // Spacing (padding, margin, gap)
  /^p-\d+$/,
  /^px-\d+$/,
  /^py-\d+$/,
  /^pt-\d+$/,
  /^pb-\d+$/,
  /^pl-\d+$/,
  /^pr-\d+$/,
  /^m-\d+$/,
  /^mx-\d+$/,
  /^my-\d+$/,
  /^mt-\d+$/,
  /^mb-\d+$/,
  /^ml-\d+$/,
  /^mr-\d+$/,
  /^gap-\d+$/,
  /^space-x-\d+$/,
  /^space-y-\d+$/,
  /^mx-auto$/,
  /^my-auto$/,

  // Sizing
  /^w-\d+$/,
  /^w-full$/,
  /^w-auto$/,
  /^w-fit$/,
  /^w-screen$/,
  /^h-\d+$/,
  /^h-full$/,
  /^h-auto$/,
  /^h-fit$/,
  /^h-screen$/,
  /^min-w-\d+$/,
  /^min-w-full$/,
  /^min-w-fit$/,
  /^min-h-\d+$/,
  /^min-h-full$/,
  /^min-h-fit$/,
  /^min-h-screen$/,
  /^max-w-\d+$/,
  /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/,
  /^max-w-full$/,
  /^max-w-fit$/,
  /^max-w-screen-(sm|md|lg|xl|2xl)$/,
  /^max-h-\d+$/,
  /^max-h-full$/,
  /^max-h-fit$/,
  /^max-h-screen$/,

  // Typography (solo tamaños y pesos, no colores)
  /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
  /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  /^font-\d+$/,
  /^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/,
  /^tracking-(tighter|tight|normal|wide|wider|widest)$/,
  /^text-(left|center|right|justify)$/,

  // Position
  /^relative$/,
  /^absolute$/,
  /^fixed$/,
  /^sticky$/,
  /^static$/,
  /^top-\d+$/,
  /^bottom-\d+$/,
  /^left-\d+$/,
  /^right-\d+$/,
  /^inset-\d+$/,
  /^z-\d+$/,

  // Overflow
  /^overflow-(auto|hidden|clip|visible|scroll)$/,
  /^overflow-x-(auto|hidden|clip|visible|scroll)$/,
  /^overflow-y-(auto|hidden|clip|visible|scroll)$/,

  // Display responsive
  /^(sm|md|lg|xl|2xl):flex$/,
  /^(sm|md|lg|xl|2xl):grid$/,
  /^(sm|md|lg|xl|2xl):block$/,
  /^(sm|md|lg|xl|2xl):inline-block$/,
  /^(sm|md|lg|xl|2xl):inline-flex$/,
  /^(sm|md|lg|xl|2xl):hidden$/,

  // Responsive variants para todas las clases estructurales
  /^(sm|md|lg|xl|2xl):(flex|grid|block|inline|hidden)$/,
  /^(sm|md|lg|xl|2xl):flex-(col|row|wrap)$/,
  /^(sm|md|lg|xl|2xl):justify-(start|end|center|between|around|evenly)$/,
  /^(sm|md|lg|xl|2xl):items-(start|end|center|baseline|stretch)$/,
  /^(sm|md|lg|xl|2xl):grid-cols-\d+$/,
  /^(sm|md|lg|xl|2xl):gap-\d+$/,
  /^(sm|md|lg|xl|2xl):p-\d+$/,
  /^(sm|md|lg|xl|2xl):m-\d+$/,
  /^(sm|md|lg|xl|2xl):w-\d+$/,
  /^(sm|md|lg|xl|2xl):h-\d+$/,
  /^(sm|md|lg|xl|2xl):text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,

  // Funcionalidad esencial
  /^object-(contain|cover|fill|none|scale-down)$/,
  /^object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
  /^cursor-(auto|default|pointer|wait|text|move|help|not-allowed)$/,
  /^select-(none|text|all|auto)$/,
  /^pointer-events-(none|auto)$/,
  /^resize-(none|y|x|both)$/,
  /^list-(none|disc|decimal)$/,
  /^list-inside$/,
  /^list-outside$/,

  // Accessibility
  /^sr-only$/,
  /^not-sr-only$/,

  // Aspect ratio (funcional)
  /^aspect-(auto|square|video)$/,
  /^aspect-\[.*\]$/
];

// Extensiones de archivo a procesar
const FILE_EXTENSIONS = ['.astro', '.ts', '.js', '.jsx', '.tsx'];

// Directorios a procesar
const DIRECTORIES_TO_PROCESS = [
  'src/components',
  'src/features',
  'src/layouts',
  'src/pages'
];

/**
 * Purga clases decorativas de un archivo manteniendo solo estructura
 */
async function purgeDecorativeClassesInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let purgedContent = content;
    let hasChanges = false;

    // Buscar todas las clases en atributos class="..." preservando formato
    const classRegex = /class="([^"]*)"/g;

    purgedContent = purgedContent.replace(classRegex, (match, classString) => {
      const classes = classString.split(/\s+/).filter(cls => cls.length > 0);
      const filteredClasses = [];

      for (const cls of classes) {
        let shouldKeep = false;

        // Primero verificar si es una clase estructural que debe mantenerse
        for (const pattern of STRUCTURAL_CLASSES_TO_KEEP) {
          if (pattern.test(cls)) {
            shouldKeep = true;
            break;
          }
        }

        // Si no está en la whitelist, verificar si debe eliminarse
        if (!shouldKeep) {
          for (const pattern of DECORATIVE_PATTERNS) {
            if (pattern.test(cls)) {
              hasChanges = true;
              break;
            }
          }
        }

        if (shouldKeep) {
          filteredClasses.push(cls);
        } else {
          hasChanges = true;
        }
      }

      // Retornar las clases filtradas manteniendo formato
      return filteredClasses.length > 0 ? `class="${filteredClasses.join(' ')}"` : '';
    });

    // Limpiar atributos class vacíos pero mantener estructura del archivo
    purgedContent = purgedContent.replace(/\s*class=""\s*/g, ' ');

    // Escribir archivo solo si hay cambios
    if (hasChanges) {
      await fs.writeFile(filePath, purgedContent, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Procesa recursivamente un directorio
 */
async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Procesar subdirectorio recursivamente
        const subResults = await processDirectory(fullPath);
        results.push(...subResults);
      } else if (entry.isFile()) {
        // Verificar si es un archivo que debemos procesar
        const ext = path.extname(entry.name);
        if (FILE_EXTENSIONS.includes(ext)) {
          const hasChanges = await purgeDecorativeClassesInFile(fullPath);
          if (hasChanges) {
            results.push(fullPath);
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Error procesando directorio ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧹 PURGA DE ESTILOS DECORATIVOS');
  console.log('===============================');
  console.log('Eliminando colores, sombras, bordes y efectos...');
  console.log('Manteniendo solo estructura y layout');
  console.log('');

  const projectRoot = path.resolve(process.cwd());
  const allChangedFiles = [];

  for (const dir of DIRECTORIES_TO_PROCESS) {
    const dirPath = path.join(projectRoot, dir);

    try {
      await fs.access(dirPath);
      console.log(` Procesando: ${dir}`);

      const changedFiles = await processDirectory(dirPath);
      allChangedFiles.push(...changedFiles);

      console.log(`   ${changedFiles.length} archivos purgados`);
      console.log('');
    } catch (error) {
      console.log(`️  Directorio no encontrado: ${dir}`);
    }
  }

  console.log(' PURGA COMPLETADA');
  console.log('===================');
  console.log(` Total de archivos purgados: ${allChangedFiles.length}`);
  console.log('');

  if (allChangedFiles.length > 0) {
    console.log(' Archivos modificados:');
    allChangedFiles.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      console.log(`   - ${relativePath}`);
    });

    console.log('');
    console.log('️ Tipos de clases eliminadas:');
    console.log('   - Colores de texto y fondo');
    console.log('   - Bordes y sombras');
    console.log('   - Border radius y efectos');
    console.log('   - Estados hover y focus');
    console.log('   - Transiciones y animaciones');

    console.log('');
    console.log(' Clases estructurales mantenidas:');
    console.log('   - Layout (flex, grid, container)');
    console.log('   - Espaciado (padding, margin, gap)');
    console.log('   - Tipografía estructural (tamaños, peso)');
    console.log('   - Responsive y posicionamiento');
  }

  console.log('');
  console.log(' ¡Proyecto listo para nuevo sistema de diseño!');
}

// Ejecutar el script
main().catch(console.error);

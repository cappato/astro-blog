#!/usr/bin/env node

/**
 * Lessons Learned Management Script
 * Automatiza la creación y gestión de lecciones aprendidas
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuración
const LESSONS_DIR = 'docs/lessons-learned';
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_QUARTER = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

// Plantillas disponibles
const TEMPLATES = {
  'technical': 'technical-lesson.md',
  'process': 'process-improvement.md',
  'retrospective': 'project-retrospective.md'
};

// Categorías disponibles
const CATEGORIES = {
  'seo': 'seo-content.md',
  'tech': 'technical-architecture.md',
  'workflow': 'development-workflow.md',
  'ux': 'user-experience.md'
};

// Niveles de impacto
const IMPACT_LEVELS = ['critical', 'important', 'nice-to-know'];

/**
 * Función principal
 */
async function main() {
  console.log('🧠 Lessons Learned Management Tool\n');
  
  const action = await askQuestion('¿Qué quieres hacer?\n1. Crear nueva lección\n2. Listar lecciones\n3. Buscar lecciones\n4. Actualizar índices\nElige (1-4): ');
  
  switch(action) {
    case '1':
      await createLesson();
      break;
    case '2':
      await listLessons();
      break;
    case '3':
      await searchLessons();
      break;
    case '4':
      await updateIndexes();
      break;
    default:
      console.log('Opción no válida');
  }
  
  rl.close();
}

/**
 * Crear nueva lección
 */
async function createLesson() {
  console.log('\n📝 Creando nueva lección...\n');
  
  // Seleccionar tipo de plantilla
  console.log('Tipos de lección disponibles:');
  Object.keys(TEMPLATES).forEach((key, index) => {
    console.log(`${index + 1}. ${key}`);
  });
  
  const templateChoice = await askQuestion('Selecciona tipo (1-3): ');
  const templateKey = Object.keys(TEMPLATES)[parseInt(templateChoice) - 1];
  
  if (!templateKey) {
    console.log('Tipo no válido');
    return;
  }
  
  // Recopilar información
  const title = await askQuestion('Título de la lección: ');
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const category = await askQuestion(`Categoría (${Object.keys(CATEGORIES).join(', ')}): `);
  const impact = await askQuestion(`Nivel de impacto (${IMPACT_LEVELS.join(', ')}): `);
  const context = await askQuestion('Contexto/Proyecto: ');
  
  // Crear archivo
  const templatePath = path.join(LESSONS_DIR, 'templates', TEMPLATES[templateKey]);
  const lessonPath = path.join(LESSONS_DIR, CURRENT_YEAR.toString(), CURRENT_QUARTER, `${slug}.md`);
  
  // Asegurar que el directorio existe
  const lessonDir = path.dirname(lessonPath);
  if (!fs.existsSync(lessonDir)) {
    fs.mkdirSync(lessonDir, { recursive: true });
  }
  
  // Leer plantilla y personalizar
  let template = fs.readFileSync(templatePath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  template = template
    .replace(/\[Título.*?\]/g, title)
    .replace(/YYYY-MM-DD/g, today)
    .replace(/\[Nombre.*?\]/g, 'Matías Cappato')
    .replace(/#\[área\]/g, `#${category}`)
    .replace(/#\[tipo\]/g, `#${templateKey}`)
    .replace(/\[Proyecto\/.*?\]/g, context)
    .replace(/#critical \| #important \| #nice-to-know/g, `#${impact}`);
  
  // Escribir archivo
  fs.writeFileSync(lessonPath, template);
  
  console.log(`\n✅ Lección creada: ${lessonPath}`);
  console.log(`📝 Edita el archivo para completar los detalles`);
  console.log(`🔗 No olvides actualizar el índice de categoría: ${LESSONS_DIR}/categories/${CATEGORIES[category]}`);
}

/**
 * Listar lecciones
 */
async function listLessons() {
  console.log('\n📚 Lecciones disponibles:\n');
  
  const yearDir = path.join(LESSONS_DIR, CURRENT_YEAR.toString());
  
  if (!fs.existsSync(yearDir)) {
    console.log('No hay lecciones para este año');
    return;
  }
  
  const quarters = fs.readdirSync(yearDir).filter(item => 
    fs.statSync(path.join(yearDir, item)).isDirectory()
  );
  
  quarters.forEach(quarter => {
    console.log(`\n📅 ${quarter}:`);
    const quarterDir = path.join(yearDir, quarter);
    const lessons = fs.readdirSync(quarterDir).filter(file => file.endsWith('.md'));
    
    lessons.forEach(lesson => {
      const lessonPath = path.join(quarterDir, lesson);
      const content = fs.readFileSync(lessonPath, 'utf8');
      const titleMatch = content.match(/^# (.+)$/m);
      const dateMatch = content.match(/\*\*Fecha:\*\* (.+)$/m);
      const tagsMatch = content.match(/\*\*Tags:\*\* (.+)$/m);
      
      console.log(`  📄 ${titleMatch ? titleMatch[1] : lesson}`);
      if (dateMatch) console.log(`     📅 ${dateMatch[1]}`);
      if (tagsMatch) console.log(`     🏷️  ${tagsMatch[1]}`);
      console.log(`     📁 ${lessonPath}`);
    });
  });
}

/**
 * Buscar lecciones
 */
async function searchLessons() {
  const query = await askQuestion('\n🔍 Buscar por palabra clave: ');
  console.log(`\nBuscando "${query}"...\n`);
  
  const results = [];
  const yearDir = path.join(LESSONS_DIR, CURRENT_YEAR.toString());
  
  if (!fs.existsSync(yearDir)) {
    console.log('No hay lecciones para buscar');
    return;
  }
  
  function searchInDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        searchInDirectory(itemPath);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          const titleMatch = content.match(/^# (.+)$/m);
          results.push({
            title: titleMatch ? titleMatch[1] : item,
            path: itemPath,
            preview: getPreview(content, query)
          });
        }
      }
    });
  }
  
  searchInDirectory(yearDir);
  
  if (results.length === 0) {
    console.log('No se encontraron resultados');
  } else {
    results.forEach(result => {
      console.log(`📄 ${result.title}`);
      console.log(`📁 ${result.path}`);
      console.log(`💬 ${result.preview}\n`);
    });
  }
}

/**
 * Actualizar índices
 */
async function updateIndexes() {
  console.log('\n🔄 Actualizando índices...\n');
  
  // Aquí se podría implementar lógica para actualizar automáticamente
  // los índices de categorías y años basado en las lecciones existentes
  
  console.log('📝 Recuerda actualizar manualmente:');
  console.log(`   - ${LESSONS_DIR}/${CURRENT_YEAR}/index.md`);
  console.log(`   - ${LESSONS_DIR}/categories/*.md`);
  console.log('   - README.md principal si es necesario');
}

/**
 * Obtener preview de contenido
 */
function getPreview(content, query) {
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(queryLower)) {
      const start = Math.max(0, i - 1);
      const end = Math.min(lines.length, i + 2);
      return lines.slice(start, end).join(' ').substring(0, 100) + '...';
    }
  }
  
  return content.substring(0, 100) + '...';
}

/**
 * Hacer pregunta al usuario
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createLesson,
  listLessons,
  searchLessons,
  updateIndexes
};

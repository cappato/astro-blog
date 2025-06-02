#!/usr/bin/env node

/**
 * PageSpeed Insights Analyzer
 * 
 * Automatiza el análisis de performance usando PageSpeed Insights
 * Espera el tiempo necesario para obtener informes completos
 * Soporta múltiples URLs y dispositivos (desktop/mobile)
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Configuración del analizador
 */
const CONFIG = {
  // Tiempo de espera para que PageSpeed complete el análisis
  ANALYSIS_WAIT_TIME: 30000, // 30 segundos
  
  // Tiempo adicional de buffer
  BUFFER_TIME: 5000, // 5 segundos extra
  
  // Reintentos en caso de fallo
  MAX_RETRIES: 3,
  RETRY_DELAY: 10000, // 10 segundos entre reintentos
  
  // URLs base de PageSpeed
  PAGESPEED_BASE: 'https://pagespeed.web.dev/analysis',
  
  // Dispositivos soportados
  FORM_FACTORS: {
    DESKTOP: 'desktop',
    MOBILE: 'mobile'
  },
  
  // Directorio de reportes
  REPORTS_DIR: 'reports/pagespeed'
};

/**
 * URLs predefinidas para análisis
 */
const PREDEFINED_URLS = {
  homepage: 'https://cappato.dev',
  blog: 'https://cappato.dev/blog',
  'blog-post-seo': 'https://cappato.dev/blog/seo-automatico-typescript',
  'blog-post-architecture': 'https://cappato.dev/blog/arquitectura-modular-astro',
  'blog-post-testing': 'https://cappato.dev/blog/testing-automatizado-sitios-estaticos',
  'blog-post-darkmode': 'https://cappato.dev/blog/dark-mode-perfecto-astro'
};

/**
 * Clase principal del analizador
 */
class PageSpeedAnalyzer {
  
  /**
   * Analizar una URL específica
   */
  async analyzeUrl(url, formFactor = CONFIG.FORM_FACTORS.DESKTOP, apiKey = null) {
    console.log(`🔍 Analizando: ${url} (${formFactor})`);
    console.log(`⏱️  Esperando ${CONFIG.ANALYSIS_WAIT_TIME / 1000}s para análisis completo...`);
    
    try {
      // Construir URL de PageSpeed
      const pageSpeedUrl = this.buildPageSpeedUrl(url, formFactor, apiKey);
      
      // Iniciar análisis
      console.log(`🚀 Iniciando análisis en PageSpeed Insights...`);
      const startTime = Date.now();
      
      // Hacer request inicial para iniciar el análisis
      const initialResponse = await fetch(pageSpeedUrl);
      if (!initialResponse.ok) {
        throw new Error(`HTTP ${initialResponse.status}: ${initialResponse.statusText}`);
      }
      
      console.log(`✅ Análisis iniciado, esperando resultados...`);
      
      // Esperar el tiempo necesario para que complete
      await this.waitWithProgress(CONFIG.ANALYSIS_WAIT_TIME);
      
      // Obtener resultados finales
      console.log(`📊 Obteniendo resultados finales...`);
      const finalResponse = await fetch(pageSpeedUrl);
      
      if (!finalResponse.ok) {
        throw new Error(`HTTP ${finalResponse.status}: ${finalResponse.statusText}`);
      }
      
      const htmlContent = await finalResponse.text();
      const totalTime = Date.now() - startTime;
      
      console.log(`✅ Análisis completado en ${(totalTime / 1000).toFixed(1)}s`);
      
      // Extraer métricas del HTML
      const metrics = this.extractMetrics(htmlContent);
      
      // Crear reporte
      const report = {
        url,
        formFactor,
        timestamp: new Date().toISOString(),
        analysisTime: totalTime,
        pageSpeedUrl,
        metrics,
        rawHtml: htmlContent
      };
      
      return report;
      
    } catch (error) {
      console.error(`❌ Error analizando ${url}:`, error.message);
      return {
        url,
        formFactor,
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false
      };
    }
  }
  
  /**
   * Analizar múltiples URLs
   */
  async analyzeMultipleUrls(urls, formFactor = CONFIG.FORM_FACTORS.DESKTOP, apiKey = null) {
    console.log(`🎯 Analizando ${urls.length} URLs en ${formFactor}...`);
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n📍 [${i + 1}/${urls.length}] ${url}`);
      
      const result = await this.analyzeUrl(url, formFactor, apiKey);
      results.push(result);
      
      if (result.error) {
        failCount++;
      } else {
        successCount++;
      }
      
      // Pausa entre análisis para no sobrecargar
      if (i < urls.length - 1) {
        console.log(`⏸️  Pausa de 5s antes del siguiente análisis...`);
        await this.sleep(5000);
      }
    }
    
    console.log(`\n📊 RESUMEN: ${successCount} exitosos, ${failCount} fallidos`);
    return results;
  }
  
  /**
   * Analizar URLs predefinidas
   */
  async analyzePredefinedUrls(urlKeys = null, formFactor = CONFIG.FORM_FACTORS.DESKTOP, apiKey = null) {
    const urlsToAnalyze = urlKeys 
      ? urlKeys.map(key => ({ key, url: PREDEFINED_URLS[key] })).filter(item => item.url)
      : Object.entries(PREDEFINED_URLS).map(([key, url]) => ({ key, url }));
    
    if (urlsToAnalyze.length === 0) {
      throw new Error('No se encontraron URLs válidas para analizar');
    }
    
    console.log(`🎯 Analizando URLs predefinidas: ${urlsToAnalyze.map(item => item.key).join(', ')}`);
    
    const results = [];
    
    for (const { key, url } of urlsToAnalyze) {
      console.log(`\n📍 Analizando: ${key} (${url})`);
      const result = await this.analyzeUrl(url, formFactor, apiKey);
      result.urlKey = key;
      results.push(result);
      
      // Pausa entre análisis
      if (urlsToAnalyze.indexOf({ key, url }) < urlsToAnalyze.length - 1) {
        console.log(`⏸️  Pausa de 5s antes del siguiente análisis...`);
        await this.sleep(5000);
      }
    }
    
    return results;
  }
  
  /**
   * Construir URL de PageSpeed Insights
   */
  buildPageSpeedUrl(url, formFactor, apiKey) {
    // Extraer la clave de API de la URL de ejemplo si no se proporciona
    if (!apiKey) {
      // Usar la clave de la URL de ejemplo: ps42rq6fq8
      apiKey = 'ps42rq6fq8';
    }
    
    // Codificar la URL
    const encodedUrl = encodeURIComponent(url);
    
    // Construir URL completa
    return `${CONFIG.PAGESPEED_BASE}/${encodedUrl}/${apiKey}?form_factor=${formFactor}`;
  }
  
  /**
   * Extraer métricas del HTML de PageSpeed
   */
  extractMetrics(html) {
    const metrics = {
      performance: null,
      accessibility: null,
      bestPractices: null,
      seo: null,
      coreWebVitals: {},
      extracted: false,
      debug: {
        htmlLength: html.length,
        foundPatterns: []
      }
    };

    try {
      // Múltiples patrones para encontrar scores
      const patterns = {
        performance: [
          /Performance[^0-9]*(\d+)/i,
          /"performance"[^0-9]*(\d+)/i,
          /performance.*?(\d+)/i,
          /(\d+).*?performance/i
        ],
        accessibility: [
          /Accessibility[^0-9]*(\d+)/i,
          /"accessibility"[^0-9]*(\d+)/i,
          /accessibility.*?(\d+)/i,
          /(\d+).*?accessibility/i
        ],
        bestPractices: [
          /Best Practices[^0-9]*(\d+)/i,
          /"best-practices"[^0-9]*(\d+)/i,
          /best.*?practices.*?(\d+)/i,
          /(\d+).*?best.*?practices/i
        ],
        seo: [
          /SEO[^0-9]*(\d+)/i,
          /"seo"[^0-9]*(\d+)/i,
          /seo.*?(\d+)/i,
          /(\d+).*?seo/i
        ]
      };

      // Intentar extraer cada métrica con múltiples patrones
      for (const [metricName, metricPatterns] of Object.entries(patterns)) {
        for (const pattern of metricPatterns) {
          const match = html.match(pattern);
          if (match && !metrics[metricName]) {
            const score = parseInt(match[1]);
            if (score >= 0 && score <= 100) {
              metrics[metricName] = score;
              metrics.debug.foundPatterns.push(`${metricName}: ${pattern.toString()}`);
              break;
            }
          }
        }
      }

      // Buscar Core Web Vitals con múltiples patrones
      const vitalPatterns = {
        lcp: [/LCP[^0-9]*([0-9.]+)/i, /largest.*?contentful.*?paint[^0-9]*([0-9.]+)/i],
        fid: [/FID[^0-9]*([0-9.]+)/i, /first.*?input.*?delay[^0-9]*([0-9.]+)/i],
        cls: [/CLS[^0-9]*([0-9.]+)/i, /cumulative.*?layout.*?shift[^0-9]*([0-9.]+)/i],
        fcp: [/FCP[^0-9]*([0-9.]+)/i, /first.*?contentful.*?paint[^0-9]*([0-9.]+)/i],
        tti: [/TTI[^0-9]*([0-9.]+)/i, /time.*?to.*?interactive[^0-9]*([0-9.]+)/i]
      };

      for (const [vitalName, vitalPatternList] of Object.entries(vitalPatterns)) {
        for (const pattern of vitalPatternList) {
          const match = html.match(pattern);
          if (match && !metrics.coreWebVitals[vitalName]) {
            metrics.coreWebVitals[vitalName] = parseFloat(match[1]);
            metrics.debug.foundPatterns.push(`${vitalName}: ${pattern.toString()}`);
            break;
          }
        }
      }

      // Buscar scores en formato JSON (más confiable)
      const jsonMatches = html.match(/"score":\s*([0-9.]+)/g);
      if (jsonMatches && jsonMatches.length >= 4) {
        const scores = jsonMatches.map(match => parseFloat(match.match(/([0-9.]+)/)[1]) * 100);
        if (!metrics.performance && scores[0]) metrics.performance = Math.round(scores[0]);
        if (!metrics.accessibility && scores[1]) metrics.accessibility = Math.round(scores[1]);
        if (!metrics.bestPractices && scores[2]) metrics.bestPractices = Math.round(scores[2]);
        if (!metrics.seo && scores[3]) metrics.seo = Math.round(scores[3]);
        metrics.debug.foundPatterns.push('JSON scores extracted');
      }

      metrics.extracted = true;

    } catch (error) {
      console.warn(`⚠️  No se pudieron extraer todas las métricas: ${error.message}`);
      metrics.debug.error = error.message;
    }

    return metrics;
  }
  
  /**
   * Guardar reporte en archivo
   */
  async saveReport(report, filename = null) {
    await fs.mkdir(CONFIG.REPORTS_DIR, { recursive: true });
    
    if (!filename) {
      const urlKey = report.urlKey || 'unknown';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `${urlKey}-${report.formFactor}-${timestamp}.json`;
    }
    
    const filepath = path.join(CONFIG.REPORTS_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    console.log(`💾 Reporte guardado: ${filepath}`);
    return filepath;
  }
  
  /**
   * Esperar con indicador de progreso
   */
  async waitWithProgress(ms) {
    const totalSteps = 10;
    const stepTime = ms / totalSteps;
    
    for (let i = 0; i < totalSteps; i++) {
      const progress = Math.round((i / totalSteps) * 100);
      const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
      process.stdout.write(`\r⏳ Progreso: [${progressBar}] ${progress}%`);
      await this.sleep(stepTime);
    }
    process.stdout.write(`\r⏳ Progreso: [${'█'.repeat(10)}] 100%\n`);
  }
  
  /**
   * Función sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Funciones de utilidad para CLI
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: null,
    urls: [],
    predefined: null,
    formFactor: CONFIG.FORM_FACTORS.DESKTOP,
    apiKey: null,
    save: false,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--url':
        options.url = args[++i];
        break;
      case '--urls':
        options.urls = args[++i].split(',');
        break;
      case '--predefined':
        options.predefined = args[++i] ? args[i].split(',') : Object.keys(PREDEFINED_URLS);
        break;
      case '--mobile':
        options.formFactor = CONFIG.FORM_FACTORS.MOBILE;
        break;
      case '--desktop':
        options.formFactor = CONFIG.FORM_FACTORS.DESKTOP;
        break;
      case '--api-key':
        options.apiKey = args[++i];
        break;
      case '--save':
        options.save = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
🚀 PageSpeed Insights Analyzer

USAGE:
  node scripts/pagespeed-analyzer.js [options]

OPTIONS:
  --url <url>              Analizar una URL específica
  --urls <url1,url2,...>   Analizar múltiples URLs (separadas por comas)
  --predefined [keys]      Analizar URLs predefinidas (opcional: keys específicas)
  --mobile                 Analizar en modo mobile (default: desktop)
  --desktop                Analizar en modo desktop
  --api-key <key>          Clave de API personalizada (default: ps42rq6fq8)
  --save                   Guardar reportes en archivos JSON
  --help, -h               Mostrar esta ayuda

URLS PREDEFINIDAS:
${Object.entries(PREDEFINED_URLS).map(([key, url]) => `  ${key.padEnd(20)} ${url}`).join('\n')}

EJEMPLOS:
  # Analizar homepage
  npm run pagespeed -- --url https://cappato.dev

  # Analizar todas las URLs predefinidas en mobile
  npm run pagespeed -- --predefined --mobile --save

  # Analizar URLs específicas
  npm run pagespeed -- --predefined homepage,blog --desktop

  # Analizar múltiples URLs custom
  npm run pagespeed -- --urls "https://example.com,https://example.com/about"
`);
}

/**
 * Función principal
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  const analyzer = new PageSpeedAnalyzer();
  let results = [];
  
  try {
    if (options.url) {
      // Analizar URL única
      const result = await analyzer.analyzeUrl(options.url, options.formFactor, options.apiKey);
      results = [result];
      
    } else if (options.urls.length > 0) {
      // Analizar múltiples URLs
      results = await analyzer.analyzeMultipleUrls(options.urls, options.formFactor, options.apiKey);
      
    } else if (options.predefined !== null) {
      // Analizar URLs predefinidas
      results = await analyzer.analyzePredefinedUrls(options.predefined, options.formFactor, options.apiKey);
      
    } else {
      // Default: analizar homepage
      console.log('🎯 No se especificó URL, analizando homepage por defecto...');
      const result = await analyzer.analyzeUrl(PREDEFINED_URLS.homepage, options.formFactor, options.apiKey);
      results = [result];
    }
    
    // Mostrar resumen
    console.log('\n📊 RESUMEN DE RESULTADOS:');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.urlKey || result.url} (${result.formFactor})`);
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      } else if (result.metrics.extracted) {
        console.log(`   🎯 Performance: ${result.metrics.performance || 'N/A'}`);
        console.log(`   ♿ Accessibility: ${result.metrics.accessibility || 'N/A'}`);
        console.log(`   ✅ Best Practices: ${result.metrics.bestPractices || 'N/A'}`);
        console.log(`   🔍 SEO: ${result.metrics.seo || 'N/A'}`);
      } else {
        console.log(`   ⚠️  Métricas no extraídas (análisis puede estar incompleto)`);
      }
    });
    
    // Guardar reportes si se solicita
    if (options.save) {
      console.log('\n💾 Guardando reportes...');
      for (const result of results) {
        await analyzer.saveReport(result);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PageSpeedAnalyzer, CONFIG, PREDEFINED_URLS };

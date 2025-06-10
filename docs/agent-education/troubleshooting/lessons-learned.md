# 📚 Lecciones Principales

**Documento**: 4.2 - IMPORTANTE  
**Propósito**: Lecciones principales aprendidas del proyecto para evitar errores pasados

---

## **🎯 Lecciones Críticas de Git y PRs**

### **Lección 1: Tamaños de PR**
**Problema**: PRs grandes (>300 líneas) causan problemas de auto-merge
**Solución**: Dividir en micro-PRs de <300 líneas cada uno
**Aplicación**: Siempre verificar tamaño antes de crear PR

### **Lección 2: Actualización desde Main**
**Problema**: Trabajar en branches desactualizadas causa conflictos
**Solución**: SIEMPRE `git pull origin main` antes de crear nueva branch
**Aplicación**: Hacer parte del workflow estándar

### **Lección 3: Configuración Git**
**Problema**: Editores interactivos bloquean automation
**Solución**: `git config --global core.editor "true"`
**Aplicación**: Configurar en setup inicial

---

## **🧪 Lecciones de Testing**

### **Lección 4: Testing por Tiers**
**Problema**: Tests lentos bloquean desarrollo
**Solución**: Tier 1 (<15s) bloquea merge, Tier 2-3 son informativos
**Aplicación**: Diseñar tests con tiempo en mente

### **Lección 5: Validación Pre-PR**
**Problema**: PRs fallan en CI por errores evitables
**Solución**: `npm run validate:pr` OBLIGATORIO antes de crear PR
**Aplicación**: Nunca saltarse validación local

### **Lección 6: Tests de Imágenes**
**Problema**: Tests fallan por imágenes faltantes o mal optimizadas
**Solución**: `npm run test:blog:images` antes de commits con imágenes
**Aplicación**: Validar imágenes como parte del workflow

---

## **📝 Lecciones de Documentación**

### **Lección 7: Documentación Fragmentada**
**Problema**: Información dispersa en múltiples archivos
**Solución**: Sistema de navegación numerado (1.1-4.3)
**Aplicación**: Usar sistema de menús para organizar docs

### **Lección 8: Comandos Fantasma**
**Problema**: Documentar comandos npm que no existen
**Solución**: Verificar package.json antes de documentar
**Aplicación**: Validación cruzada scripts vs documentación

### **Lección 9: Ejemplos Genéricos**
**Problema**: Ejemplos inventados no ayudan
**Solución**: Usar siempre ejemplos reales del proyecto
**Aplicación**: Extraer ejemplos del código actual

---

## **🚀 Lecciones de Deployment**

### **Lección 10: Node.js Version**
**Problema**: CI falla con versiones incorrectas de Node.js
**Solución**: Usar Node.js 20 específicamente
**Aplicación**: Verificar versión en CI y local

### **Lección 11: Build Failures**
**Problema**: Builds fallan por dependencias o configuración
**Solución**: `npm run build` local antes de push
**Aplicación**: Incluir en checklist pre-PR

### **Lección 12: Environment Variables**
**Problema**: Deployment falla por variables faltantes
**Solución**: Documentar todas las variables requeridas
**Aplicación**: Checklist de variables en deployment docs

---

## **🎨 Lecciones de Estándares**

### **Lección 13: Política de Emojis**
**Problema**: Emojis en código causan problemas de accesibilidad
**Solución**: Permitir solo en docs/scripts, prohibir en código
**Aplicación**: `npm run validate:emoji` en CI

### **Lección 14: Conventional Commits**
**Problema**: Commits inconsistentes dificultan tracking
**Solución**: Formato estricto `type(scope): description`
**Aplicación**: Validar formato en git hooks

### **Lección 15: Idiomas Mezclados**
**Problema**: Mezclar español/inglés inconsistentemente
**Solución**: Español para docs, inglés para código
**Aplicación**: Revisar idioma en code reviews

---

## **⚡ Lecciones de Performance**

### **Lección 16: Core Web Vitals**
**Problema**: Performance se degrada sin monitoreo
**Solución**: `npm run pagespeed` regular y métricas objetivo
**Aplicación**: Incluir en testing de features grandes

### **Lección 17: Bundle Size**
**Problema**: JavaScript bundle crece sin control
**Solución**: Límites estrictos y tree shaking
**Aplicación**: Monitorear en cada PR

### **Lección 18: Image Optimization**
**Problema**: Imágenes no optimizadas afectan LCP
**Solución**: WebP/AVIF automático y lazy loading
**Aplicación**: `npm run optimize-images` en workflow

---

## **🤖 Lecciones Multi-Agente**

### **Lección 19: Identidad Consistente**
**Problema**: Inconsistencias en nombres de agentes
**Solución**: Siempre "ganzo" lowercase, sin brackets
**Aplicación**: Configurar Git identity automáticamente

### **Lección 20: Estado de Agentes**
**Problema**: Asumir que agentes tienen memoria persistente
**Solución**: Agentes solo activos cuando son llamados
**Aplicación**: Documentar comportamiento claramente

### **Lección 21: Atribución de Trabajo**
**Problema**: Confusión sobre autoría de commits
**Solución**: Todo se atribuye únicamente a mcappato
**Aplicación**: Sin referencias a IA en commits públicos

---

## **📊 Lecciones de SEO**

### **Lección 22: Meta Descriptions**
**Problema**: Meta descriptions muy largas o faltantes
**Solución**: Límite estricto de 160 caracteres
**Aplicación**: Validar en `npm run test:seo`

### **Lección 23: Structured Data**
**Problema**: Schema markup incorrecto o faltante
**Solución**: Templates automáticos para blog posts
**Aplicación**: Generar automáticamente en layouts

### **Lección 24: Internal Linking**
**Problema**: Oportunidades de linking interno perdidas
**Solución**: Sistema de related posts automático
**Aplicación**: Algoritmo basado en tags comunes

---

## **🔧 Lecciones de Automation**

### **Lección 25: Scripts Complejos**
**Problema**: Scripts de automation muy complejos fallan
**Solución**: Dividir en pasos simples y verificables
**Aplicación**: Cada script debe tener fallback manual

### **Lección 26: Error Handling**
**Problema**: Scripts fallan silenciosamente
**Solución**: Logging detallado y exit codes claros
**Aplicación**: Verificar resultados de automation

### **Lección 27: Dependencies**
**Problema**: Scripts dependen de herramientas no instaladas
**Solución**: Verificar dependencias antes de ejecutar
**Aplicación**: Checks de prerequisitos en scripts

---

## **📋 Lecciones de Workflow**

### **Lección 28: Micro-PRs vs Features**
**Problema**: Dividir features lógicas en PRs muy pequeños
**Solución**: Balancear coherencia lógica vs tamaño
**Aplicación**: Dividir por funcionalidad, no por líneas

### **Lección 29: Review Process**
**Problema**: Auto-merge sin review humano ocasional
**Solución**: Review manual para cambios arquitectónicos
**Aplicación**: Marcar PRs complejos para review

### **Lección 30: Rollback Strategy**
**Problema**: Dificultad para revertir cambios problemáticos
**Solución**: Commits atómicos y tags de release
**Aplicación**: Facilitar rollback rápido

---

## **🎯 Aplicación de Lecciones**

### **En Onboarding**
- ✅ Incluir lecciones críticas en documentos 1.1-1.3
- ✅ Hacer referencia a lecciones en workflows
- ✅ Actualizar estándares basado en lecciones

### **En Desarrollo**
- ✅ Consultar lecciones antes de tareas similares
- ✅ Aplicar soluciones probadas
- ✅ Evitar repetir errores documentados

### **En Troubleshooting**
- ✅ Buscar lecciones relacionadas primero
- ✅ Documentar nuevas lecciones cuando se resuelven problemas
- ✅ Actualizar lecciones existentes con nueva información

---

## **🔄 Mantenimiento de Lecciones**

### **Actualización Regular**
- ✅ Revisar lecciones cada 3 meses
- ✅ Actualizar con nueva experiencia
- ✅ Eliminar lecciones obsoletas
- ✅ Consolidar lecciones relacionadas

### **Integración con Sistema**
- ✅ Referencias cruzadas con documentos 4.1 y 4.3
- ✅ Comandos npm para acceso rápido
- ✅ Búsqueda por keywords
- ✅ Categorización por tipo de problema

---

## **📚 Acceso Rápido**

### **Comandos Relacionados**
```bash
npm run lessons:search "git conflicts"    # Buscar lecciones específicas
npm run lessons:list --category=git      # Lecciones por categoría
npm run lessons:new --from-issue         # Crear lección desde problema
```

### **Referencias**
- **[4.1 Common Issues](./common-issues.md)** - Problemas frecuentes actuales
- **[4.3 Lessons System](./lessons-system.md)** - Sistema completo de lecciones
- **[/docs/lessons-learned/](../../lessons-learned/README.md)** - Sistema completo preservado

---

**Estas lecciones representan conocimiento colectivo crítico para evitar repetir errores y mejorar continuamente el proyecto.**

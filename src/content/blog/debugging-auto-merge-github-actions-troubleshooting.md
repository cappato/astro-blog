---
title: "Debugging Auto-merge en GitHub Actions: Guía Completa de Troubleshooting"
description: "Aprende a debuggear y solucionar problemas comunes de auto-merge en GitHub Actions. Guía paso a paso con ejemplos reales y troubleshooting."
date: "2025-06-05"
author: "Matías Cappato"
tags: ["github-actions", "auto-merge", "ci-cd", "troubleshooting", "debugging", "workflow", "automation", "devops"]
postId: "debugging-auto-merge-github-actions-troubleshooting"
imageAlt: "Debugging Auto-merge en GitHub Actions: Guía Completa de Troubleshooting - Guía completa"
---

## TL;DR

El auto-merge en GitHub Actions puede fallar por condiciones restrictivas, errores de payload o problemas de timing. Esta guía te enseña a identificar y resolver los errores más comunes paso a paso.

## El Problema

El auto-merge en GitHub Actions es una funcionalidad poderosa, pero puede fallar de formas frustrantes:

- **Jobs que se skipean** sin razón aparente
- **Errores de `undefined`** al acceder a propiedades del payload
- **Workflows que se ejecutan** pero no mergean PRs
- **Timing issues** entre checks y auto-merge

## Diagnóstico Paso a Paso

### 1. Identificar si el Job se Está Skipeando

**Síntoma**: El auto-merge aparece como "skipped" en lugar de ejecutarse.

**Causa común**: Condiciones demasiado restrictivas en el workflow.

```yaml
auto-merge:
  if: github.event_name == 'pull_request' && github.event.action == 'opened' && contains(github.event.label.name, 'auto-merge')
```

**Solución**: Simplificar las condiciones y dejar que el script maneje la lógica.

```yaml
auto-merge:
  if: github.event_name == 'pull_request' || github.event_name == 'check_run' || github.event_name == 'check_suite'
```

### 2. Resolver Errores de `Cannot read properties of undefined`

**Síntoma**: Error `TypeError: Cannot read properties of undefined (reading 'title')`.

**Causa**: El workflow se ejecuta en eventos donde `context.payload.pull_request` no existe.

**Solución**: Agregar validaciones robustas en el script.

```javascript
// Validación robusta
if (context.eventName !== 'pull_request') {
  console.log(`Event is ${context.eventName}, not pull_request. Skipping validation.`);
  return;
}

if (!context.payload || !context.payload.pull_request) {
  console.log('No pull_request in payload, skipping validation');
  return;
}

if (!context.payload.pull_request.title) {
  console.log('No title in pull_request, skipping validation');
  return;
}

const title = context.payload.pull_request.title.trim();
```

### 3. Configurar Triggers Reactivos

**Problema**: El auto-merge solo se ejecuta cuando se abre el PR, no cuando los checks terminan.

**Solución**: Agregar triggers para eventos de checks.

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled]
  check_run:
    types: [completed]
  check_suite:
    types: [completed]
  workflow_dispatch:
```

### 4. Debugging con Logs Detallados

**Técnica**: Agregar logs detallados para entender qué está pasando.

```javascript
console.log('Debug Info:');
console.log('Event name:', context.eventName);
console.log('Event action:', context.payload.action);
console.log('PR state:', context.payload.pull_request?.state);
console.log('PR mergeable:', context.payload.pull_request?.mergeable);
console.log('Checks status:', context.payload.check_run?.conclusion);
```

## Troubleshooting Común

### Error: Auto-merge se ejecuta pero no mergea

**Diagnóstico**: El script se ejecuta exitosamente pero el PR sigue abierto.

**Posibles causas**:
1. **Permisos insuficientes** del token de GitHub
2. **Checks pendientes** que bloquean el merge
3. **Lógica interna** del script que decide no mergear

**Solución**: Usar el auto-merge nativo de GitHub como fallback.

```bash
gh pr merge $PR_NUMBER --auto --squash
```

### Error: Workflow se ejecuta múltiples veces

**Causa**: Múltiples triggers activándose simultáneamente.

**Solución**: Agregar lógica de deduplicación.

```javascript
// Evitar ejecuciones duplicadas
const runId = process.env.GITHUB_RUN_ID;
console.log(`Run ID: ${runId} - Event: ${context.eventName}`);
```

### Error: Timing issues con checks

**Problema**: El auto-merge se ejecuta antes de que terminen todos los checks.

**Solución**: Validar estado de checks antes de mergear.

```javascript
// Verificar que todos los checks hayan pasado
const checks = await github.rest.checks.listForRef({
  owner: context.repo.owner,
  repo: context.repo.repo,
  ref: context.payload.pull_request.head.sha
});

const allPassed = checks.data.check_runs.every(check =>
  check.conclusion === 'success' || check.conclusion === 'neutral'
);
```

## Solución Definitiva: Workflow Robusto

Basado en la experiencia real, aquí está un workflow que funciona:

```yaml
name: PR Automation
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled]
  check_run:
    types: [completed]
  check_suite:
    types: [completed]

jobs:
  pr-validation:
    name: PR Validation
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.pull_request && github.event.pull_request.draft == false

    steps:
    - name: Validate PR Title
      uses: actions/github-script@v7
      with:
        script: |
          // Múltiples validaciones de seguridad
          if (context.eventName !== 'pull_request') {
            console.log(`Event is ${context.eventName}, not pull_request. Skipping.`);
            return;
          }

          if (!context.payload?.pull_request?.title) {
            console.log('No title in pull_request, skipping validation');
            return;
          }

          const title = context.payload.pull_request.title.trim();
          const validPrefixes = ['feat:', 'fix:', 'docs:', 'style:', 'refactor:', 'test:', 'chore:'];

          if (!validPrefixes.some(prefix => title.toLowerCase().startsWith(prefix))) {
            core.setFailed(`PR title must start with: ${validPrefixes.join(', ')}`);
          }

  auto-merge:
    name: Auto Merge
    runs-on: ubuntu-latest
    needs: [pr-validation]
    if: always() && !cancelled()

    steps:
    - name: Auto Merge PR
      uses: actions/github-script@v7
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        script: |
          // Lógica simplificada - dejar que el script decida
          if (context.eventName === 'pull_request' &&
              context.payload.pull_request &&
              context.payload.pull_request.labels.some(label => label.name === 'auto-merge')) {

            try {
              await github.rest.pulls.merge({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: context.payload.pull_request.number,
                merge_method: 'squash'
              });
              console.log('PR merged successfully');
            } catch (error) {
              console.log('Merge failed:', error.message);
            }
          }
```

## Lecciones Aprendidas

1. **Simplicidad sobre complejidad**: Condiciones simples en el workflow, lógica compleja en el script
2. **Validaciones robustas**: Siempre verificar que los objetos existen antes de acceder a sus propiedades
3. **Triggers reactivos**: Incluir `check_run` y `check_suite` para reactividad completa
4. **Fallback nativo**: GitHub's auto-merge nativo es más confiable para casos complejos
5. **Logs detallados**: Fundamentales para debugging en producción

## Herramientas de Debugging

```bash
gh run list --workflow=pr-automation.yml

gh run view RUN_ID --log

gh pr checks PR_NUMBER

gh pr merge PR_NUMBER --auto --squash
```

---

**¿Te ha resultado útil esta guía?** ¡Compártela y déjanos tus comentarios!
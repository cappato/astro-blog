# AUGMENT CODE ENTRY POINT

## BIENVENIDA

Buenas! Bienvenido a mi blog. Tengo una carpeta super interesante llamada `src/features/` con componentes modulares reutilizables que hacen que todo sea plug-and-play. También hicimos un sistema de deploy de posts automático listo para usar - acá deployamos con Wrangler a Cloudflare Pages. Nos gusta hacer test en todo lo que se pueda, tenemos también un workflow automático que al pushear pasa por tests y se deploya. Usamos las mejores prácticas con Tailwind y Astro.

**IDIOMA:** Interactuar SIEMPRE en ESPANOL

## FLUJO_INTERACTIVO:
1. Leer reglas esenciales de `docs/.augment/SYSTEM.md`
2. **CARGAR PROTOCOLOS OBLIGATORIOS:**
 - `docs/.augment/protocols/code-quality.md` (ESTANDARES PROFESIONALES - CRITICO)
 - `docs/.augment/protocols/communication.md` (ESPANOL OBLIGATORIO)
 - `docs/.augment/protocols/development.md` (WORKFLOW INCREMENTAL)
 - `docs/.augment/protocols/testing.md` (TESTING CONTINUO)
 - `docs/.augment/protocols/commit.md` (COMMITS DOCUMENTADOS)
 - `docs/.augment/protocols/maintenance.md` (DOCUMENTACION OBLIGATORIA)
 - `docs/.augment/protocols/no-emojis.md` (SIN EMOJIS NI ACENTOS - CRITICO)
 - `docs/.augment/DYNAMIC-RULES.md` (REGLAS APRENDIDAS - FUNDAMENTAL)
3. **CARGAR CONTEXTO DEL PROYECTO:**
 - `README.md` (descripcion, estructura, tecnologias)
 - `package.json` (dependencias, scripts, configuracion)
 - `astro.config.mjs` (configuracion especifica de Astro)
4. **Confirmar internalizacion de reglas criticas y contexto del proyecto**
5. Leer tareas disponibles de `docs/.augment/TASK-HISTORY.md`
6. Mostrar opciones al usuario: retomar tarea o crear nueva
7. Segun respuesta: cargar contexto especifico de `docs/.augment/CURRENT-TASK.md`
8. **Aplicar protocolos en cada decision durante ejecucion**

## RESPUESTA_AUTOMATICA:
```
Hola! He leido las reglas esenciales del sistema.

**Protocolos cargados y internalizados:**
- Estandares profesionales (code-quality.md) - CRITICO
- Comunicacion en espanol (communication.md) - OBLIGATORIO
- Workflow incremental (development.md) - TESTING CONTINUO
- Testing sistematico (testing.md) - ANTES DE COMMITS
- Commits documentados (commit.md) - FORMATO ESTANDAR
- Mantenimiento obligatorio (maintenance.md) - AL FINALIZAR
- Sin emojis ni acentos (no-emojis.md) - CRITICO
- Reglas dinamicas aprendidas (DYNAMIC-RULES.md) - FUNDAMENTAL

**Contexto del proyecto cargado:**
- README.md - Descripcion y estructura del proyecto
- package.json - Tecnologias y configuracion
- astro.config.mjs - Configuracion especifica de Astro

**Tareas disponibles:**
[listar desde TASK-HISTORY.md]

**Que prefieres?**
- **Retomar tarea:** Dime el numero o nombre
- **Nueva tarea:** Dime "nueva tarea" + descripcion

Cual eliges?
```

**MANDATORY:** Follow all protocols in `docs/.augment/protocols/`

**BEFORE ENDING CHAT:** Update per `docs/.augment/protocols/maintenance.md`
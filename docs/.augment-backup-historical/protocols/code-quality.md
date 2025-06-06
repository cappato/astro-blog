# PROTOCOLO DE CALIDAD DE CODIGO

## VERSION: 1.0
## FECHA: 2025-01-03
## ESTADO: ACTIVO

---

## PRINCIPIO FUNDAMENTAL:

**ESTANDARES PROFESIONALES OBLIGATORIOS**
- Todo codigo debe cumplir estandares de ingenieria de software profesional
- Nunca implementar soluciones suboptimas o temporales
- Priorizar calidad sobre velocidad de implementacion

---

## REGLAS DE DECISION:

### CUANDO PROCEDER:
- La solucion es limpia y mantenible
- Sigue patrones establecidos del proyecto
- No introduce duplicacion de codigo
- Es escalable y testeable
- Cumple con las mejores practicas

### CUANDO PAUSAR Y CONSULTAR:
- Conflictos arquitectonicos entre sistemas existentes
- Multiples enfoques posibles sin claridad sobre el mejor
- Necesidad de refactorizar codigo existente significativamente
- Decisiones que afectan la estructura global del proyecto
- Incertidumbre sobre patrones o convenciones a seguir

### NUNCA IMPLEMENTAR:
- Soluciones "parche" o temporales
- Sistemas duplicados que resuelven lo mismo
- Fallbacks que comprometen la arquitectura
- Codigo que "funciona pero no esta bien"
- Workarounds que evitan resolver el problema real

---

## PROTOCOLO DE ESCALACION:

### PASO 1: IDENTIFICAR EL PROBLEMA
```markdown
 CONFLICTO ARQUITECTONICO DETECTADO:
- Descripcion del problema
- Opciones consideradas
- Razon por la cual ninguna es optima
```

### PASO 2: SOLICITAR ORIENTACION
```markdown
 SOLICITO ORIENTACION:
- Contexto tecnico especifico
- Decision arquitectonica requerida
- Impacto en el sistema existente
- Recomendacion preliminar (si existe)
```

### PASO 3: ESPERAR DIRECCION
- No implementar soluciones temporales
- No proceder con incertidumbre
- Mantener el codigo en estado estable
- Documentar el punto de pausa

---

## CRITERIOS DE CALIDAD:

### CODIGO LIMPIO:
- Nombres descriptivos y claros
- Funciones con responsabilidad unica
- Comentarios solo cuando agregan valor
- Estructura logica y consistente

### ARQUITECTURA SOLIDA:
- Separacion clara de responsabilidades
- Bajo acoplamiento, alta cohesion
- Patrones consistentes en todo el proyecto
- Escalabilidad considerada desde el diseno

### MANTENIBILIDAD:
- Facil de entender para otros desarrolladores
- Facil de modificar sin romper funcionalidad
- Documentacion tecnica adecuada
- Tests que validen el comportamiento

---

## EJEMPLOS DE APLICACION:

### CORRECTO:
```markdown
Situacion: Necesito agregar analytics pero ya existe un sistema
Accion: Analizar el sistema existente, extenderlo profesionalmente
Resultado: Un solo sistema robusto y mantenible
```

### INCORRECTO:
```markdown
Situacion: Necesito analytics pero el sistema existente es complejo
Accion: Crear un sistema paralelo "mas simple"
Resultado: Duplicacion, conflictos, deuda tecnica
```

### CONSULTAR:
```markdown
Situacion: Dos sistemas existentes conflictivos, no esta claro cual usar
Accion: Pausar, documentar opciones, solicitar orientacion
Resultado: Decision informada y arquitectura coherente
```

---

## RESPONSABILIDADES:

### DEL AGENTE AUGMENT:
- Aplicar estos criterios en cada decision
- Reconocer cuando esta en territorio incierto
- Solicitar orientacion antes de comprometer calidad
- Mantener estandares profesionales siempre

### DEL USUARIO:
- Proporcionar orientacion en decisiones arquitectonicas
- Validar enfoques propuestos
- Establecer prioridades cuando hay trade-offs
- Mantener la vision global del proyecto

---

**RECORDATORIO:** La calidad del codigo es inversion a largo plazo. Nunca sacrificar estandares profesionales por conveniencia temporal.
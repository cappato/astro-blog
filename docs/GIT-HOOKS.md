# Git Hooks - Protección de Branch Main

## 🎯 Objetivo

Prevenir push directo a `main` para mantener el workflow de PRs y auto-merge consistente.

## 🔧 Instalación

### Automática (Recomendada)
```bash
npm run setup:hooks
```

### Manual
```bash
bash scripts/install-git-hooks.sh
```

## 📋 Hooks Activos

### Pre-push Hook
- **Función**: Bloquea push directo a `main`
- **Ubicación**: `.githooks/pre-push`
- **Trigger**: Antes de cada `git push`

## 🚀 Workflow Recomendado

```bash
# 1. Crear rama para cambios
git checkout -b feature/mi-cambio

# 2. Hacer cambios y commit
git add .
git commit -m "feat: mi cambio"

# 3. Push de la rama
git push origin feature/mi-cambio

# 4. Crear PR con auto-merge
gh pr create --label auto-merge
```

## 🚨 Emergencias

Si necesitas hacer push directo a `main` (usar con cuidado):

```bash
git push --no-verify origin main
```

## 🔧 Gestión de Hooks

### Desinstalar
```bash
git config --unset core.hooksPath
```

### Verificar estado
```bash
git config core.hooksPath
```

### Reinstalar
```bash
npm run setup:hooks
```

## ✅ Beneficios

- ✅ **Consistencia**: Todos los cambios pasan por PRs
- ✅ **Validación**: Tests y checks siempre se ejecutan
- ✅ **Auto-merge**: Workflow predecible y automático
- ✅ **Calidad**: Previene errores en `main`

## 🔍 Troubleshooting

### Hook no se ejecuta
```bash
# Verificar permisos
ls -la .githooks/pre-push

# Reinstalar
npm run setup:hooks
```

### Saltear temporalmente
```bash
git push --no-verify origin main
```

# 🛠️ Stack Técnico

**Documento**: 1.3 - IMPORTANTE  
**Propósito**: Descripción completa del stack técnico y arquitectura del proyecto

---

## **🏗️ Stack Principal**

### **Framework Core**
- **Astro 5.8.0**: Framework principal con arquitectura de islas
- **TypeScript**: Lenguaje principal en strict mode
- **Node.js 20**: Runtime requerido para CI/deployment

### **Styling**
- **Tailwind CSS**: Framework utility-first para estilos
- **CSS Modules**: Para componentes específicos
- **PostCSS**: Procesamiento de CSS

### **Deployment**
- **Cloudflare Pages**: Hosting y CDN
- **Wrangler**: CLI para deployment
- **GitHub Actions**: CI/CD pipeline

---

## **📦 Dependencias Principales**

### **Core Dependencies**
```json
{
  "@astrojs/tailwind": "^5.1.2",
  "@astrojs/typescript": "^1.0.0",
  "astro": "^5.8.0",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.6.0"
}
```

### **Development Tools**
```json
{
  "vitest": "^2.1.0",
  "@types/node": "^22.0.0",
  "eslint": "^9.0.0",
  "prettier": "^3.0.0"
}
```

---

## **🏛️ Arquitectura del Proyecto**

### **Estructura de Directorios**
```
astro-blog-ganzo/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── layouts/        # Layouts de página
│   ├── pages/          # Páginas del sitio
│   ├── content/        # Content collections
│   ├── utils/          # Utilidades y helpers
│   ├── types/          # Definiciones TypeScript
│   └── styles/         # Estilos globales
├── public/             # Assets estáticos
├── docs/               # Documentación del proyecto
├── scripts/            # Scripts de automatización
└── tests/              # Tests del proyecto
```

### **Content Collections**
```typescript
// src/content/config.ts
export const collections = {
  blog: defineCollection({
    type: 'content',
    schema: blogSchema,
  }),
  lessons: defineCollection({
    type: 'content', 
    schema: lessonSchema,
  }),
};
```

---

## **🎨 Sistema de Diseño**

### **Tailwind Configuration**
```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#...',
        secondary: '#...',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

### **Responsive Design**
- **Mobile First**: Diseño optimizado para móvil
- **Breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Performance**: Critical CSS inline, lazy loading

---

## **🧪 Testing Stack**

### **Testing Framework**
- **Vitest**: Framework de testing principal
- **Testing Library**: Para testing de componentes
- **Playwright**: Tests end-to-end (futuro)

### **Testing Strategy**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
```

---

## **🔧 Build System**

### **Astro Configuration**
```typescript
// astro.config.mjs
export default defineConfig({
  integrations: [
    tailwind(),
    typescript(),
  ],
  output: 'static',
  site: 'https://cappato.dev',
  build: {
    assets: 'assets',
  },
});
```

### **Build Optimization**
- **Tree Shaking**: Eliminación de código no usado
- **Code Splitting**: División automática de bundles
- **Asset Optimization**: Compresión de imágenes y assets
- **Critical CSS**: CSS crítico inline

---

## **📊 Performance Monitoring**

### **Core Web Vitals**
- **LCP**: Largest Contentful Paint < 2.5s
- **FID**: First Input Delay < 100ms
- **CLS**: Cumulative Layout Shift < 0.1

### **Monitoring Tools**
```bash
npm run pagespeed        # PageSpeed Insights
npm run pagespeed:mobile # Mobile performance
npm run lighthouse       # Lighthouse audit
```

---

## **🔒 Security & Best Practices**

### **Security Headers**
```typescript
// Cloudflare Pages configuration
export const headers = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
};
```

### **Environment Variables**
```bash
# .env.example
SITE_URL=https://cappato.dev
ANALYTICS_ID=your_analytics_id
```

---

## **🚀 Deployment Pipeline**

### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

### **Deployment Commands**
```bash
npm run build           # Build para producción
npm run preview         # Preview local del build
npm run deploy          # Deploy a Cloudflare Pages
```

---

## **📱 Progressive Web App**

### **PWA Features**
- **Service Worker**: Caching estratégico
- **Web Manifest**: Instalación como app
- **Offline Support**: Funcionalidad básica offline

### **Configuration**
```json
// public/manifest.json
{
  "name": "Cappato Dev Blog",
  "short_name": "Cappato",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000"
}
```

---

## **🔍 SEO & Analytics**

### **SEO Optimization**
- **Meta Tags**: Dinámicos por página
- **Structured Data**: JSON-LD schema
- **Sitemap**: Generación automática
- **Robots.txt**: Configuración de crawling

### **Analytics Integration**
```typescript
// src/components/Analytics.astro
---
const { analyticsId } = Astro.props;
---
<script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}></script>
```

---

## **🛠️ Development Tools**

### **Code Quality**
```json
// .eslintrc.json
{
  "extends": ["@astrojs/eslint-config"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

### **Git Hooks**
```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test:unit
```

---

## **📚 Learning Resources**

### **Documentation**
- **Astro Docs**: https://docs.astro.build
- **Tailwind Docs**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

### **Best Practices**
- **Astro Islands**: Hidratación selectiva
- **Performance Budget**: Límites de bundle size
- **Accessibility**: WCAG 2.1 AA compliance

---

**Este stack está optimizado para performance, SEO y developer experience, manteniendo simplicidad y escalabilidad.**

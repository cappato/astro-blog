# TESTING CHECKLIST

## MANDATORY_TESTING_SEQUENCE

### PHASE_1: DEVELOPMENT_TESTING
**FREQUENCY:** After each significant change

#### BASIC_CHECKS:
- [ ] `npm run dev` starts without errors
- [ ] No console errors in browser
- [ ] Hot reload working correctly
- [ ] All pages accessible

#### FUNCTIONALITY_CHECKS:
- [ ] Navigation working
- [ ] Components rendering
- [ ] Styles loading correctly
- [ ] JavaScript functionality intact

---

### PHASE_2: BUILD_TESTING
**FREQUENCY:** Before any commit

#### BUILD_COMMANDS:
```bash
# 1. Clean build
npm run build

# 2. Check build output
ls -la dist/

# 3. Preview build
npm run preview

# 4. Test preview in browser
# Open http://localhost:4321 (or specified port)
```

#### BUILD_VERIFICATION:
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Assets properly generated
- [ ] Preview server starts successfully

---

### PHASE_3: FUNCTIONALITY_TESTING
**FREQUENCY:** Before commit and after major changes

#### CORE_FEATURES_TEST:

##### FOR_ASTRO_ADVANCED_STARTER:
- [ ] **Meta Tags:** View source, verify meta tags present
- [ ] **Schema:** Check JSON-LD in page source
- [ ] **Sitemap:** Visit /sitemap.xml, verify structure
- [ ] **Performance:** Lighthouse score > 90
- [ ] **Images:** Verify optimization and lazy loading
- [ ] **Social Share:** Test share buttons functionality
- [ ] **Dark Mode:** Toggle works, persists on reload

##### FOR_ESTILO_SUSHI:
- [ ] **WhatsApp Integration:** All buttons generate correct URLs
- [ ] **Menu Filters:** Category filtering works correctly
- [ ] **Banner System:** Discount banner displays and functions
- [ ] **Responsive Design:** Mobile, tablet, desktop layouts
- [ ] **Page Navigation:** All internal links functional
- [ ] **Contact Forms:** Form submission works (if applicable)

---

## AUTOMATED_TESTING_COMMANDS:

### QUICK_TEST_SUITE:
```bash
# Development test
npm run dev &
sleep 5
curl -f http://localhost:4321 || echo "Dev server failed"
pkill -f "npm run dev"

# Build test 
npm run build || echo "Build failed"

# Preview test
npm run preview &
sleep 5
curl -f http://localhost:4321 || echo "Preview failed"
pkill -f "npm run preview"
```

---

**TESTING_PROTOCOL_VERSION:** 1.0 
**LAST_UPDATE:** 2025-01-02 
**COMPLIANCE:** MANDATORY_BEFORE_COMMIT
este modulo de autor tiene mucho espacio en blanco por debajo de la imagen comom una columna vacia, sobretodo en movil queda peor, podrias hacer magia y cambiar la estructura para que se vea mucho mejor, podes tomar como ejemplo esto para darle mas flexibiad al modulo de autor?
<div class="card-base p-4 sm:p-6 author-extended">
  <div class="flex flex-col sm:flex-row sm:items-start sm:gap-4">
    <!-- Avatar -->
    <div class="flex justify-center sm:justify-start mb-4 sm:mb-0">
      <div class="rounded-full overflow-hidden border-2 w-24 h-24 sm:w-20 sm:h-20">
        <img src="/images/author/profile.webp" alt="Foto de Matías Sebastián Cappato" class="w-full h-full object-cover" loading="lazy">
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold mb-1 text-center sm:text-left">Matías Sebastián Cappato</h3>
          <p class="text-sm font-medium mb-1 text-center sm:text-left">Full Stack Developer &amp; Tech Lead</p>
          <div class="flex flex-wrap justify-center sm:justify-start gap-3 text-xs">
            <span class="flex items-center gap-1">📍 Argentina</span>
            <span class="flex items-center gap-1">💼 8+ experiencia</span>
          </div>
        </div>

        <!-- Social Links -->
        <div class="flex justify-center sm:justify-end items-center gap-2">
          <a href="https://github.com/cappato" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center" aria-label="GitHub de Matías">🔗</a>
          <a href="https://www.linkedin.com/in/matiascappato/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center" aria-label="LinkedIn de Matías">🔗</a>
          <a href="mailto:matias@cappato.dev" class="w-8 h-8 flex items-center justify-center" aria-label="Email de Matías">📧</a>
        </div>
      </div>

      <!-- Bio -->
      <div class="mb-3 text-sm leading-relaxed text-center sm:text-left">
        Desarrollador Full Stack con más de 8 años de experiencia construyendo aplicaciones web escalables y de alto rendimiento...
      </div>

      <!-- Especialidades -->
      <div class="mb-3">
        <h4 class="text-xs font-semibold tracking-wide mb-2">Especialidades</h4>
        <div class="flex flex-wrap justify-center sm:justify-start gap-1">
          <span class="px-2 py-1 text-xs font-medium bg-gray-100 rounded">TypeScript & JavaScript</span>
          <span class="px-2 py-1 text-xs font-medium bg-gray-100 rounded">React & Next.js</span>
          <span class="px-2 py-1 text-xs font-medium bg-gray-100 rounded">Node.js & Express</span>
          <span class="px-2 py-1 text-xs font-medium bg-gray-100 rounded">Astro & Static Sites</span>
          <span class="px-2 py-1 text-xs font-medium bg-gray-100 rounded">Performance Optimization</span>
        </div>
      </div>

      <!-- Logros -->
      <div class="mb-3">
        <h4 class="text-xs font-semibold tracking-wide mb-2">Logros destacados</h4>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs">
          <li>• Arquitectura para 100k+ usuarios</li>
          <li>• Optimización Core Web Vitals</li>
          <li>• Pipelines CI/CD automatizados</li>
          <li>• Mentoring de equipos</li>
        </ul>
      </div>

      <!-- Stats -->
      <div class="flex justify-center sm:justify-start items-center gap-4 pt-3">
        <div class="text-center">
          <div class="text-lg font-bold">25</div>
          <div class="text-xs">Artículos</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold">50</div>
          <div class="text-xs">Proyectos</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold">8+ años</div>
          <div class="text-xs">Experiencia</div>
        </div>
      </div>
    </div>
  </div>
</div>

el content debe ser el mismo para todas las cards para articulos pilares articulos relacionados todos los pilares pilares destacados etc,

la estructura correcta para articulos o pilares deberia ser esta
lo unico que cambia es la fecha en articulos y la cantidad de articulos en pilares pero tienen el mismo estilo
estructura correcta:
<div class="flex-1 p-4 flex flex-col"> <!-- Header --> <header class="mb-3"> <h3 class="text-lg font-semibold mb-2 line-clamp-2 text-primary"> SEO Automático con TypeScript: Meta Tags y Schema.org </h3> <!-- Meta info --> <div class="flex items-center justify-between text-sm text-muted"> <span class="font-medium"> 2 de junio de 2024 </span> </div> </header> <!-- Description --> <p class="text-secondary mb-4 flex-1 line-clamp-3"> Sistema SEO completo y automático con TypeScript: meta tags inteligentes, Schema.org estructurado y optimización de performance. </p> <!-- Tags --> <div class="flex flex-wrap gap-1 mb-4"> <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#seo </span><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#typescript </span><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#schema.org </span> <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
+2 </span> </div> </div>



ejemplo de estructura incorecta
<div class="flex-1 p-4 flex flex-col"> <!-- Header --> <header class="mb-3"> <h3 class="text-lg font-semibold mb-2 line-clamp-2"> Astro &amp; Performance </h3> <!-- Meta info --> <div class="flex items-center justify-between text-sm text-gray-600"> <span class="font-medium"> 2 artículos </span> </div> </header> <!-- Description --> <div class="mb-4 flex-1"> <p class="text-sm text-gray-600 line-clamp-3">Desarrollo moderno con Astro, optimización de performance y arquitecturas escalables para la web del futuro.</p> </div> <!-- Tags --> <div class="flex flex-wrap gap-1 mb-4"> <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#astro </span><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#performance </span><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#optimization </span> <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
+3 </span> </div> </div>

articulos relacionados, presente en todos los posts, tambien tiene un content incorrecto
<div class="flex-1 p-4 flex flex-col"> <!-- Header --> <header class="mb-3"> <h3 class="text-lg font-semibold mb-2 line-clamp-2"> Dark Mode Perfecto: Anti-flicker y Persistencia con Astro </h3> <!-- Meta info --> <div class="flex items-center gap-3 text-sm text-gray-600"> <time datetime="2024-06-02T00:00:00.000Z"> 2 de junio de 2024 </time> <span> 4 min de lectura </span> </div> </header> <!-- Description --> <div class="mb-4 flex-1"> <p class="text-gray-700 line-clamp-3">Implementa un sistema de dark mode sin flash, con persistencia en localStorage y transiciones suaves usando Astro, CSS variables y TypeScript.</p> </div> <!-- Tags --> <div class="flex flex-wrap gap-1 mb-4"> <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#dark-mode </span><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#astro </span><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
#ssr </span> <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
+2 </span> </div> <!-- Relation reasons (solo en desarrollo) -->  </div>
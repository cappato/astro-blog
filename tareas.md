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


✅ TAREA COMPLETADA:
Pensando como un grupo de ingenieros arquitectos de software con especialidad en blog astro tailwind y buenas practicas modernas, esta cantidad de codigo repetida no deberia unificarse??

SOLUCION IMPLEMENTADA:

**🎯 Prompt para IA especializada (como GPT o Claude):**

---

**Necesito que me ayudes a unificar y reutilizar una estructura común de contenido de tarjeta en un proyecto Astro con Tailwind CSS.** Actualmente tengo múltiples componentes (`PillarCard.astro`, `BlogPostCard.astro`, `RelatedArticleCard.astro`, etc.) que repiten la misma estructura visual para mostrar una card de artículo o pilar. La única diferencia entre ellas es el dato variable (fecha en artículos, cantidad de artículos en pilares, etc.), pero el layout, estilos y jerarquía de contenido son idénticos o deberían serlo.

**Objetivo:**
Extraer la parte común de la estructura (header con título, meta info, descripción, tags) en un solo componente reutilizable (por ejemplo, `CardContent.astro`), que acepte props para los valores variables y se pueda usar dentro de cualquier tipo de tarjeta (`BaseCard`, `RelatedArticleCard`, etc.).

**Alcance:**

* Identificar todos los archivos donde se repite esta estructura.
* Crear un nuevo componente con los slots o props adecuados para recibir:

  * Título
  * Fecha o cantidad de artículos
  * Descripción
  * Lista de tags (clickeables o no)
* Reemplazar la lógica duplicada en cada tipo de card con este nuevo componente reutilizable.
* Garantizar que todos los estilos de texto, espaciados, colores, redondeado y comportamiento de los tags sean consistentes, tanto para `span` como para `a`.
* Asegurar que todos los tags visualmente tengan el mismo diseño aunque algunos sean clickeables y otros no.

**Quiero un paso a paso claro para hacer esta refactorización con buenas prácticas, manteniendo accesibilidad y consistencia visual.**

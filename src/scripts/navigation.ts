document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  initSectionDetection();
});

/**
 * Inicializa el menú móvil
 */
function initMobileMenu(): void {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuButton = document.getElementById('close-menu');
  const mobileMenuLinks = document.querySelectorAll('.nav-link-mobile');

  if (!mobileMenuButton || !mobileMenu || !closeMenuButton) return;

  // Abrir menú
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  });

  // Cerrar menú
  closeMenuButton.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });

  // Cerrar menú al hacer clic en un enlace
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  });
}

/**
 * Inicializa el scroll suave para los enlaces de navegación
 */
function initSmoothScroll(): void {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  const handleSmoothScroll = (e: Event): void => {
    e.preventDefault();
    const target = e.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href');

    if (!href || !href.startsWith('#')) return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const navbarHeight = 80;
      let offset = navbarHeight;

      if (targetId === 'about') {
        offset = navbarHeight + 20;
      }

      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  navLinks.forEach(link => link.addEventListener('click', handleSmoothScroll));
}

/**
 * Inicializa la detección de secciones visibles para activar enlaces
 */
function initSectionDetection(): void {
  const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');

  function setActiveLink(): void {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';

    const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;

    if (isAtBottom) {
      currentSection = 'contact';
    } else {
      sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        if (!sectionId) return;

        const sectionTop = section.getBoundingClientRect().top;
        const sectionElement = section as HTMLElement;
        const sectionBottom = sectionTop + sectionElement.offsetHeight;

        if (sectionTop <= 100 && sectionBottom > 0) {
          currentSection = sectionId;
        }
      });

      if (window.scrollY < 300) {
        currentSection = 'about';
      }
    }

    if (currentSection) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const linkTarget = href.substring(1);
        if (linkTarget === currentSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', setActiveLink);
  setActiveLink();
  setInterval(setActiveLink, 100);
}

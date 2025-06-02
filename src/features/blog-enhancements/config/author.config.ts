/**
 * Blog Enhancement Feature - Author Configuration
 * 
 * Configuración centralizada del autor con información completa
 * para diferentes contextos y variantes del módulo
 */

export interface AuthorProfile {
  // Información básica
  personal: {
    name: string;
    firstName: string;
    lastName: string;
    title: string;
    tagline: string;
    location: string;
    timezone: string;
    languages: string[];
  };
  
  // Biografías
  bio: {
    short: string;      // Para variante compacta (1-2 líneas)
    medium: string;     // Para variante estándar (3-4 líneas)
    extended: string;   // Para variante completa (párrafo completo)
  };
  
  // Experiencia profesional
  experience: {
    years: string;
    currentRole: string;
    company?: string;
    specialties: string[];
    skills: string[];
    achievements: string[];
  };
  
  // Imágenes
  images: {
    avatar: string;
    avatarHigh: string;
    og: string;
    banner?: string;
  };
  
  // Redes sociales
  social: {
    github: string;
    linkedin: string;
    twitter?: string;
    email: string;
    website: string;
    youtube?: string;
    instagram?: string;
  };
  
  // Estadísticas
  stats: {
    articles: number;
    projects: number;
    experience: string;
    followers?: number;
  };
  
  // Configuración de display
  display: {
    showStats: boolean;
    showAchievements: boolean;
    showSkills: boolean;
    showLocation: boolean;
    showAvailability: boolean;
  };
  
  // Información adicional
  extra: {
    availability: 'available' | 'busy' | 'unavailable';
    workingHours: string;
    preferredContact: 'email' | 'linkedin' | 'twitter';
    interests: string[];
    currentProjects: string[];
  };
}

/**
 * Configuración completa del autor
 */
export const AUTHOR_PROFILE: AuthorProfile = {
  personal: {
    name: "Matías Sebastián Cappato",
    firstName: "Matías",
    lastName: "Cappato", 
    title: "Full Stack Developer & Tech Lead",
    tagline: "Construyendo el futuro del desarrollo web",
    location: "Argentina",
    timezone: "GMT-3",
    languages: ["Español", "English"]
  },
  
  bio: {
    short: "Full Stack Developer especializado en TypeScript y arquitecturas modernas.",
    medium: "Desarrollador Full Stack con 8+ años de experiencia, especializado en TypeScript, React y arquitecturas escalables. Apasionado por la automatización y las mejores prácticas.",
    extended: "Desarrollador Full Stack con más de 8 años de experiencia construyendo aplicaciones web escalables y de alto rendimiento. Especializado en TypeScript, React, Node.js y arquitecturas modernas. Me apasiona la automatización de procesos, la optimización de performance y compartir conocimiento a través de artículos técnicos. Actualmente enfocado en tecnologías como Astro, sistemas de design modulares y DevOps automation."
  },
  
  experience: {
    years: "8+",
    currentRole: "Senior Full Stack Developer",
    company: "Freelance",
    specialties: [
      "TypeScript & JavaScript",
      "React & Next.js", 
      "Node.js & Express",
      "Astro & Static Sites",
      "Performance Optimization"
    ],
    skills: [
      "Frontend Development",
      "Backend Architecture", 
      "DevOps & CI/CD",
      "Database Design",
      "API Development",
      "Testing & QA"
    ],
    achievements: [
      "Arquitectura de sistemas escalables para 100k+ usuarios",
      "Optimización de performance web (Core Web Vitals)",
      "Implementación de pipelines CI/CD automatizados",
      "Mentoring de equipos de desarrollo",
      "Contribuciones open source"
    ]
  },
  
  images: {
    avatar: "/images/author/profile.webp",
    avatarHigh: "/images/author/profile.webp",
    og: "/images/author/profile-og.webp"
  },
  
  social: {
    github: "https://github.com/cappato",
    linkedin: "https://www.linkedin.com/in/matiascappato/",
    twitter: "https://twitter.com/matiascappato",
    email: "matias@cappato.dev",
    website: "https://cappato.dev"
  },
  
  stats: {
    articles: 25,
    projects: 50,
    experience: "8+ años"
  },
  
  display: {
    showStats: true,
    showAchievements: true,
    showSkills: true,
    showLocation: true,
    showAvailability: true
  },
  
  extra: {
    availability: 'available',
    workingHours: "9:00 - 18:00 GMT-3",
    preferredContact: 'email',
    interests: [
      "Web Performance",
      "Developer Experience", 
      "Open Source",
      "Tech Writing",
      "Automation"
    ],
    currentProjects: [
      "Blog técnico con Astro",
      "Sistema de componentes modulares",
      "Herramientas de automatización"
    ]
  }
};

/**
 * Configuración de variantes del componente
 */
export const AUTHOR_VARIANTS = {
  // Variante compacta para inicio de artículo
  compact: {
    showBio: 'short' as const,
    showStats: false,
    showAchievements: false,
    showSkills: false,
    showSocial: true,
    maxSocialLinks: 3,
    layout: 'horizontal' as const,
    imageSize: 'small' as const
  },
  
  // Variante estándar
  standard: {
    showBio: 'medium' as const,
    showStats: true,
    showAchievements: false,
    showSkills: true,
    showSocial: true,
    maxSocialLinks: 4,
    layout: 'vertical' as const,
    imageSize: 'medium' as const
  },
  
  // Variante completa para final de artículo
  full: {
    showBio: 'extended' as const,
    showStats: true,
    showAchievements: true,
    showSkills: true,
    showSocial: true,
    maxSocialLinks: 6,
    layout: 'vertical' as const,
    imageSize: 'large' as const
  },
  
  // Variante inline para bylines
  inline: {
    showBio: false as const,
    showStats: false,
    showAchievements: false,
    showSkills: false,
    showSocial: false,
    maxSocialLinks: 0,
    layout: 'horizontal' as const,
    imageSize: 'tiny' as const
  }
} as const;

/**
 * Utilidad para obtener configuración de variante
 */
export function getAuthorVariantConfig(variant: keyof typeof AUTHOR_VARIANTS) {
  return AUTHOR_VARIANTS[variant];
}

/**
 * Utilidad para obtener biografía según tipo
 */
export function getAuthorBio(type: 'short' | 'medium' | 'extended'): string {
  return AUTHOR_PROFILE.bio[type];
}

/**
 * Utilidad para obtener redes sociales limitadas
 */
export function getAuthorSocialLinks(maxLinks?: number) {
  const socialEntries = Object.entries(AUTHOR_PROFILE.social);
  const filteredSocial = socialEntries.filter(([key, value]) => value && value.trim() !== '');
  
  if (maxLinks) {
    return Object.fromEntries(filteredSocial.slice(0, maxLinks));
  }
  
  return Object.fromEntries(filteredSocial);
}

/**
 * Utilidad para generar structured data del autor
 */
export function generateAuthorStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": AUTHOR_PROFILE.personal.name,
    "jobTitle": AUTHOR_PROFILE.personal.title,
    "description": AUTHOR_PROFILE.bio.medium,
    "image": `https://cappato.dev${AUTHOR_PROFILE.images.avatar}`,
    "url": AUTHOR_PROFILE.social.website,
    "sameAs": Object.values(AUTHOR_PROFILE.social).filter(Boolean),
    "knowsAbout": AUTHOR_PROFILE.experience.specialties,
    "worksFor": {
      "@type": "Organization",
      "name": AUTHOR_PROFILE.experience.company || "Freelance"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
      "addressRegion": AUTHOR_PROFILE.personal.location
    }
  };
}

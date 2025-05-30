import type { ExperienceItem } from './types';

/**
 * Professional experience data
 * Centralized data source for all experience information
 */
export const experienceData: ExperienceItem[] = [
  {
    company: "Doppler - Email, Automation and Data Marketing",
    position: "FullStack Developer",
    period: "October 2020 - Present (4 years 6 months)",
    location: "Mar del Plata",
    current: true,
    technologies: [
      "Frontend: Modern JavaScript, React 18, Angular, HTML5, CSS3, Jest",
      "Backend: Node.js, Express, TypeScript, Strapi, PHP",
      "Databases: MySQL, Firestore",
      "DevOps: Docker, Docker Swarm, Traefik, Digital Ocean, Google Cloud Autopilot, Nginx, Cloudflare",
      "CI/CD: GitHub Actions, Jenkins",
      "Methodologies: Scrum, Daily, Planning, Demo, Retro (Atlassian Suite), Jira, Confluence, Slack",
      "Others: Firebase, Stripe, WordPress, Google Sheets"
    ],
    responsibilities: [
      "Collaborated in the maintenance and creation of new features for various web projects, such as the official site, blog, help center, and academy.",
      "Took the initiative to migrate LAMP/WAMP-based projects to Docker environments, improving development configuration and standardization, which accelerated delivery times.",
      "Worked on implementing interactive dashboards for clients, using micro frontends with React and Angular, and developed unit tests with Jest to ensure code quality.",
      "Developed and implemented push notifications using Service Workers and the Firebase suite.",
      "Collaborated in the installation, configuration, and migration of servers with Node.js and Strapi API (Headless CMS), and participated in the migration to their latest versions.",
      "Worked on a marketing events project for the e-commerce and digital trends sector, being responsible for refactoring the code and separating it into components. Performed payment integration with Stripe for ticket sales using Node.js, TypeScript, and Express.",
      "Implemented security measures by configuring custom rules in Nginx and Cloudflare.",
      "Contributed significant UX/UI ideas to optimize the process of visualizing complex data on user-friendly and easy-to-use screens, improving the user experience.",
      "Currently, for the past two years, I have been leading daily standups, planning sessions, and demos for my team. I participate in decision-making and priority setting, and collaborate directly with the client (Marketing team) to evaluate tasks and estimate delivery times."
    ]
  },
  {
    company: "Idata Suite",
    position: "Full Stack Developer",
    period: "February 2020 - October 2020 (9 months)",
    technologies: [
      "PHP (Symfony, CakePHP, Laravel), Node.js, NestJS, TypeScript, Python, SQL, Vue.js 2, Flutter (BLoC pattern), AWS"
    ],
    responsibilities: [
      "Worked on the internal development of a property management platform for expense administration, including user notifications and pending invoice alerts.",
      "Focused primarily on frontend development, building cross-platform mobile applications for Android and iOS using Vue.js and Flutter.",
      "Participated in technical meetings with the team leader to analyze problems and suggest improvements.",
      "Introduced NestJS as a backend solution, helping the team adopt a more scalable and modular architecture.",
      "Contributed to the Dockerization of development and testing environments.",
      "Assisted in the transition to a microservices architecture hosted on AWS.",
      "Helped promote technical discussions and the adoption of best practices within the team."
    ]
  },
  {
    company: "Exactian - Contractor Document Control Platform",
    position: "Full Stack Developer",
    period: "February 2019 - February 2020 (1 year 1 month)",
    technologies: [
      "Vue.js, Quasar Framework, Node.js, NestJS, TypeScript, TypeORM, MySQL, JWT authentication"
    ],
    responsibilities: [
      "Led the implementation of a system that allowed automatic replication of the platform for new client instances.",
      "Developed a dashboard using Vue.js and NestJS that allowed client-specific configuration for each system instance.",
      "The product was a contractor access control monitor used in industrial plants to ensure workers had all documentation updated before entering the facilities.",
      "Assumed direct communication with clients through Google Meet to clarify technical requirements and provide support.",
      "Participated in technology selection and backend architecture planning.",
      "Used agile methodologies (Scrum), including Epics, User Stories, acceptance criteria, functional requirements, and effort estimation.",
      "Contributed to early-stage planning and technology adoption for new project modules."
    ]
  },
  {
    company: "Maker Electronic",
    position: "Technical Lead",
    period: "February 2018 - February 2019 (1 year 1 month)",
    technologies: [
      "Google Cloud Platform, Firebase (Firestore, Cloud Functions), Node.js (API services architecture), SQL Server (stored procedures), Vue.js, Redis Streams, WhatsApp Business API, Facebook for Developers, Social Authentication, Progressive Web Apps"
    ],
    responsibilities: [
      "Assumed the role of Technical Lead for a hybrid application development project (PWA) aimed at taxi and ride-sharing companies throughout Argentina.",
      "Led the development of a WhatsApp bot that interacted with users through a menu system, integrating the WhatsApp API and Google Maps API to predict addresses and routes.",
      "Built a Progressive Web App for end users, with a map-based interface (similar to Uber) that showed the driver's photo, vehicle, and route.",
      "Used Firebase (Firestore, Authentication, Hosting) and GCP Cloud Functions for serverless backend logic.",
      "Connected to SQL Server databases through stored procedures using Node.js, applying hexagonal architecture principles.",
      "Implemented Redis Streams for background job processing and queue handling.",
      "Led team discussions, mentored junior developers, and made key technical decisions throughout the project."
    ]
  },
  {
    company: "Esquiú School",
    position: "Teacher",
    period: "March 2018 - December 2018 (10 months)",
    website: "https://ifmesquiu.com.ar/",
    technologies: ["Scratch 2.0"],
    responsibilities: [
      "Taught a special course for 16-year-old students, introducing them to software programming.",
      "Part of the Sadosky.ar foundation program, using Scratch 2.0.",
      "Director: Fernanda Bardi."
    ]
  },
  {
    company: "Avalith",
    position: "FullStack Developer",
    period: "March 2018",
    technologies: [
      "PHP (Laravel 5.6), JavaScript, React, Oracle, Ubuntu, Jira, Sheena"
    ],
    responsibilities: [
      "Collaborated with the team on a short-term engagement to update and maintain web applications.",
      "Worked with Laravel and React to develop and enhance features.",
      "Handled Oracle database connections and queries.",
      "Participated in internal meetings and agile ceremonies to prioritize and assign tasks.",
      "Supported initial stages of container virtualization efforts using VirtualBox."
    ]
  },
  {
    company: "Open Sports",
    position: "FullStack Developer",
    period: "April 2015 - February 2018 (2 years 11 months)",
    technologies: [
      "PHP (Yii 2.0), JavaScript (Vanilla), SQL Server (stored procedures), HTML5, CSS3, AJAX, jQuery, JSON, REST and SOAP Web Services, Active Directory, WSDL, SharePoint"
    ],
    responsibilities: [
      "Led technical meetings with wholesale clients to understand their business needs and define system requirements.",
      "Took full ownership of a custom-built, optimized e-commerce platform tailored for franchisees and wholesalers.",
      "Made key technology decisions and mentored teammates in adopting the new platform.",
      "Developed an advanced product search system with filtering by size, color, gender, and price range, including custom sorting logic.",
      "Built highly optimized stored procedures in SQL Server to ensure performance and resource efficiency.",
      "Designed the frontend in plain JavaScript, focusing on speed, user experience, and maintainability.",
      "This was a project developed from scratch and remains in use today, something I'm truly proud of."
    ]
  },
  {
    company: "Mutual OAM",
    position: "FullStack PHP Developer",
    period: "November 2014 - April 2015 (6 months)",
    technologies: [
      "PHP, HTML5, CSS3, JavaScript, AJAX, jQuery, JSON, ASP, DB2, MySQL"
    ],
    responsibilities: [
      "Connected a legacy AS/400 system to the web using specialized drivers and PHP, a technically challenging solution that brought great satisfaction to the client.",
      "Developed and maintained internal systems such as employee management, messaging and notes, and a support ticketing system.",
      "Created a professional and provider directory platform with filtering capabilities.",
      "Delivered training sessions for staff to ensure proper use and adoption of the new tools.",
      "Worked closely with stakeholders to gather requirements and iterate quickly on improvements."
    ]
  },
  {
    company: "Favacard S.A.",
    position: "FullStack Developer",
    period: "October 2013 - January 2015 (1 year 4 months)",
    technologies: [
      "GeneXus, JavaScript, HTML, CSS, Web Services"
    ],
    responsibilities: [
      "Developed and maintained a credit card management system for a regional financial company.",
      "Implemented new features and optimized existing ones in the customer portal.",
      "Created reports and dashboards for internal use and customer analysis.",
      "Integrated the system with external payment processors and banking services.",
      "Collaborated with the QA team to ensure software quality and reliability.",
      "Participated in the migration of legacy systems to newer technologies."
    ]
  },
  {
    company: "Avatar",
    position: "PHP Developer",
    period: "November 2006 - December 2008 (2 years 2 months)",
    technologies: [
      "PHP, JavaScript, Ajax, jQuery, MySQL, PostgreSQL, Tomcat, Web Services"
    ],
    responsibilities: [
      "Developed custom web applications for various clients in different industries.",
      "Created and maintained database schemas and stored procedures.",
      "Implemented front-end interfaces using JavaScript and jQuery.",
      "Integrated applications with third-party services and APIs.",
      "Participated in the full software development lifecycle, from requirements gathering to deployment.",
      "Collaborated with designers to ensure proper implementation of UI/UX designs."
    ]
  }
];

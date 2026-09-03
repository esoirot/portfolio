export interface Role {
  title: string
  company: string
  contract?: string
  // Language-independent marker for DossierTab/CommDetailPanel's
  // tab/stamp logic (Experience.tsx), which needs to special-case "this
  // is my own product" and "this is a standard employee contract"
  // regardless of what `contract`'s localized display text says —
  // matching against the French string directly ('Produit personnel',
  // 'CDI') would break for the English data file's translated text.
  contractKind?: 'own-product' | 'standard-employment'
  period: string
  duration: string
  location: string
  // one-sentence context on what the company/product actually was —
  // shown even when the card is collapsed, unlike bullets/stack detail.
  summary?: string
  bullets: Array<string>
  stack: Array<string>
}

export const experience: Array<Role> = [
  {
    title: 'Développeur Full-Stack',
    company: 'The Freelance Companion',
    contract: 'Produit personnel',
    contractKind: 'own-product',
    period: 'juin 2026 — aujourd’hui',
    duration: '3 mois',
    location: 'Île-de-France, France',
    summary:
      'Outil de gestion conçu pour centraliser une activité freelance — CRM, projets, tarification et suivi quotidien — avec une première version pensée pour les besoins d’un traducteur indépendant.',
    bullets: [
      'Outil de gestion pour freelances (CRM, projets, tarification, suivi), de zéro',
      'Full-stack, architecture et modèle de données, première version calée sur un traducteur indépendant',
      'Fonctionnalités conçues à partir de besoins métier concrets, pas de specs abstraites',
      'Installé et déployé chez l’utilisateur final, utilisé au quotidien',
    ],
    stack: [
      'TypeScript',
      'React.js',
      'NestJS',
      'Fastify',
      'GraphQL',
      'PostgreSQL',
      'Prisma',
      'Redis',
      'DDD',
      'Architecture hexagonale',
    ],
  },
  {
    title: 'Co-fondateur & Responsable Technique (CTO)',
    company: 'Adaequatio',
    contract: 'Cofondateur & CTO',
    period: 'nov. 2024 — janv. 2026',
    duration: '1 an 3 mois',
    location: 'Île-de-France, France',
    summary:
      'Plateforme SaaS dédiée au placement de personnes de 45 ans et plus.',
    bullets: [
      'Architecture technique et modèle de données PostgreSQL, de zéro à prod',
      'Full-stack complet : vitrine, espace utilisateur, back-office, API France Travail',
      'Infra AWS, pipelines CI/CD GitHub Actions, tests automatisés et auth',
      'Choix produit : priorisation, conception des fonctionnalités, arbitrages techniques',
    ],
    stack: [
      'TypeScript',
      'NestJS',
      'Next.js',
      'PostgreSQL',
      'Vercel',
      'AWS',
      'Sanity',
      'Tailwind',
      'GitHub Actions',
    ],
  },
  {
    title: 'Senior Full-Stack Developer & Tech Lead',
    company: 'SESAME Digital',
    contract: 'CDI',
    contractKind: 'standard-employment',
    period: 'mars 2023 — juil. 2024',
    duration: '1 an 5 mois',
    location: 'Paris, France',
    summary:
      'Agence digitale e-commerce en environnement startup/scale-up, avec des projets clients et une plateforme SaaS interne.',
    bullets: [
      "Référent technique, architecture et choix produits pour l'équipe",
      'Recrutement et mentoring de 3 développeurs juniors',
      'Plateforme SaaS interne : Next.js, FastAPI, Contentful, AWS',
      'R&D IA générative (Stable Diffusion) et moteur de recommandation',
    ],
    stack: [
      'TypeScript',
      'Next.js',
      'Remix',
      'Node.js',
      'MariaDB',
      'MySQL',
      'PostgreSQL',
      'Vercel',
      'AWS',
      'FastAPI',
      'Contentful',
      'Builder.io',
      'Shopify',
      'Docker',
      'Stable Diffusion',
    ],
  },
  {
    title: 'Founding Engineer',
    company: 'KIS (Keep It Simple)',
    contract: 'CDI',
    contractKind: 'standard-employment',
    period: 'déc. 2021 — oct. 2022',
    duration: '11 mois',
    location: 'Paris, France',
    summary:
      'Startup développant un outil no-code pour créer des applications métiers et web.',
    bullets: [
      'Conception et développement du produit no-code, de zéro',
      'Specs fonctionnelles à partir d’interviews clients',
      'Architecture complète : modèle de données, API, MongoDB',
      "UX et front-end React, app mobile d'auth OTP (React Native)",
    ],
    stack: [
      'Ruby on Rails',
      'React.js',
      'React Native',
      'MongoDB',
      'PostgreSQL',
    ],
  },
  {
    title: 'Software Engineer',
    company: "it'smycar",
    contract: 'CDI',
    contractKind: 'standard-employment',
    period: 'sept. 2019 — déc. 2021',
    duration: '2 ans 4 mois',
    location: 'Paris, France',
    summary:
      'Startup dans la publicité automobile, avec plusieurs applications web et une API métier.',
    bullets: [
      'Coordination technique de 3 front-ends React + API Rails',
      'Cycle produit : User Stories, estimation, priorisation, suivi',
      "Montée en compétence de l'équipe via formations",
      'R&D : chatbot, PoC mobile, prototypage 3D, IoT véhicule',
    ],
    stack: ['Ruby on Rails', 'PostgreSQL', 'React.js', 'React Native'],
  },
  {
    title: 'Software Engineer',
    company: 'Linedata',
    period: 'sept. 2016 — août 2019',
    duration: '3 ans',
    location: 'Paris, France',
    summary:
      "Évolution au sein de plusieurs équipes de développement sur des projets internes et des outils de gouvernance du système d'information.",
    bullets: [
      'Développement et automatisation de tests de non-régression en Ruby on Rails',
      "Conception et développement d'outils de gouvernance du SI en AngularJS et Java",
      'Formation de développeurs à Ruby on Rails et accompagnement d’autres apprentis sur les projets',
      'Participation à des sujets de R&D et de veille technique',
    ],
    stack: ['Ruby', 'Java', 'AngularJS'],
  },
  {
    title: 'Fullstack Developer',
    company: "It'smycar (Startup publicité)",
    period: 'févr. 2016 — août 2016',
    duration: '7 mois',
    location: 'Paris, France',
    summary: 'Startup dans le secteur de la publicité automobile.',
    bullets: [
      "Modernisation et amélioration de l'API Ruby on Rails, avec rédaction de sa documentation technique",
      "Intégration d'un nouveau template graphique sur le site web",
      'Animation d’ateliers Ruby on Rails pour accompagner la montée en compétence de l’équipe',
    ],
    stack: ['Ruby on Rails'],
  },
  {
    title: 'Ruby on Rails Developer',
    company: 'Gzeal',
    period: 'mai 2015 — août 2015',
    duration: '4 mois',
    location: 'Osaka, Japon',
    summary:
      "Amélioration de la qualité d'une application mobile pédagogique dédiée aux mathématiques.",
    bullets: [
      'Développement de tests unitaires en Ruby on Rails',
      "Contrôle et amélioration de la qualité des données utilisées par l'application",
      "Participation à la QA de l'application mobile",
      'Travail dans une équipe internationale à Osaka, Japon',
    ],
    stack: ['Ruby on Rails'],
  },
]

export interface Formation {
  school: string
  degree: string
  period: string
  detail?: string
}

export const formations: Array<Formation> = [
  {
    school: 'Cnam — Conservatoire National des Arts et Métiers',
    degree: "Diplôme d'ingénieur, Informatique et Systèmes d'Information",
    period: '2016 — 2019',
  },
]

export interface TechGroup {
  label: string
  items: Array<string>
}

export const techStack: Array<TechGroup> = [
  {
    label: 'Frontend',
    items: [
      'React.js',
      'Next.js',
      'Remix',
      'React Native',
      'AngularJS',
      'TypeScript',
      'Tailwind',
      'Builder.io',
      'Shopify',
    ],
  },
  {
    label: 'Backend',
    items: [
      'Ruby',
      'Ruby on Rails',
      'Node.js',
      'NestJS',
      'Fastify',
      'FastAPI',
      'GraphQL',
      'Java',
      'DDD',
      'Architecture hexagonale',
    ],
  },
  {
    label: 'Data & Cloud',
    items: [
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'MariaDB',
      'Prisma',
      'Redis',
      'AWS',
      'Vercel',
      'Docker',
      'GitHub Actions',
    ],
  },
  {
    label: 'Product, AI & Tools',
    items: ['Sanity', 'Contentful', 'Stable Diffusion'],
  },
]

export interface Project {
  slug: string
  title: string
  tagline: string
  summary: string
  bullets: Array<string>
  stack: Array<string>
  status: string
  logo?: string
  url?: string
}

export const projects: Array<Project> = [
  {
    slug: 'freelance-companion',
    title: 'The Freelance Companion',
    tagline: 'Outil de gestion pour freelances',
    summary:
      'Outil de gestion conçu pour centraliser une activité freelance — CRM, projets, tarification et suivi quotidien — avec une première version pensée pour les besoins d’un traducteur indépendant.',
    bullets: [
      'Outil de gestion pour freelances (CRM, projets, tarification, suivi), de zéro',
      'Full-stack, architecture et modèle de données, première version calée sur un traducteur indépendant',
      'Fonctionnalités conçues à partir de besoins métier concrets, pas de specs abstraites',
      'Installé et déployé chez l’utilisateur final, utilisé au quotidien',
    ],
    stack: [
      'TypeScript',
      'React.js',
      'NestJS',
      'Fastify',
      'GraphQL',
      'PostgreSQL',
      'Prisma',
      'Redis',
    ],
    status: 'Produit personnel — en production',
  },
  {
    slug: 'adaequatio',
    title: 'Adaequatio',
    tagline: "L'expérience a de l'avenir",
    summary:
      'Plateforme SaaS dédiée au placement de personnes de 45 ans et plus.',
    bullets: [
      'Architecture technique et modèle de données PostgreSQL, de zéro à prod',
      'Full-stack complet : vitrine, espace utilisateur, back-office, API France Travail',
      'Infra AWS, pipelines CI/CD GitHub Actions, tests automatisés et auth',
      'Choix produit : priorisation, conception des fonctionnalités, arbitrages techniques',
    ],
    stack: [
      'TypeScript',
      'NestJS',
      'Next.js',
      'PostgreSQL',
      'Vercel',
      'AWS',
      'Sanity',
      'Tailwind',
    ],
    status: 'Cofondateur & CTO — nov. 2024 — janv. 2026',
    logo: '/adaequatio-logo.png',
    url: 'https://www.adaequatio.net/',
  },
  {
    slug: 'echo',
    title: 'Écho',
    tagline: "Framework d'orchestration multi-agents (Projet personnel R&D)",
    summary:
      "Framework d'orchestration multi-agents conçu pour transformer des objectifs métier en tâches techniques exécutables, avec des modèles de langage open-source exécutés localement.",
    bullets: [
      "Conception d'une architecture hiérarchique d'agents : orchestration, décomposition des tâches, agents spécialisés et exécution.",
      "Mise en place d'un système de décomposition récursive et de validation des tâches avant exécution.",
      "Intégration d'un système RAG avec gestion du contexte.",
      'Gestion dynamique des ressources et du cycle de vie des agents dans un environnement local.',
      'Exécution 100 % locale, sans dépendance à une API externe.',
    ],
    stack: ['Ruby', 'Ollama', 'Llama 3.1', 'Code Llama', 'nomic-embed-text'],
    status: 'Projet personnel — R&D',
  },
]

export const contact = {
  email: 'esoirot@gmail.com',
  github: 'https://github.com/esoirot',
  linkedin: 'https://linkedin.com/in/eliott-soirot',
}

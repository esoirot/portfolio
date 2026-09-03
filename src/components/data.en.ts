import type { Formation, Project, Role, TechGroup } from './data.ts'
import { techStack as techStackFr } from './data.ts'

/** English translations of data.ts's content — same shape, same order,
    same stack/slug/logo/url values (language-independent), served by the
    /en routes. contact isn't duplicated here: email/github/linkedin
    don't need translating. */

// techStack's labels are already English tech/category names, except this
// one prose item — derived from the French array (not a full copy) so the
// ~20 language-neutral entries stay single-sourced. Filter chips come from
// this list (TechStack.tsx) and get matched against role.stack strings
// (tech-filter.tsx) — leaving this one untranslated would make the
// "Hexagonal architecture" chip never match any English role's stack.
export const techStack: Array<TechGroup> = techStackFr.map((group) =>
  group.label === 'Backend'
    ? {
        ...group,
        items: group.items.map((item) =>
          item === 'Architecture hexagonale' ? 'Hexagonal architecture' : item,
        ),
      }
    : group,
)
export const experience: Array<Role> = [
  {
    title: 'Full-Stack Developer',
    company: 'The Freelance Companion',
    contract: 'Personal project',
    contractKind: 'own-product',
    period: 'June 2026 — present',
    duration: '3 months',
    location: 'Île-de-France, France',
    summary:
      'Management tool built to centralize a freelance business — CRM, projects, pricing, and day-to-day tracking — with a first version shaped around an independent translator’s needs.',
    bullets: [
      'Management tool for freelancers (CRM, projects, pricing, tracking), from scratch',
      'Full-stack, architecture and data model, first version tailored to an independent translator',
      'Features designed from concrete business needs, not abstract specs',
      'Installed and deployed at the end user’s, used daily',
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
      'Hexagonal architecture',
    ],
  },
  {
    title: 'Co-founder & Chief Technical Officer (CTO)',
    company: 'Adaequatio',
    contract: 'Co-founder & CTO',
    period: 'Nov 2024 — Jan 2026',
    duration: '1 year 3 months',
    location: 'Île-de-France, France',
    summary: 'SaaS platform dedicated to placing people aged 45 and over.',
    bullets: [
      'Technical architecture and PostgreSQL data model, from zero to prod',
      'Full-stack: marketing site, user portal, back office, France Travail API',
      'AWS infrastructure, GitHub Actions CI/CD pipelines, automated tests and auth',
      'Product decisions: prioritization, feature design, technical trade-offs',
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
    contract: 'Permanent contract',
    contractKind: 'standard-employment',
    period: 'Mar 2023 — Jul 2024',
    duration: '1 year 5 months',
    location: 'Paris, France',
    summary:
      'E-commerce digital agency in a startup/scale-up environment, with client projects and an internal SaaS platform.',
    bullets: [
      'Technical lead, architecture and product decisions for the team',
      'Recruited and mentored 3 junior developers',
      'Internal SaaS platform: Next.js, FastAPI, Contentful, AWS',
      'Generative AI R&D (Stable Diffusion) and recommendation engine',
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
    contract: 'Permanent contract',
    contractKind: 'standard-employment',
    period: 'Dec 2021 — Oct 2022',
    duration: '11 months',
    location: 'Paris, France',
    summary:
      'Startup building a no-code tool for creating business and web applications.',
    bullets: [
      'Designed and built the no-code product, from scratch',
      'Functional specs drawn from client interviews',
      'Full architecture: data model, API, MongoDB',
      'React UX/front-end, OTP-auth mobile app (React Native)',
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
    contract: 'Permanent contract',
    contractKind: 'standard-employment',
    period: 'Sep 2019 — Dec 2021',
    duration: '2 years 4 months',
    location: 'Paris, France',
    summary:
      'Automotive advertising startup, with several web applications and a business API.',
    bullets: [
      'Technical coordination of 3 React front-ends + Rails API',
      'Product cycle: user stories, estimation, prioritization, tracking',
      'Upskilled the team through internal training',
      'R&D: chatbot, mobile PoC, 3D prototyping, vehicle IoT',
    ],
    stack: ['Ruby on Rails', 'PostgreSQL', 'React.js', 'React Native'],
  },
  {
    title: 'Software Engineer',
    company: 'Linedata',
    period: 'Sep 2016 — Aug 2019',
    duration: '3 years',
    location: 'Paris, France',
    summary:
      'Rotated across several development teams on internal projects and IT governance tools.',
    bullets: [
      'Developed and automated regression tests in Ruby on Rails',
      'Designed and built IT governance tools in AngularJS and Java',
      'Trained developers in Ruby on Rails and mentored other trainees on projects',
      'Contributed to R&D and technology-watch topics',
    ],
    stack: ['Ruby', 'Java', 'AngularJS'],
  },
  {
    title: 'Fullstack Developer',
    company: "It'smycar (advertising startup)",
    period: 'Feb 2016 — Aug 2016',
    duration: '7 months',
    location: 'Paris, France',
    summary: 'Automotive advertising startup.',
    bullets: [
      'Modernized and improved the Ruby on Rails API, including writing its technical documentation',
      'Integrated a new graphic template on the website',
      'Ran Ruby on Rails workshops to help the team skill up',
    ],
    stack: ['Ruby on Rails'],
  },
  {
    title: 'Ruby on Rails Developer',
    company: 'Gzeal',
    period: 'May 2015 — Aug 2015',
    duration: '4 months',
    location: 'Osaka, Japan',
    summary:
      'Improved the quality of an educational mobile app for mathematics.',
    bullets: [
      'Wrote unit tests in Ruby on Rails',
      'Checked and improved the quality of data used by the app',
      'Contributed to QA of the mobile app',
      'Worked in an international team in Osaka, Japan',
    ],
    stack: ['Ruby on Rails'],
  },
]

export const formations: Array<Formation> = [
  {
    school: 'Cnam — French National Conservatory of Arts and Crafts',
    degree: 'Engineering Degree, Computer Science and Information Systems',
    period: '2016 — 2019',
  },
]

export const projects: Array<Project> = [
  {
    slug: 'freelance-companion',
    title: 'The Freelance Companion',
    tagline: 'Management tool for freelancers',
    summary:
      'Management tool built to centralize a freelance business — CRM, projects, pricing, and day-to-day tracking — with a first version shaped around an independent translator’s needs.',
    bullets: [
      'Management tool for freelancers (CRM, projects, pricing, tracking), from scratch',
      'Full-stack, architecture and data model, first version tailored to an independent translator',
      'Features designed from concrete business needs, not abstract specs',
      'Installed and deployed at the end user’s, used daily',
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
    status: 'Personal project — in production',
  },
  {
    slug: 'adaequatio',
    title: 'Adaequatio',
    tagline: 'Experience has a future',
    summary: 'SaaS platform dedicated to placing people aged 45 and over.',
    bullets: [
      'Technical architecture and PostgreSQL data model, from zero to prod',
      'Full-stack: marketing site, user portal, back office, France Travail API',
      'AWS infrastructure, GitHub Actions CI/CD pipelines, automated tests and auth',
      'Product decisions: prioritization, feature design, technical trade-offs',
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
    status: 'Co-founder & CTO — Nov 2024 — Jan 2026',
    logo: '/adaequatio-logo.png',
    url: 'https://www.adaequatio.net/',
  },
  {
    slug: 'echo',
    title: 'Echo',
    tagline: 'Multi-agent orchestration framework (Personal R&D project)',
    summary:
      'Multi-agent orchestration framework designed to turn business objectives into executable technical tasks, using open-source language models running locally.',
    bullets: [
      'Designed a hierarchical agent architecture: orchestration, task decomposition, specialized agents and execution.',
      'Built a recursive task-decomposition and validation system, run before execution.',
      'Integrated a RAG system with context management.',
      'Dynamic management of agent resources and lifecycle in a local environment.',
      '100% local execution, with no dependency on external APIs.',
    ],
    stack: ['Ruby', 'Ollama', 'Llama 3.1', 'Code Llama', 'nomic-embed-text'],
    status: 'Personal project — R&D',
  },
]

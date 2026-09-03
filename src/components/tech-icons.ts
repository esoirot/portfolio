import type { ComponentType } from 'react'
import {
  SiAngular,
  SiContentful,
  SiDocker,
  SiFastapi,
  SiFastify,
  SiFigma,
  SiGithubactions,
  SiGraphql,
  SiHtml5,
  SiJira,
  SiMariadb,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiNotion,
  SiOpenjdk,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiRedis,
  SiRemix,
  SiRuby,
  SiRubyonrails,
  SiSanity,
  SiShopify,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from '@icons-pack/react-simple-icons'
import { AwsLogo } from './crt/TechLogos.tsx'

type IconComponent = ComponentType<{
  title?: string
  size?: number
  color?: string
}>

/** Only items with a real brand mark get one here — items missing (React
    Native, Builder.io, Stable Diffusion, Prompt Engineering: no icon
    exists in simple-icons for any of these) fall back to the plain text
    chip. "MySQL / MariaDB" keys off MySQL's own mark since the two share
    one item entry in TechStack; Experience's data.ts lists them
    separately, so both get their own real icon there too. */
export const TECH_ICONS: Partial<Record<string, IconComponent>> = {
  'React.js': SiReact,
  'Next.js': SiNextdotjs,
  Remix: SiRemix,
  AngularJS: SiAngular,
  TypeScript: SiTypescript,
  'Tailwind CSS': SiTailwindcss,
  'HTML / CSS': SiHtml5,
  'Shopify / Liquid': SiShopify,
  Ruby: SiRuby,
  'Ruby on Rails': SiRubyonrails,
  'Node.js': SiNodedotjs,
  NestJS: SiNestjs,
  Fastify: SiFastify,
  FastAPI: SiFastapi,
  GraphQL: SiGraphql,
  Java: SiOpenjdk,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  'MySQL / MariaDB': SiMysql,
  Prisma: SiPrisma,
  Redis: SiRedis,
  AWS: AwsLogo,
  Vercel: SiVercel,
  Docker: SiDocker,
  'GitHub Actions / CI-CD': SiGithubactions,
  Sanity: SiSanity,
  Contentful: SiContentful,
  Jira: SiJira,
  Notion: SiNotion,
  Figma: SiFigma,

  // Experience section spells/splits some of these differently (its own
  // data.ts predates this map) — same icons, just aliased under the
  // exact strings used there instead of duplicating a second map.
  Tailwind: SiTailwindcss,
  Shopify: SiShopify,
  MariaDB: SiMariadb,
  MySQL: SiMysql,
  HTML: SiHtml5,
}

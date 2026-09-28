import type { ComponentType } from 'react'
import {
  SiAngular,
  SiContentful,
  SiDocker,
  SiFastapi,
  SiFastify,
  SiGithubactions,
  SiGraphql,
  SiMariadb,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
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
import { TECH_ICON_SPRITE_VERSION } from './tech-icon-sprite-version.ts'

type IconComponent = ComponentType<{ title?: string }>

/** One entry per brand mark — each becomes a single <symbol> in
    TechIconSprite, however many chips show it. */
const ICONS = {
  react: SiReact,
  nextjs: SiNextdotjs,
  remix: SiRemix,
  angular: SiAngular,
  typescript: SiTypescript,
  tailwind: SiTailwindcss,
  shopify: SiShopify,
  ruby: SiRuby,
  rails: SiRubyonrails,
  node: SiNodedotjs,
  nestjs: SiNestjs,
  fastify: SiFastify,
  fastapi: SiFastapi,
  graphql: SiGraphql,
  java: SiOpenjdk,
  postgresql: SiPostgresql,
  mongodb: SiMongodb,
  mysql: SiMysql,
  mariadb: SiMariadb,
  prisma: SiPrisma,
  redis: SiRedis,
  aws: AwsLogo,
  vercel: SiVercel,
  docker: SiDocker,
  githubactions: SiGithubactions,
  sanity: SiSanity,
  contentful: SiContentful,
} satisfies Record<string, IconComponent>

type IconId = keyof typeof ICONS

/** Keyed by the exact tech strings data.ts/data.en.ts use. Items with
    no brand mark in simple-icons (React Native, Builder.io, Stable
    Diffusion, …) have no entry and fall back to the plain text chip. */
const TECH_ICON_IDS: Partial<Record<string, IconId>> = {
  React: 'react',
  'React.js': 'react',
  'Next.js': 'nextjs',
  Remix: 'remix',
  AngularJS: 'angular',
  TypeScript: 'typescript',
  Tailwind: 'tailwind',
  Shopify: 'shopify',
  Ruby: 'ruby',
  'Ruby on Rails': 'rails',
  'Node.js': 'node',
  NestJS: 'nestjs',
  Fastify: 'fastify',
  FastAPI: 'fastapi',
  GraphQL: 'graphql',
  Java: 'java',
  PostgreSQL: 'postgresql',
  MongoDB: 'mongodb',
  MySQL: 'mysql',
  MariaDB: 'mariadb',
  Prisma: 'prisma',
  Redis: 'redis',
  AWS: 'aws',
  Vercel: 'vercel',
  Docker: 'docker',
  'GitHub Actions': 'githubactions',
  Sanity: 'sanity',
  Contentful: 'contentful',
}

export function hasTechIcon(tech: string): boolean {
  return tech in TECH_ICON_IDS
}

const SPRITE_URL = `/tech-icons.svg?v=${TECH_ICON_SPRITE_VERSION}`

/** Every brand mark as a <symbol>. Rendered to public/tech-icons.svg by
    scripts/build-icon-sprite.tsx (`pnpm icons`) — one cached file, so
    no page's HTML carries the paths; TechIcon only points into it. */
export function TechIconSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg">
      {Object.entries(ICONS).map(([id, Icon]) => (
        <symbol key={id} id={`ti-${id}`} viewBox="0 0 24 24">
          <Icon title="" />
        </symbol>
      ))}
    </svg>
  )
}

export function TechIcon({
  tech,
  size = 14,
  color = 'var(--orange)',
}: {
  tech: string
  size?: number
  color?: string
}) {
  const id = TECH_ICON_IDS[tech]
  if (!id) return null
  return (
    <svg
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ color }}
    >
      <use href={`${SPRITE_URL}#ti-${id}`} />
    </svg>
  )
}

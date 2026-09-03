import { useLocation } from '@tanstack/react-router'

export type Locale = 'fr' | 'en'

/** Locale is derived purely from the URL (no context/provider needed) —
    `/en` and everything under it is English, everything else is French.
    Works in any component under the router, including the root shell
    (for `<html lang>`) and 404/error screens (path still exists even
    when nothing matched). */
export function useLocale(): Locale {
  const { pathname } = useLocation()
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr'
}

export function homePathFor(locale: Locale): string {
  return locale === 'en' ? '/en' : '/'
}

// UI copy that actually differs between languages. Strings already
// written in English directly in components (button labels, "Contact"
// and "Tech Stack" kickers, the CRT phosphor-mode labels) aren't
// duplicated here — they render the same for both locales already.
export const strings = {
  fr: {
    metaDescription:
      "Eliott Soirot, développeur fullstack et tech lead — 10+ ans d'expérience en TypeScript, React, Node.js, architecture et produit.",
    notFoundTitle: 'Page introuvable',
    errorCode: 'Erreur',
    errorTitle: 'Une erreur inattendue est survenue.',
    backToHome: "Retour à l'accueil",
    home: 'Accueil',
    heroSubtitle: 'Concevoir - Livrer - Améliorer',
    heroSubtitleDetail:
      "Ownership de bout en bout, de l'idée à l'amélioration continue.",
    seeWork: 'Voir le parcours',
    contactMe: 'Me contacter',
    downloadCv: 'Télécharger mon CV',
    cvHref: '/CV Eliott Soirot - Senior Fullstack Engineer.pdf',
    yearsExperience: "ans d'expérience",
    productsShipped: 'produits en prod',
    saasCofounded: 'SaaS co-fondé',
    experienceTitle: 'Parcours professionnel',
    noExperienceMatch: 'Aucune expérience ne correspond à ce filtre.',
    clearFilters: 'Effacer les filtres',
    kickerExperience: 'Expérience',
    kickerProjects: 'Projets',
    techStackTitle: 'Cliquez sur une puce pour filtrer les expériences',
    projectsTitle: 'Cliquez sur un écran pour consulter un projet',
    ownProductStamp: 'Produit SaaS',
    workFallback: 'Work',
    visitSite: 'Visiter le site',
    stackLabel: 'STACK :',
    responseTime: 'Réponse sous 48h',
  },
  en: {
    metaDescription:
      'Eliott Soirot, fullstack engineer and tech lead — 10+ years of experience in TypeScript, React, Node.js, architecture and product.',
    notFoundTitle: 'Page not found',
    errorCode: 'Error',
    errorTitle: 'An unexpected error occurred.',
    backToHome: 'Back to home',
    home: 'Home',
    heroSubtitle: 'Build - Ship - Improve',
    heroSubtitleDetail:
      'End-to-end ownership, from idea to continuous improvement.',
    seeWork: 'See my work',
    contactMe: 'Contact me',
    downloadCv: 'Download my resume',
    cvHref: '/EN Eliott Soirot - Senior Fullstack Engineer.pdf',
    yearsExperience: 'years of experience',
    productsShipped: 'products shipped',
    saasCofounded: 'SaaS co-founded',
    experienceTitle: 'Professional experience',
    noExperienceMatch: 'No experience matches this filter.',
    clearFilters: 'Clear filters',
    kickerExperience: 'Experience',
    kickerProjects: 'Projects',
    techStackTitle: 'Click a chip to filter experience',
    projectsTitle: 'Click a screen to view a project',
    ownProductStamp: 'SaaS product',
    workFallback: 'Work',
    visitSite: 'Visit site',
    stackLabel: 'STACK:',
    responseTime: 'Reply within 48h',
  },
} as const

export function useStrings() {
  return strings[useLocale()]
}

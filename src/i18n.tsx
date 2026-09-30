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
    metaTitle:
      'Eliott Soirot — Développeur Fullstack Senior & Tech Lead · Paris / Remote',
    metaDescription:
      "Eliott Soirot, développeur fullstack senior et tech lead à Paris (Île-de-France) ou en remote — 10+ ans d'expérience en TypeScript, React, Node.js, architecture et produit.",
    jobTitle: 'Développeur Fullstack Senior & Tech Lead',
    ogImageAlt: 'Eliott Soirot — Développeur Fullstack Senior & Tech Lead',
    notFoundTitle: 'Page introuvable',
    errorCode: 'Erreur',
    errorTitle: 'Une erreur inattendue est survenue.',
    backToHome: "Retour à l'accueil",
    home: 'Accueil',
    heroTagline: 'Développeur Fullstack · Tech Lead · Entrepreneur',
    heroSubtitle: 'Concevoir - Livrer - Améliorer',
    heroSubtitleDetail:
      "Ownership de bout en bout, de l'idée à l'amélioration continue.",
    seeWork: 'Voir le parcours',
    contactMe: 'Me contacter',
    downloadCv: 'Télécharger mon CV',
    cvHref: '/eliott-soirot-cv-fr.pdf',
    cvFileName: 'Eliott Soirot - CV Senior Fullstack Developer.pdf',
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
    filterByTech: "Filtrer l'expérience par",
    replayAnimation: "Rejouer l'animation",
    replayBoot: "Rejouer l'animation de démarrage",
    viewProject: 'Voir le projet',
    phosphorModes: [
      'Mode phosphore vert',
      'Mode phosphore cyan',
      'Mode couleurs normales',
    ],
  },
  en: {
    metaTitle:
      'Eliott Soirot — Senior Fullstack Developer & Tech Lead · Paris / Remote',
    metaDescription:
      'Eliott Soirot, senior fullstack developer and tech lead based in Paris (Île-de-France), open to remote — 10+ years of experience in TypeScript, React, Node.js, architecture and product.',
    jobTitle: 'Senior Fullstack Developer & Tech Lead',
    ogImageAlt: 'Eliott Soirot — Senior Fullstack Developer & Tech Lead',
    notFoundTitle: 'Page not found',
    errorCode: 'Error',
    errorTitle: 'An unexpected error occurred.',
    backToHome: 'Back to home',
    home: 'Home',
    heroTagline: 'Fullstack Developer · Tech Lead · Entrepreneur',
    heroSubtitle: 'Build - Ship - Improve',
    heroSubtitleDetail:
      'End-to-end ownership, from idea to continuous improvement.',
    seeWork: 'See my work',
    contactMe: 'Contact me',
    downloadCv: 'Download my resume',
    cvHref: '/eliott-soirot-cv-en.pdf',
    cvFileName: 'Eliott Soirot - Resume Senior Fullstack Developer.pdf',
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
    filterByTech: 'Filter experience by',
    replayAnimation: 'Replay animation',
    replayBoot: 'Replay boot animation',
    viewProject: 'View project',
    phosphorModes: [
      'Green phosphor mode',
      'Cyan phosphor mode',
      'Normal color mode',
    ],
  },
} as const

export function useStrings() {
  return strings[useLocale()]
}

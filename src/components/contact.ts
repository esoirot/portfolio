// Own module (re-exported by data.ts) so route heads (seo.ts's JSON-LD)
// can read it without pulling a whole locale's data file into the
// main bundle — route heads aren't code-split.
export const contact = {
  email: 'esoirot@gmail.com',
  github: 'https://github.com/esoirot',
  linkedin: 'https://linkedin.com/in/eliott-soirot',
}

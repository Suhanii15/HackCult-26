// Tiny module holding the currently selected UI language so non-hook code
// (MICROCOPY, tr()) can resolve text in the right language.
let activeLanguage = 'en';

export function getActiveLanguage() {
  return activeLanguage;
}

export function setActiveLanguage(lang) {
  activeLanguage = lang;
}

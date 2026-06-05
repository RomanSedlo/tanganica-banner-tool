const WEBHOOK_URL = "https://creative-automation-tool.marketing-e01.workers.dev/"

// Když chcete přidat jazyk, musíte pro něj přidat i Webinář a badge label, a tím se automaticky přidá do flow
const LANGUAGES = {
  cz: "Czech",
  en: "English",
  de: "German",
  it: "Italian",
  es: "Spanish",
  fr: "French",
  pl: "Polish",
  ro: "Romanian",
  hu: "Hungarian",
  pt: "Portuguese",
  nl: "Dutch",
  sk: "Slovak",
};
const WEBINAR_LABELS = {
    cz: 'Webinář pro e-shopy', en: 'Webinar for e-shops', de: 'Webinar für Online-Shops',
    it: 'Webinar per e-commerce', es: 'Webinar para e-commerce', fr: 'Webinaire pour e-commerce',
    pl: 'Webinar dla e-sklepów', ro: 'Webinar pentru magazine online', hu: 'Webinár e-shopoknak',
    pt: 'Webinar para e-commerce', nl: 'Webinar voor webshops', sk: "Webinár pre e-shopy",
};
const BADGE_LABELS = {
    cz: 'ZDARMA', en: 'FOR FREE', de: 'KOSTENLOS', it: 'GRATIS', es: 'GRATIS', fr: 'GRATUIT',
    pl: 'ZA DARMO', ro: 'GRATUIT', hu: 'INGYENES', pt: 'GRÁTIS', nl: 'GRATIS', sk: "ZADARMO"
};

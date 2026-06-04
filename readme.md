# Tanganica Banner Automation Tool

Nástroj pro generování reklamních bannerů ve všech 11 evropských trzích Tanganicy. Uživatel vyplní formulář, AI vygeneruje texty a přeloží je — výsledkem je ZIP s PNG bannery pro každý trh.

**→ [Otevřít nástroj](https://romansedlo.github.io/tanganica-banner-tool/)**

---

## Rychlý start

1. Otevři nástroj na GitHub Pages
2. Vyber **Banner size** — `1080×1080` (Feed) nebo `1080×1920` (Stories/Reels)
   - Pro Stories nahraj obrázek přes file input který se zobrazí
3. Vyber **Ad type** — `Normal ad`, `Lead magnet`, nebo `Webinar`
4. Vyber **Campaign** — konkrétní funkce Tanganicy (Google Ads, SEO, Budget splitting…)
5. Napiš **Headline** a **Button text** v angličtině — nebo použij tlačítka:
   - **Generate** — vygeneruje nový text podle vybraného typu a kampaně
   - **Improve** — vylepší text který už máš
6. Klikni **Generate banners**
7. Počkej (cca 30–60 s) — stáhne se ZIP s `11 × PNG` bannery

---

## Architektura

```
GitHub Pages (index.html + main.js + šablony)
     │
     ├── POST (generate_text / improve_text)
     │        ↓
     │   Cloudflare Worker
     │        ↓
     │   N8N Workflow 1 → Claude → { text: "..." }
     │        ↑ výsledek se zobrazí ve formuláři, uživatel schválí
     │
     └── POST (generate_banners)
              ↓
         Cloudflare Worker
              ↓
         N8N Workflow 2:
           Webhook → input.js → If (normal_ad)
                                  ├── true  → split headline (Claude) → apply split
                                  └── false ──────────────────────────┘
                                       ↓
                                  translate (Claude, 11 jazyků)
                                       ↓
                                  format.js → Respond to Webhook
              ↓
         main.js → generateBanners()
           - načte HTML šablonu podle velikosti
           - pro každý jazyk: dosadí texty + base64 loga → html-to-image → PNG
           - zabalí do JSZip → stažení
```

### Modely
Oba N8N workflow používají **Claude Sonnet 4.6** (`claude-sonnet-4-6`).

---

## Soubory v repozitáři

```
├── index.html                        # Formulář
├── style.css                         # Styling formuláře
├── main.js                           # Logika: AI volání, generování bannerů, ZIP
├── templates/
│   ├── banner_template_1080h.html    # Šablona 1080×1080 (Feed)
│   └── banner_template_1920h.html    # Šablona 1080×1920 (Stories/Reels)
├── images/
│   ├── tanganica_logo.svg
│   ├── google_ads.png
│   ├── meta.png
│   └── bing.png
└── n8n/
    ├── workflow_1.json               # N8N workflow — generování a vylepšení textu
    └── workflow_2.json               # N8N workflow — překlad a příprava dat pro bannery
```

---

## N8N workflow

### Workflow 1 — generování textu
Přijme `action` (`generate_text` / `improve_text`), `type`, `campaign`, `currentHeadline`, `currentCTA`.
- **input.js** — sestaví `typeDescription`, `campaignDescription`, `modeDescription`, `modeButton` podle akce a vstupu
- **Claude node (headline)** — vygeneruje nebo vylepší headline; temperature `1.1` pro generate, `0.3` pro improve
- **Claude node (CTA)** — vygeneruje nebo vylepší button text; temperature `0.9`
- Vrátí `{ text: "..." }`

### Workflow 2 — překlad a formátování
Přijme `headline`, `cta_text`, `campaign`, `ad_type`.
- **If node** — pro `normal_ad` nejprve rozdělí headline na dva řádky přes Claude
- **Claude node (translate)** — přeloží headline a CTA do všech 11 jazyků; temperature `0.3`
- **format.js** — zformátuje výstup do objektu `{ cz: { headline, cta }, en: {...}, ... }`
- Vrátí JSON objekt s překlady

---

## Trhy a jazyky

| Kód | Jazyk | Trh |
|-----|-------|-----|
| `cz` | Čeština | 🇨🇿 CZ |
| `en` | Angličtina | 🇬🇧 EN |
| `de` | Němčina | 🇩🇪 DE |
| `it` | Italština | 🇮🇹 IT |
| `es` | Španělština | 🇪🇸 ES |
| `fr` | Francouzština | 🇫🇷 FR |
| `pl` | Polština | 🇵🇱 PL |
| `ro` | Rumunština | 🇷🇴 RO |
| `hu` | Maďarština | 🇭🇺 HU |
| `pt` | Portugalština | 🇵🇹 PT |
| `nl` | Nizozemština | 🇳🇱 NL |

---

## Brand manuál (shrnutí)

| Prvek | Hodnota |
|-------|---------|
| Hlavní modrá | `#00386c` |
| Oranžová | `#df5500` |
| Pozadí | `#f4f5f7` |
| Font | Graphik (Medium 500, Light 300) |

Struktura banneru vždy: **Logo → Headline → Vizuální prvek → CTA button → Platform loga**

---

## Jak přidat nový jazyk

1. V `main.js` přidej kód jazyka do `webinarLabels` a `badgeLabels`
2. V N8N Workflow 2 — Claude translate node — přidej jazyk do promptu
3. V N8N Workflow 2 — format.js — přidej jazyk do výstupního objektu

## Jak přidat nový typ kampaně

1. V N8N Workflow 1 — `input.js` — přidej nový klíč do objektu `functions` s popisem kampaně
2. V `index.html` přidej `<option>` do selectu pro campaign

## Jak přidat nový formát banneru

1. Vytvoř novou HTML šablonu v `templates/`
2. V `main.js` uprav `templateUrl` logiku podle nové velikosti
3. V `index.html` přidej radio button pro novou velikost

---

## Technické poznámky

- **Loga se načítají jako base64** při startu stránky (`preloadLogos()`) — nutné kvůli html-to-image na GitHub Pages, který nemůže fetchovat relativní cesty
- **`getElementById` nezná CSS selektory** — pro radio inputy vždy `querySelector`/`querySelectorAll`
- **Čištění JSON od Clauda** — odstranit ` ```json ` fence před `JSON.parse`
- **N8N Code node** — na výstup předchozího nodu se sahá přes `$('Node Name').first().json`
- **Cloudflare Worker** slouží jako proxy mezi GitHub Pages a N8N (řeší CORS)

---

## Možná budoucí rozšíření

- **Video kreativy** — generování videí přes Veo/Google Vids API (v době tvorby nedostupná kvalita přes API)
- **Config soubor** — centrální `config.js` pro jazyky, formáty a URL místo inline konstant
- **Více formátů** — LinkedIn (1200×627), Google Display (728×90) atd.
- **Canva API integrace** — přímý export do Canva draftů místo PNG
- **Slack notifikace** — po vygenerování poslat ZIP link do Slack kanálu
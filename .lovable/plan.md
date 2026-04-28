## Esporta la guida completa Design System — Typography, Layout, Spacing, Alignment

Il progetto Motion ha un design system molto ricco definito in `src/index.css` e `tailwind.config.ts`. Estrarro' tutte le regole effettive (non inventate) e le esportero' in un unico documento Markdown scaricabile, organizzato per categoria.

### Cosa verra' incluso

Il documento `motion-design-system-typography-layout.md` (in `/mnt/documents/`) coprira' **solo le aree richieste**: font, gerarchia caratteri, layout grid, spacing, alignment e padding. (I colori sono gia' stati documentati in una risposta precedente — non li duplico.)

#### 1. Font & Typography
- **Font family**: Montserrat (400/500/600/700) come `--font-sans`, fallback system-ui → Apple → Segoe UI → Roboto. `font-montserrat` e `font-nunito` esposti come utility Tailwind.
- **Scala font-size token** (`--fs-xs` → `--fs-h1`): valori esatti 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 36 / 40 / 44 px.
- **Scala Tailwind** (`text-xs` → `text-h1`) con line-height e letter-spacing per ognuna (es. h1 = 44px / 1.2 / -0.01em).
- **Line-height tokens**: `--lh-tight` 1.2, `--lh-snug` 1.3, `--lh-normal` 1.5, `--lh-relaxed` 1.6 + a quale heading ognuna e' applicata.
- **Heading rules globali** (h1–h6): font-size, line-height, letter-spacing, font-weight semibold applicati automaticamente in `@layer base`.
- **Responsive type scale**:
  - mobile (`<640px`): h1=32, h2=28, h3=24, h4=22, h5=20, h6=18
  - desktop (`>=1024px`): valori pieni
- **Body default**: 16px / 1.5 line-height, antialiased, smoothing webkit/moz.
- **Ink scale per gerarchia testuale**: ink-950 (heading forte), ink-900 (body), ink-700 (secondary), ink-500 (meta/muted) + lista deprecated (800, 600, 300, 200) da non usare.
- **Regola "preserve-case"**: utility per evitare text-transform su input utente.
- **Link non stilizzati**: colore accent, underline 4px offset, hover opacita' 0.8.

#### 2. Layout Grid & Containers
- **Container max-width**: `--container-2xl` = 1440px, classi `.container` (padding 16px lat) e `container` di Tailwind (centered, padding 1rem, breakpoint 2xl 1440px).
- **Breakpoints**:
  - `sm` 640
  - `md` 768 (tablet+)
  - `lg` 992 (desktop small)
  - `xl` 1200 (desktop large)
  - `2xl` 1440
- **Pattern container piattaforma client** (da memory): `mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10`.
- **Pattern shell pagine client**: `ClientPageShell` = `px-4 py-5 space-y-6 pb-24` (bottom safe-area per nav mobile).
- **Pattern shell coach**: top-padding standard 24px (`pt-6`/`py-6`) dalla topbar (regola memory coach-platform-topbar-spacing).

#### 3. Spacing — sistema 4-point
- **Token CSS** `--space-0` → `--space-96` (0, 2, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96 px).
- **Scala Tailwind** sovrascritta: 0, 0.5=2, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 7=28, 8=32, 10=40, 12=48, 14=56, 16=64, 20=80, 24=96.
- **Importante**: la scala Tailwind e' compressa rispetto al default (es. `p-4` = 16px non 16, `p-6` = 24px). Documentero' la mappatura esatta.
- **Utility ritmo verticale**:
  - `.section-spacing` margin-block 32px
  - `.block-spacing` margin-block 24px
  - `.item-spacing` margin-block 16px
- **Tabella di uso consigliato per ogni step** (4 micro, 8 dense, 12 inline, 16 default, 24 block, 32 section, 48+ hero).

#### 4. Border-radius & Shadows (ausiliari layout)
- Radius: `sm` 8px, `md` 12px, `lg` 16px, `xl` = `--radius` (1rem/16px).
- Shadows: `sm`/`md`/`lg` con valori esatti.

#### 5. Alignment, Padding & Interaction
- **Hit target minimo**: `--hit-min` 44px (WCAG, applicato a bottoni/icone touch).
- **Token card**: `.token-card` = radius lg + shadow md + padding 16.
- **Focus ring globale**: 2px background offset + 2px ring (totale 4px), implementato via box-shadow su `a, button, input, select, textarea, [role=button], [tabindex]`. Sidebar usa offset 2 + ring 5 per visibilita' su scuro.
- **Card pattern** (dal sistema colori): nessuna differenza di sfondo card vs background — distinzione affidata a `border-border` + `shadow-sm`.

#### 6. Pattern di applicazione per layout pagina
Esempi reali di pattern usati dal progetto:
- Header pagina coach: `pt-6 pb-4` con titolo h1/h2 + azione a destra `justify-between`.
- Stack form: `space-y-4` (16px) tra field, `space-y-6` (24px) tra sezioni.
- Card list mobile: `space-y-3` (12px) tra card, `p-4` (16px) interno.
- Bottom nav mobile: shell pagina aggiunge `pb-24` (96px) per evitare overlap.
- Modale full-screen mobile, dialog centrato desktop con `max-w-*` Tailwind.

### Formato output
- File: `/mnt/documents/motion-design-system-typography-layout.md`
- Sezioni con tabelle Markdown per token → valore → uso consigliato
- Snippet di codice con classi Tailwind / variabili CSS effettive del progetto
- Quick-reference cheat-sheet finale di una pagina

Al termine restituiro' un tag `<lov-artifact>` per il download.
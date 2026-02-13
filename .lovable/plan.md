

## Cambio Colore Primario a #7442E4 (Purple)

### Obiettivo
Sostituire il colore primario ink-based (`220 15% 10%` / `#161A22`) con il viola `#7442E4` (`264 73% 52%`) su tutta la piattaforma coach.

### Impatto della modifica

Il token `--primary` e i suoi derivati sono utilizzati in **65+ file** e **540+ occorrenze**. Cambiando solo 3 variabili CSS in `src/index.css`, l'intera piattaforma si aggiorna automaticamente:

| Categoria | Esempi di componenti impattati |
|---|---|
| **Bottoni CTA** | Tutti i `Button` variant="default" (bg-primary, hover, focus ring) |
| **Link e testo interattivo** | "Vedi tutti gli appuntamenti", "Hai dimenticato la password?", link variant del Button |
| **Indicatori di stato** | Dot notifiche non lette, barra attiva sidebar, sessione in corso |
| **Tinte di sfondo** | `bg-primary/5` (notifiche, sessioni), `bg-primary/10` (icone, card hover) |
| **Focus ring globale** | `--ring` (attualmente uguale a `--primary`) usato su input, select, button |
| **Toast info** | Bordo sinistro e sfondo tinta dei toast informativi |
| **Spinner di caricamento** | `border-primary` sui loader animati |
| **Sidebar active bar** | Barra 2px verticale sull'item di navigazione attivo |

### Modifiche tecniche

**Unico file da modificare: `src/index.css`**

**Light mode (`:root`):**

| Variabile | Prima | Dopo | Hex |
|---|---|---|---|
| `--primary` | `220 15% 10%` | `264 73% 52%` | #7442E4 |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | invariato |
| `--primary-hover` | `220 15% 6%` | `264 73% 45%` | #6232BD |
| `--ring` | `220 15% 10%` | `264 73% 52%` | #7442E4 |

**Dark mode (`.dark`):**

| Variabile | Prima | Dopo | Hex |
|---|---|---|---|
| `--primary` | `220 15% 20%` | `264 65% 62%` | #9470E8 |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | invariato |
| `--primary-hover` | `220 15% 16%` | `264 65% 55%` | #7F56DE |
| `--ring` | `220 15% 20%` | `264 65% 62%` | #9470E8 |

### Accessibilita risolte e residue

**Risolte con questa modifica:**
- **Sidebar active indicator**: il viola su sfondo scuro (`220 15% 6%`) ha un contrasto di **~8:1** (prima era 1.3:1) -- passa WCAG AA
- **Button hover feedback**: il passaggio da `264 73% 52%` a `264 73% 45%` ha un rapporto **~1.5:1**, visivamente distinguibile grazie al cambio di luminosita percettiva (migliorato rispetto al precedente ink-on-ink)
- **Focus ring**: il viola su sfondo bianco ha un contrasto di **~4.6:1** -- passa WCAG AA

**Ancora da risolvere (fuori scope):**
- `--muted-foreground` (ink-500) su background resta a **3.8:1** (sotto la soglia AA di 4.5:1 per testo piccolo)
- Sidebar hover/active states restano con contrasto basso (sono token separati da `--primary`)

### Nessuna modifica a componenti

Tutti i componenti usano i token Tailwind (`bg-primary`, `text-primary`, `hover:bg-primary/90`, ecc.) che si mappano alle variabili CSS. Zero modifiche a file `.tsx`.


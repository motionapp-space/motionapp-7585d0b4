

# Gradiente radiale sulla pagina di Login

## Obiettivo
Sostituire lo sfondo piatto della pagina `/auth` con un **gradiente radiale** che parte dal bianco editoriale e sfuma verso il nero ink, con centro posizionato in **basso a destra**.

## Colori utilizzati (dal design system)
- **Bianco**: `hsl(220, 14%, 98%)` — corrispondente a `--background` / `--card`
- **Nero**: `hsl(220, 15%, 6%)` — corrispondente a `--foreground` / `--ink-950`

## Modifica

**File**: `src/pages/Auth.tsx`

Riga attuale:
```tsx
<div className="flex min-h-screen items-center justify-center bg-[hsl(0,0%,96%)] p-4">
```

Nuova riga:
```tsx
<div
  className="flex min-h-screen items-center justify-center p-4"
  style={{
    background: "radial-gradient(circle at bottom right, hsl(220 14% 98%), hsl(220 15% 6%))"
  }}
>
```

## Dettagli tecnici
- Si usa `style` inline perche Tailwind non supporta nativamente `radial-gradient` con posizionamento personalizzato.
- `circle at bottom right` posiziona il centro del gradiente nell'angolo in basso a destra: il bianco si irradia da li e sfuma progressivamente verso il nero ink.
- Il vecchio colore `hsl(0,0%,96%)` (grigio generico fuori palette) viene rimosso.
- Nessun altro file viene modificato.

## Impatto visivo
- L'angolo in basso a destra sara luminoso (bianco editoriale).
- Il contenuto centrale (form di login) si trovera in una zona di transizione.
- L'angolo in alto a sinistra sara il piu scuro (nero ink).
- I testi e i campi del form mantengono la leggibilita grazie ai colori `card` / `foreground` gia in uso.


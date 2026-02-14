

# Tabs: da 3 colori a 2 (muted + ice pill)

## Problema attuale
Il TabsTrigger attivo usa `bg-background` (bianco) + `border-b-2 border-accent` (underline), creando 3 layer visivi: muted (list) + bianco (pill attiva) + accent (underline). Troppo rumore.

## Soluzione
Pill neutra con tint ice sull'attivo, senza underline ne sfondo bianco.

## Modifiche in `src/components/ui/tabs.tsx`

### TabsList (riga 15)
Da:
```
rounded-md bg-muted p-1
```
A:
```
rounded-full bg-muted/60 p-1
```

### TabsTrigger (riga 30)
Sostituire l'intera stringa di classi con:
```
inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm text-muted-foreground ring-offset-background transition-all
hover:bg-[hsl(var(--accent-soft-2))]
data-[state=active]:bg-[hsl(var(--accent-soft-6))]
data-[state=active]:text-foreground
data-[state=active]:font-medium
data-[state=active]:border
data-[state=active]:border-[hsl(var(--selection-border))]
data-[state=active]:shadow-none
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:pointer-events-none disabled:opacity-50
```

### Rimosso
- `data-[state=active]:bg-background` (pill bianca)
- `data-[state=active]:border-b-2 border-[hsl(var(--accent))]` (underline accent)
- `data-[state=active]:rounded-b-none`
- `font-medium` dal default (ora solo sull'attivo)

### Risultato
- **2 colori soli**: muted/60 (contenitore) + accent-soft-6 (pill attiva)
- Hover ice leggero (`accent-soft-2`)
- Border sottile `selection-border` sulla pill attiva
- `font-medium` solo sullo stato attivo per gerarchia senza rumore

Unico file modificato: `src/components/ui/tabs.tsx`


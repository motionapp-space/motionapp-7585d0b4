
# Piano Fix: InviteLinkDialog con Helper Function

## Diagnosi Confermata

Il componente `src/pages/Clients.tsx` ha **3 return separati** (ZERO_CLIENTS, FIRST_CLIENT_NO_CONTENT, ACTIVE_USER) e `InviteLinkDialog` è renderizzato solo nell'ultimo. Quando il coach crea un cliente con invito mentre è in stato ZERO_CLIENTS, il dialog non appare.

## Soluzione: Helper Function `renderInviteDialog()`

Creare una funzione helper per evitare duplicazione di codice e garantire consistenza.

### Modifiche

**File**: `src/pages/Clients.tsx`

#### Parte 1: Aggiungere funzione helper (dopo le altre funzioni handler, circa riga 270)

```typescript
// Helper per renderizzare il dialog invito in tutti gli stati di onboarding
const renderInviteDialog = () =>
  inviteDialogData ? (
    <InviteLinkDialog
      open
      onOpenChange={(open) => !open && handleCloseInviteDialog()}
      inviteLink={inviteDialogData.inviteLink}
      clientName={inviteDialogData.clientName}
      email={inviteDialogData.email}
      expiresAt={inviteDialogData.expiresAt}
      emailSent={inviteDialogData.emailSent}
      emailError={inviteDialogData.emailError}
      onClose={handleCloseInviteDialog}
    />
  ) : null;
```

#### Parte 2: Aggiungere `{renderInviteDialog()}` nel return ZERO_CLIENTS

Prima della chiusura `</div>` finale (circa riga 512-513):

```typescript
        </AlertDialog>
        
        {renderInviteDialog()}
      </div>
    );
  }
```

#### Parte 3: Aggiungere `{renderInviteDialog()}` nel return FIRST_CLIENT_NO_CONTENT

Prima della chiusura `</div>` finale (circa riga 1086-1087):

```typescript
        </AlertDialog>
        
        {renderInviteDialog()}
      </div>
    );
  }
```

#### Parte 4: Sostituire il blocco esistente nel return ACTIVE_USER

Righe 1681-1694:

```typescript
// PRIMA
{inviteDialogData && (
  <InviteLinkDialog
    open={!!inviteDialogData}
    onOpenChange={(open) => !open && handleCloseInviteDialog()}
    inviteLink={inviteDialogData.inviteLink}
    clientName={inviteDialogData.clientName}
    email={inviteDialogData.email}
    expiresAt={inviteDialogData.expiresAt}
    emailSent={inviteDialogData.emailSent}
    emailError={inviteDialogData.emailError}
    onClose={handleCloseInviteDialog}
  />
)}

// DOPO
{renderInviteDialog()}
```

## Riepilogo

| Sezione | Modifica |
|---------|----------|
| Helper function | Creare `renderInviteDialog()` dopo gli handler |
| ZERO_CLIENTS return | Aggiungere `{renderInviteDialog()}` prima di `</div>` |
| FIRST_CLIENT_NO_CONTENT return | Aggiungere `{renderInviteDialog()}` prima di `</div>` |
| ACTIVE_USER return | Sostituire blocco inline con `{renderInviteDialog()}` |

## Vantaggi

- Zero duplicazione di codice
- Se aggiungi props al dialog, modifichi solo la funzione helper
- Se aggiungi un 4° stato di onboarding, basta aggiungere una riga
- Meno rischio di regressioni rispetto al refactoring totale con `let content`

## Risultato Atteso

- Quando il coach in qualsiasi stato crea un cliente con invito, il dialog appare
- Cliccando "Vai alla scheda cliente", naviga a `/clients/{id}`

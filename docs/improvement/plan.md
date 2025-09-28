# Piano di Miglioramento

## Obiettivi Prioritari
1. Sostituire i placeholder grafici con immagini fornite dal cliente.
2. Introdurre controlli di zoom/pan fluidi con centratura automatica del nodo selezionato.
3. Implementare filtri avanzati (ruolo, mansione, sede) e ricerca globale.
4. Permettere la modifica della gerarchia (aggiungi/sposta/elimina) con undo/redo.
5. Preparare l'esportazione verso altri sistemi (JSON + CSV personalizzata).

## Roadmap
- **Fase 1**: Rifattorizzare parsing CSV, arricchire metadati e card UI (completata).
- **Fase 2**: Interazioni avanzate (zoom/pan, filtri dinamici, focus automatico).
- **Fase 3**: Editing completo e salvataggio su backend / file.
- **Fase 4**: Ottimizzazione performance (virtualizzazione, memoization) e test end-to-end.

## Rischi & Mitigazioni
- Variabilità del CSV → introdurre schema validation.
- Performance su dataset grandi → pianificare virtualizzazione / chunk loading.
- UX complessa → prototipare con mockup e raccolta feedback.

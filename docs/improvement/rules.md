# Regole di Miglioramento UI

1. **Consistenza dei dati**: ogni nodo deve avere `badge`, `mansione`, `qualificazione`, `age`, `order` nei metadati.
2. **Esperienza d'uso**: tutte le interazioni (toggle, drag, filtri) devono recentrare automaticamente il nodo attivo.
3. **Accessibilità**: contrasti colore ≥ 4.5:1, testi descrittivi per badge e pulsanti, ALT sulle immagini.
4. **Performance**: evitare ricalcoli inutili; usare memoization per alberi e selettori.
5. **Scalabilità**: ogni nuova feature deve aggiungere entry nel piano (`plan.md`) e rispettare naming slugify.

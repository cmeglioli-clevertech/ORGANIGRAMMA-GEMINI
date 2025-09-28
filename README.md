# Clevertech Organizational Chart

Webapp

Questo progetto è una **webapp
interattiva** per visualizzare l’organigramma di Clevertech.

L’applicazione legge un file CSV con l’elenco del personale e costruisce una
gerarchia a più livelli (sedi ➔ dipartimenti ➔ uffici ➔ persone).

Ogni nodo mostra informazioni come la mansione, l’età e l’ordine di priorità e
può essere espanso o collassato per navigare facilmente la struttura aziendale.

## [Funzionalità

principali]()

·
**Visualizzazione gerarchica** – L’organigramma è rappresentato ad albero: partendo dalla sede
centrale vengono mostrate sedi, dipartimenti e uffici fino ad arrivare alle
singole persone.

·
**Espansione/chiusura dei rami** – Cliccando sul pulsante +/– è possibile espandere o comprimere i rami
dell’albero per esplorare solo la parte desiderata.

·
**Badge colorati** – Ogni tipo di nodo (root, CEO, sede, dipartimento, ufficio, persona)
è contraddistinto da un badge colorato per riconoscerne rapidamente il ruolo.

·
**Immagini e dettagli** – Per ogni nodo sono visualizzati nome, qualifica, mansione, età ed
un’immagine (o una foto generata automaticamente se non disponibile).

·
**Dataset personalizzabile** – I dati sono letti dal file _Suddivisione Clevertech light.csv. Puoi sostituire questo file con un tuo CSV mantenendo le stesse
colonne (Nome, Sede, Foto, Dipartimento, Ufficio, Mansione, Qualifica,
Ordinamento, Età) per creare un organigramma personalizzato.

## [Come eseguire il progetto localmente]()

**Prerequisiti**

[Node.js](https://nodejs.org/) versione 16 o successiva.

**Clona o scarica questo
repository** nel tuo ambiente locale.

 **Installa le dipendenze** :

    npm install

(Facoltativo) **Configura la
chiave API Gemini** se desideri usare funzionalità sperimentali: crea un file
.env.local nella radice del progetto e
aggiungi:

    GEMINI_API_KEY=la-tua-chiave

 **Avvia l’applicazione in
modalità sviluppo** :

    npm run dev

Il server di sviluppo parte in
genere su http://localhost:3000. Apri quel URL nel
browser per vedere l’organigramma.

## [Struttura

dei file]()

·
index.html – Pagina HTML di base che importa React via CDN, include
Tailwind CSS e carica il modulo index.tsx.

·
index.tsx – Punto di ingresso dell’app React; monta il componente App sull’elemento #root.

·
App.tsx – Legge il CSV, lo analizza in un array di dipendenti, costruisce
l’albero dell’organigramma e gestisce lo stato dell’interfaccia (caricamento,
errori, espansioni).

·
components/OrgChartNode.tsx – Componente ricorsivo che rende ogni nodo dell’albero con badge,
immagine e pulsante di espansione/collassamento.

·
types.ts – Definisce i tipi Node e NodeMetadata utilizzati in tutta
l’applicazione.

·
_Suddivisione Clevertech light.csv – Dataset dei dipendenti (puoi sostituirlo con i tuoi dati).

## [Contributi]()

Se vuoi migliorare questa webapp (ad esempio aggiungendo filtri di
ricerca, export dell’albero o ottimizzando l’ordinamento), sentiti libero di
aprire una issue o una pull request. Ogni contributo è benvenuto!

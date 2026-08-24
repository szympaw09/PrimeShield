# PrimeShield PPF — koncepcja strony (v5)

Statyczna, jednoplikowa makieta strony głównej PrimeShield. Bez frameworków i bez builda — otwórz `index.html` w przeglądarce albo wystaw folder przez GitHub Pages.

## Uruchomienie na GitHub Pages

1. Wrzuć zawartość tego repo (na razie `index.html` + folder `assets/`) na branch `main`.
2. W ustawieniach repo: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Strona będzie dostępna pod `https://<twoj-user>.github.io/<nazwa-repo>/`.

## Struktura

Wszystkie pliki leżą płasko, bez podfolderów (żeby dało się je bez problemu przeciągnąć na GitHub przez "Upload files"):

```
index.html
szablony.html     — podstrona z wyszukiwarką bazy formatek
style.css
script.js
favicon.jpg       — ikonka karty przeglądarki
logo-simple.png   — wordmark PrimeShield w nagłówku i stopce
founder.webp      — zdjęcie Szymona Pawlińskiego w sekcji zespołu
```

## Uwaga dot. bramki cenowej

Cennik ma prostą blokadę cen odblokowywaną po wysłaniu formularza z poprawnym numerem NIP (walidacja sumy kontrolnej po stronie przeglądarki). To wyłącznie efekt wizualny — dane cenowe nadal są obecne w kodzie źródłowym strony. Do prawdziwego wdrożenia ceny powinny być pobierane z backendu dopiero po weryfikacji.

## Status

To wciąż koncepcja robocza, nie finalna wersja produkcyjna — treści, ceny i dane techniczne wymagają jeszcze przejrzenia przed publikacją.

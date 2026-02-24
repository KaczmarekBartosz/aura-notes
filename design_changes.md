# Dokumentacja zmian UI/UX (Aura Notes - Wersja 2026)

## Architektura stylów
Ze względu na dążenie do minimalistycznych trendów z 2026 roku, zaimplementowano dwa przeciwstawne koncepty wizualne oparte na silnym użyciu **Glassmorphismu** z wstrzykiwanym, rozmytym wektorem tła ("Aura").

- **Obsidian Glass (Domyślny, Dark Theme)** - Motyw "Knowledge Vault", skierowany dla profesjonalistów pracujących w nocy. Gasi jaskrawość ekranu, polega na głębokiej czerni z ledwo przenikającą aurą i mikroskopijnymi smugami światła na krawędziach szkła. 
- **Visionary Frost (Jasny, Apple Vision Pro Style)** - Motyw naśladujący oprogramowanie przestrzenne. Czysta, świetlista biel z najwyższym stopniem przezroczystości szyb. Typografia w tym trybie posiada wysoki kontrast AAA i polega na cieniach `drop-shadow` budujących trójwymiarowe nachylenie kart nad lewitującym tłem.

## Zmiany względem starego designu (Luty 2026)
1. **Zlikwidowano plik \`index_redesign.html\`**
   Plik ten służył wyłącznie jako pole robocze (mockup) i środowisko bez API do zaprojektowania pierwszej wersji Obsidian Glass. Obecnie logika UI jest w pełni zawarta i operacyjna w pliku `index.html`.
2. **Dodano przełącznik Theme Switcher**
   Użytkownik ma do dyspozycji przycisk ze słoneczkiem/księżycem w lewym górnym rogu. Zmiany zapamiętywane są dzięki API `localStorage` po stronie przeglądarki i błyskawicznie aplikują zbiór zmiennych CSS podczepionych pod atrybut `data-theme="light"`.
3. **Standaryzacja Zmiennych CSS (`:root`)**
   Usunięto hardcodowane transparentne kolory i kolory krawędzi (np. `rgba(255,255,255,0.05)`) przenosząc je na pełnoprawne zmienne typu `--glass-border`, `--input-bg`, `--tag-chip-bg`, by móc elastycznie zarządzać kontrastem oddzielnie dla jasnego jak i ciemnego widoku.
4. **Wizualna hierarchia Markdown**
   Dla obu trybów ujednolicono system podświetlania (PrismJS) - ciemny motyw korzysta z technologii neon, a jasny korzysta z pastelowego wygładzenia struktury szkieletowej (bloki `#f1f5f9`).
5. **Animacje Tła (Aura i Noise overlay)**
   Zachowano stały efekt mikro-poruszania się blików świetlnych w tle. Generuje to efekt organiczności i niweluje poczucie "statyczności" w tak minimalistycznym UI. Dla jasnego trybu opacity aury zostało obniżone by nie odbijać promieniowania światła.

*Dokument autogenerowany podczas automatycznej przebudowy Themu.*

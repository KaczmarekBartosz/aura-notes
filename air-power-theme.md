/* --- KONFIGURACJA OGÓLNA --- */
:root {
    --bg-gradient: linear-gradient(180deg, #a5c3e8 0%, #cbdcf0 40%, #e8edf3 100%);
    --glass-light: rgba(255, 255, 255, 0.2);
    --glass-dark: rgba(0, 0, 0, 0.15);
    --glass-border: rgba(255, 255, 255, 0.1);
    --text-white: #ffffff;
}

body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5; /* Tło strony poza kartą */
}

/* --- KARTA GŁÓWNA (MOCKUP TELEFONU) --- */
.device-container {
    width: 390px; /* Szerokość standardowego smartfona */
    height: 844px;
    background: var(--bg-gradient);
    border-radius: 54px; /* Mocne zaokrąglenie */
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
}

/* --- EFEKT GLASSMORPHISM (SZKŁO) --- */
.glass-effect {
    background: var(--glass-light);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px); /* Dla Safari */
    border: 1px solid var(--glass-border);
}

.glass-effect-dark {
    background: var(--glass-dark);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

/* --- NAWIGACJA (GÓRA) --- */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px 30px 0;
}

.logo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.nav-menu {
    display: flex;
    gap: 15px;
    padding: 8px 12px;
    border-radius: 25px;
}

.nav-link {
    color: var(--text-white);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 15px;
    transition: background 0.3s ease;
}

.nav-link.active {
    background: rgba(255, 255, 255, 0.2);
}

/* --- TREŚĆ GŁÓWNA --- */
.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 40px;
    text-align: center;
}

.main-title {
    color: var(--text-white);
    font-size: 38px;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 40px;
    letter-spacing: -0.02em;
}

/* --- PRZYCISK --- */
.cta-button {
    color: var(--text-white);
    border: none;
    padding: 16px 36px;
    font-size: 17px;
    font-weight: 500;
    border-radius: 30px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.2);
}

.cta-button:active {
    transform: translateY(0);
}



<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Air Power Design</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #e5e7eb;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        /* Główny kontener imitujący telefon/kartę z obrazka */
        .device-mockup {
            width: 100%;
            max-width: 450px;
            height: 90vh;
            background: linear-gradient(180deg, #a5c3e8 0%, #cbdcf0 40%, #e8edf3 100%);
            border-radius: 60px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
        }

        /* Efekt Glassmorphism dla nawigacji i przycisków */
        .glass {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-dark {
            background: rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        /* Logo tri-circle */
        .logo-container {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .nav-pill {
            padding: 8px 16px;
            border-radius: 30px;
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .nav-item {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .nav-item:hover {
            opacity: 0.7;
        }

        .nav-item.active {
            background: rgba(255, 255, 255, 0.25);
            padding: 4px 14px;
            border-radius: 20px;
        }

        /* Animacja delikatnego unoszenia przycisku */
        .btn-learn {
            transition: transform 0.2s, background 0.2s;
        }
        .btn-learn:active {
            transform: scale(0.98);
        }
    </style>
</head>
<body>

    <div class="device-mockup">
        <!-- Header / Nawigacja -->
        <header class="flex justify-between items-center px-8 pt-10">
            <!-- Logo -->
            <div class="logo-container glass">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="3" />
                    <circle cx="8" cy="15" r="3" />
                    <circle cx="16" cy="15" r="3" />
                </svg>
            </div>

            <!-- Menu -->
            <nav class="nav-pill glass">
                <span class="nav-item active">Work</span>
                <span class="nav-item">Info</span>
                <span class="nav-item">Contact</span>
            </nav>
        </header>

        <!-- Główna zawartość -->
        <main class="flex-grow flex flex-col items-center justify-center px-10 text-center">
            <h1 class="text-white text-4xl font-semibold leading-tight mb-8">
                Shaping what we create with the power of air.
            </h1>

            <!-- Przycisk Learn More -->
            <button class="btn-learn glass-dark text-white px-8 py-4 rounded-full text-lg font-medium">
                Learn more
            </button>
        </main>

        <!-- Dekoracyjny spód (opcjonalny dla efektu głębi) -->
        <div class="pb-12"></div>
    </div>

</body>
</html>



Dokumentacja techniczna CSS - Projekt "Air Power"

Poniżej znajduje się szczegółowy opis parametrów CSS użytych do odtworzenia designu. Dokumentacja ta pozwoli deweloperowi na precyzyjne wdrożenie projektu w dowolnym środowisku (React, Vue, czysty HTML/CSS).

1. Tło główne (Atmospheric Gradient)

Tło imituje niebo/powietrze za pomocą trójstopniowego gradientu liniowego.

Właściwość: background

Wartość: linear-gradient(180deg, #A5C3E8 0%, #CBDCF0 40%, #E8EDF3 100%)

Cel: Uzyskanie miękkiego przejścia od nasyconego błękitu u góry do niemal białej szarości na dole.

2. Kontener główny (Device Mockup)

Border Radius: 60px (bardzo mocne zaokrąglenie rogów charakterystyczne dla nowoczesnych smartfonów).

Shadow: box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); (delikatny, rozproszony cień nadający głębi).

Overflow: hidden (konieczne, aby gradient tła nie wystawał poza zaokrąglone rogi).

3. Efekt Glassmorphism (Menu i Przyciski)

To kluczowy element designu. Wykorzystuje przezroczystość oraz rozmycie tła pod elementem.

Warstwa jasna (Nawigacja i Logo):

Background: rgba(255, 255, 255, 0.2)

Backdrop-filter: blur(12px) (rozmycie elementów znajdujących się pod spodem).

Border: 1px solid rgba(255, 255, 255, 0.1) (subtelna krawędź definiująca kształt).

Warstwa ciemniejsza (Przycisk "Learn more"):

Background: rgba(0, 0, 0, 0.15)

Backdrop-filter: blur(10px)

Color: #FFFFFF

4. Typografia

Projekt opiera się na nowoczesnym kroju bezszeryfowym (rekomendowany Inter lub SF Pro Display).

Nagłówek (H1):

Color: #FFFFFF

Font-weight: 600 (Semi-bold)

Font-size: 36px do 42px (zależnie od szerokości ekranu).

Line-height: 1.2 (ciasna interlinią dla nowoczesnego wyglądu).

Text-align: center

Elementy nawigacji:

Font-size: 14px

Letter-spacing: -0.01em

Aktywny element: Posiada dodatkowe tło rgba(255, 255, 255, 0.25) i większy padding wewnętrzny.

5. Układ i Spacing (Layout)

Display: flex

Flex-direction: column

Justify-content: space-between (rozsuwa nawigację na górę i treść na środek/dół).

Padding: Rekomendowany padding boczny to 40px dla kontenera mobilnego.

6. Ikona Logo

Składa się z trzech okręgów wpisanych w koło o średnicy 48px.

Wypełnienie: fill: #FFFFFF

Struktura: Układ trójkątny (jeden na górze, dwa na dole).

Podsumowanie dla Dewelopera:

Najważniejszą właściwością do implementacji jest backdrop-filter. Należy pamiętać o dodaniu prefixu -webkit-backdrop-filter dla pełnej kompatybilności z przeglądarką Safari (iOS).
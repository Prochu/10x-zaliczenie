# Kompleksowy Plan Testów - Projekt "10x-zaliczenie"

## 1. Wprowadzenie i cele testowania
Niniejszy dokument określa strategię i plan działań QA dla platformy do przewidywania wyników meczów piłkarskich. Głównym celem jest zapewnienie niezawodności systemu punktacji, bezpieczeństwa danych użytkowników oraz płynności działania interfejsu opartego na technologiach Astro i React.

**Cele główne:**
*   Weryfikacja poprawności algorytmu naliczania punktów.
*   Zapewnienie bezpieczeństwa bazy danych poprzez testy reguł RLS w Supabase.
*   Potwierdzenie stabilności integracji z zewnętrznym Football API.
*   Gwarancja wysokiej jakości UX w procesie obstawiania.

## 2. Zakres testów
### Wchodzi w zakres:
*   Proces autentykacji i autoryzacji (Supabase Auth).
*   Logika stawiania zakładów (walidacja czasu, limity).
*   Automatyczna synchronizacja meczów i wyników (Cron jobs).
*   Obliczanie punktów i generowanie rankingu.
*   Responsywność interfejsu użytkownika (Desktop/Mobile).
*   Obsługa błędów API i stanów pustych (Empty States).

### Poza zakresem:
*   Testy penetracyjne infrastruktury DigitalOcean (poza warstwą aplikacji).
*   Testy wydajnościowe zewnętrznego Football API.

## 3. Typy testów do przeprowadzenia
*   **Testy jednostkowe (Unit Tests):** Weryfikacja funkcji pomocniczych, serwisu `scoringService.ts` oraz walidatorów danych.
*   **Testy integracyjne (Integration Tests):** Sprawdzenie komunikacji między API Astro a bazą danych Supabase oraz poprawności działania `matchSyncService.ts`.
*   **Testy E2E (End-to-End):** Symulacja pełnych ścieżek użytkownika: od rejestracji, przez postawienie zakładu, po sprawdzenie miejsca w rankingu.
*   **Testy bezpieczeństwa:** Weryfikacja reguł Row Level Security (RLS) w Supabase.
*   **Testy regresji:** Uruchamiane po każdej zmianie w kodzie, aby upewnić się, że nowe funkcje nie psują istniejących (np. po aktualizacji Tailwind lub Astro).

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Obszar: Autentykacja
*   **TC-01:** Rejestracja nowego użytkownika z poprawnymi danymi.
*   **TC-02:** Próba logowania nieistniejącego użytkownika (oczekiwany błąd).
*   **TC-03:** Odzyskiwanie hasła poprzez link e-mail.

### 4.2. Obszar: Obstawianie meczów
*   **TC-04:** Postawienie zakładu na mecz, który jeszcze się nie rozpoczął.
*   **TC-05:** Próba edycji zakładu na 1 minutę przed meczem i 1 minutę po rozpoczęciu (walidacja blokady).
*   **TC-06:** Walidacja formularza: próba wysłania pustego wyniku lub wartości ujemnych.

### 4.3. Obszar: Punktacja i Ranking
*   **TC-07:** Weryfikacja naliczenia 3 pkt za dokładny wynik (np. obstawione 2:1, wynik 2:1).
*   **TC-08:** Weryfikacja naliczenia 1 pkt za trafienie rozstrzygnięcia (np. obstawione 1:0, wynik 3:0).
*   **TC-09:** Sprawdzenie poprawności sortowania w tabeli Leaderboard po aktualizacji punktów.

### 4.4. Obszar: Synchronizacja (Cron)
*   **TC-10:** Ręczne wywołanie endpointu `/api/cron/sync` i sprawdzenie, czy nowe mecze pojawiły się w bazie.
*   **TC-11:** Symulacja błędu zewnętrznego API (np. 500) i weryfikacja, czy aplikacja nie ulega awarii.

## 5. Środowisko testowe
*   **Lokalne:** Środowisko deweloperskie z wykorzystaniem Supabase CLI (lokalna instancja bazy).
*   **Staging:** Kopia środowiska produkcyjnego na DigitalOcean (osobny projekt Supabase) do testów akceptacyjnych.
*   **Przeglądarki:** Chrome, Firefox, Safari, Edge oraz przeglądarki mobilne (iOS Safari, Android Chrome).

## 6. Narzędzia do testowania
*   **Vitest:** Główny runner dla testów jednostkowych i integracyjnych.
*   **Playwright:** Automatyzacja testów E2E w różnych przeglądarkach.
*   **Supabase CLI:** Testowanie migracji i reguł RLS.
*   **Postman / Thunder Client:** Testy manualne endpointów API.
*   **GitHub Actions:** Automatyczne uruchamianie testów przy każdym Pull Request.

## 7. Harmonogram testów
1.  **Faza 1 (Development):** Pisanie testów jednostkowych równolegle z kodem funkcjonalnym.
2.  **Faza 2 (Integration):** Testy integracyjne po zakończeniu prac nad modułami API i DB.
3.  **Faza 3 (Regression & E2E):** Pełne cykle testowe przed wdrożeniem na produkcję.
4.  **Faza 4 (UAT):** Testy akceptacyjne użytkownika na środowisku staging.

## 8. Kryteria akceptacji testów
*   100% testów E2E dla ścieżki krytycznej (logowanie -> zakład -> ranking) zakończonych sukcesem.
*   Brak otwartych błędów o priorytecie "Krytyczny" i "Wysoki".
*   Pokrycie testami jednostkowymi logiki biznesowej (scoring, validation) na poziomie min. 90%.
*   Poprawne przejście testów bezpieczeństwa RLS (brak możliwości wycieku danych).

## 9. Role i odpowiedzialności
*   **QA Engineer:** Tworzenie scenariuszy, automatyzacja testów, raportowanie błędów.
*   **Frontend/Backend Developer:** Pisanie testów jednostkowych, naprawa zgłoszonych błędów.
*   **DevOps:** Konfiguracja CI/CD i środowisk testowych.
*   **Product Owner:** Ostateczna akceptacja wyników testów (UAT).

## 10. Procedury raportowania błędów
Wszystkie błędy powinny być zgłaszane w systemie śledzenia zadań (np. GitHub Issues) i zawierać:
1.  **Tytuł:** Krótki i opisowy.
2.  **Kroki do reprodukcji:** Lista kroków pozwalająca wywołać błąd.
3.  **Oczekiwany rezultat:** Jak system powinien się zachować.
4.  **Rzeczywisty rezultat:** Co się stało w rzeczywistości.
5.  **Środowisko:** Przeglądarka, system operacyjny, wersja aplikacji.
6.  **Priorytet:** (Bloker, Wysoki, Średni, Niski).
7.  **Załączniki:** Zrzuty ekranu, logi z konsoli lub nagrania wideo.

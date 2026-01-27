# Aplikacja - BetBuddy (MVP)

## Główny problem

Możliwość obstawiania meczów Ligi Mistrzów w zamkniętym gronie znajomych. Dzięki wykorzystaniu zewnętrznego API aplikacja pobiera automatycznie dane o nadchodzących meczach, a w trakcie ich trwania aktualizuje wyniki i przelicza punkty dla poszczególnych użytkowników.

## Najmniejszy zestaw funkcjonalności

    - Automatyczne pobieranie listy nadchodzących meczów LM z zewnętrznego API
    - Wyświetlanie w przejrzysty sposób listy nadchodzących meczów
    - Wyświetlanie w przejrzysty sposób tabeli z wynikami poszczególnych graczy
    - Wyświetlanie w przejrzysty sposób listy nadchodzących meczów
    - Możliwość oddawania własnych typów do czasu rozpoczęcia meczu.
    - Automatyczna aktualizacja wyników w trakcie trwania poszczególnych meczów.
    - Automatyczne przeliczanie punktacji poszczególnych graczy na podstawie typów oraz aktualnych wyników.
    - Ograniczenie liczby zapytań do zewnętrznego API aby nie przekroczyć maksymalnego dziennego limitu
    - Prosty system kont użytkowników aby powiązać oddawane typy z użytkownikami
    - Prosty system punktacji za prawidłowe wytypowanie wyników

## Co NIE wchodzi w zakres MVP

    - Możliwość zakładania własnych grup użytkowników
    - Różne modele punktacji za prawidłowe obstawianie meczów
    - Przyznawanie dodatkowych punktów (bonusów) za typy inne niż wynik meczu

## Kryteria sukcesu

    - Aplikacja w sposób prosty i przejrzysty prezentuje listę aktulanie rozgrywancyh meczów oraz listę wyników poszczególnych graczy
    - Aplikacja prawidłowo przydziela punkty użytkownikom w na podstawie wyników meczów oraz oddanych typów
    - Aplikacja z maksymalną możliwą częstotliwośćią pobiera dane o wynikach w trakcie trwania meczów
    - Aplikacja nie wysyła "zbędnych/namiarowych" zapytań do API

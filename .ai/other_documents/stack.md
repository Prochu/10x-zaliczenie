Stack technologiczny — BetBuddy
Backend
ASP.NET Core 8.0 Web API
RESTful API dla wszystkich operacji
Wbudowane wsparcie dla OAuth/OIDC (Google, Facebook, Apple)
SignalR dla aktualizacji w czasie rzeczywistym (leaderboard, wyniki)
Background services (Hangfire lub IHostedService) do cyklicznego pobierania danych z API
Entity Framework Core jako ORM
Koszt: $0 (open source)
Dodatkowe biblioteki:
Microsoft.AspNetCore.Authentication.Google/Facebook/Apple
Microsoft.AspNetCore.SignalR
Hangfire (opcjonalnie, do zarządzania zadaniami w tle)
AutoMapper (mapowanie DTO)
FluentValidation (walidacja)
Frontend
Opcja 1: Blazor Server (rekomendowana dla MVP)
C# end-to-end
SignalR out-of-the-box
Material Design: MudBlazor lub Blazorise
Koszt: $0
Opcja 2: Blazor WebAssembly
C# w przeglądarce
Wymaga osobnego hostingu dla statycznych plików
Koszt: $0 (hosting statyczny może być darmowy)
Opcja 3: React + TypeScript
Material-UI (MUI) lub React Material Design
Axios do komunikacji z API
SignalR Client dla real-time
Koszt: $0 (open source)
Rekomendacja: Blazor Server dla MVP (szybszy start, mniej infrastruktury).
Baza danych
Opcja 1: SQL Server Express (darmowa)
Do 10 GB na bazę
Wystarczająca dla MVP
Koszt: $0
Opcja 2: Azure SQL Database Basic
Zarządzana, skalowalna
Koszt: ~$5-7/mies (Basic tier, 2 GB)
Opcja 3: PostgreSQL (darmowa)
Open source, dobra wydajność
Wymaga zmiany ORM (np. Npgsql)
Koszt: $0
Rekomendacja: SQL Server Express na początku, migracja do Azure SQL Database Basic przy wzroście.
Hosting
Opcja 1: Azure App Service (rekomendowana)
Free tier: 1 GB storage, 60 min CPU/dzień, subdomena azurewebsites.net
Basic B1: ~$13/mies (1 core, 1.75 GB RAM, własna domena)
Automatyczne wdrożenia z GitHub/GitLab
Wbudowane SSL
Koszt: $0-13/mies
Opcja 2: VPS (Hetzner/DigitalOcean)
Hetzner CPX11: ~€4/mies (2 vCPU, 4 GB RAM)
DigitalOcean Basic: ~$6/mies (1 vCPU, 1 GB RAM)
Wymaga konfiguracji i utrzymania
Koszt: ~$5-10/mies
Opcja 3: Azure Container Apps (nowsza opcja)
Pay-as-you-go
Koszt: ~$5-10/mies (przy niskim ruchu)
Rekomendacja: Azure App Service Free tier na start, upgrade do Basic B1 przy potrzebie.
CI/CD
GitHub Actions
Darmowe dla publicznych repo
2000 min/mies dla prywatnych repo
Automatyczne wdrożenia do Azure
Koszt: $0
Alternatywa: Azure DevOps
Darmowe dla publicznych repo
1800 min/mies dla prywatnych
Koszt: $0
Authentication
ASP.NET Core Identity + OAuth
Wbudowane wsparcie dla Google, Facebook, Apple
Microsoft.AspNetCore.Authentication.Google
Microsoft.AspNetCore.Authentication.Facebook
Microsoft.AspNetCore.Authentication.Apple
Koszt: $0
Real-time updates
SignalR
Wbudowane w ASP.NET Core
Aktualizacje leaderboard i wyników
Koszt: $0
Background jobs
IHostedService (wbudowane)
Pobieranie danych z api-football.com co 10 min
Zarządzanie limitem 100 requestów/dzień
Koszt: $0
Alternatywa: Hangfire
Dashboard, retry, scheduling
Koszt: $0 (open source)
Monitoring i logging
Application Insights (Azure)
Free tier: 5 GB/mies danych
Koszt: $0 (w ramach free tier)
Alternatywa: Serilog + File/Console
Koszt: $0
Szacunkowe koszty miesięczne
Scenariusz 1: Minimalny (Free tier)
Azure App Service Free: $0
SQL Server Express (lokalnie/VPS): $0
GitHub Actions: $0
Application Insights Free: $0
Razem: $0/mies
Scenariusz 2: Produkcyjny (Basic)
Azure App Service Basic B1: ~$13/mies
Azure SQL Database Basic: ~$5/mies
GitHub Actions: $0
Application Insights Free: $0
Razem: ~$18/mies
Scenariusz 3: VPS (alternatywa)
Hetzner CPX11: ~€4/mies (~$4.5)
SQL Server Express (na VPS): $0
GitHub Actions: $0
Razem: ~$4.5/mies
Architektura systemu
Rekomendacja końcowa
MVP (pierwsze 3-6 miesięcy):
Frontend: Blazor Server + MudBlazor
Backend: ASP.NET Core 8 Web API + SignalR
Baza danych: SQL Server Express (lokalnie lub na VPS)
Hosting: Azure App Service Free tier
CI/CD: GitHub Actions
Koszt: $0/mies
Produkcja (po MVP):
Frontend: Blazor Server (lub migracja do WebAssembly)
Backend: ASP.NET Core 8 Web API + SignalR
Baza danych: Azure SQL Database Basic
Hosting: Azure App Service Basic B1
CI/CD: GitHub Actions
Koszt: ~$18/mies
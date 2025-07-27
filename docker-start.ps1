# Script PowerShell pour construire et lancer l'application Angular dans Docker

param(
    [string]$Action = "help"
)

function Show-Help {
    Write-Host "=== SmartPromo Docker Management ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\docker-start.ps1 [ACTION]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions disponibles:" -ForegroundColor Cyan
    Write-Host "  build     - Construire l'image Docker" -ForegroundColor White
    Write-Host "  start     - Démarrer le conteneur" -ForegroundColor White
    Write-Host "  stop      - Arrêter le conteneur" -ForegroundColor White
    Write-Host "  restart   - Redémarrer le conteneur" -ForegroundColor White
    Write-Host "  logs      - Afficher les logs du conteneur" -ForegroundColor White
    Write-Host "  clean     - Nettoyer les images et conteneurs inutilisés" -ForegroundColor White
    Write-Host "  status    - Afficher le statut du conteneur" -ForegroundColor White
    Write-Host "  dev       - Construire et démarrer en mode développement" -ForegroundColor White
    Write-Host "  help      - Afficher cette aide" -ForegroundColor White
    Write-Host ""
}

function Build-Image {
    Write-Host "🔨 Construction de l'image Docker..." -ForegroundColor Yellow
    
    # Vérifier que le build Angular est réussi d'abord
    Write-Host "📦 Construction de l'application Angular..." -ForegroundColor Cyan
    try {
        npm run build --configuration=production
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Build avec optimisation échoué, essai sans optimisation..." -ForegroundColor Yellow
            npm run build --configuration=development
        }
    } catch {
        Write-Host "❌ Erreur lors du build Angular: $_" -ForegroundColor Red
        exit 1
    }
    
    # Construction de l'image Docker
    docker build --no-cache -t smartpromo-app:latest .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Image construite avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la construction de l'image" -ForegroundColor Red
        exit 1
    }
}

function Start-Container {
    Write-Host "🚀 Démarrage du conteneur..." -ForegroundColor Yellow
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conteneur démarré avec succès!" -ForegroundColor Green
        Write-Host "🌐 Application disponible sur: http://localhost:4000" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur lors du démarrage du conteneur" -ForegroundColor Red
    }
}

function Stop-Container {
    Write-Host "🛑 Arrêt du conteneur..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Conteneur arrêté" -ForegroundColor Green
}

function Restart-Container {
    Write-Host "🔄 Redémarrage du conteneur..." -ForegroundColor Yellow
    docker-compose restart
    Write-Host "✅ Conteneur redémarré" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📋 Affichage des logs..." -ForegroundColor Yellow
    docker-compose logs -f smartpromo-app
}

function Clean-Docker {
    Write-Host "🧹 Nettoyage des ressources Docker..." -ForegroundColor Yellow
    docker system prune -f
    docker image prune -f
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Statut du conteneur:" -ForegroundColor Yellow
    docker-compose ps
    Write-Host ""
    Write-Host "📈 Utilisation des ressources:" -ForegroundColor Yellow
    docker stats --no-stream smartpromo-frontend 2>$null
}

function Dev-Mode {
    Write-Host "🛠️ Mode développement - Construction et démarrage..." -ForegroundColor Yellow
    Build-Image
    Start-Container
}

# Exécution basée sur l'action
switch ($Action.ToLower()) {
    "build" { Build-Image }
    "start" { Start-Container }
    "stop" { Stop-Container }
    "restart" { Restart-Container }
    "logs" { Show-Logs }
    "clean" { Clean-Docker }
    "status" { Show-Status }
    "dev" { Dev-Mode }
    "help" { Show-Help }
    default { 
        Write-Host "❌ Action inconnue: $Action" -ForegroundColor Red
        Write-Host ""
        Show-Help 
    }
}

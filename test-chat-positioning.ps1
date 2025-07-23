#!/usr/bin/env pwsh

Write-Host "=== TEST POSITIONNEMENT MESSAGES CHAT ===" -ForegroundColor Cyan
Write-Host ""

# Vérification de la logique dans le fichier TypeScript
Write-Host "🔍 Vérification de la logique de positionnement..." -ForegroundColor Yellow

$chatComponentPath = "src\app\pages\chat\chat.component.ts"
$chatTemplatePath = "src\app\pages\chat\chat.component.html"

if (Test-Path $chatComponentPath) {
    Write-Host "✅ Fichier TypeScript trouvé" -ForegroundColor Green
    
    # Vérifier la méthode ensureCorrectMessageOwnership
    $hasOwnershipMethod = Select-String -Path $chatComponentPath -Pattern "ensureCorrectMessageOwnership" -Quiet
    if ($hasOwnershipMethod) {
        Write-Host "✅ Méthode ensureCorrectMessageOwnership présente" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode ensureCorrectMessageOwnership manquante" -ForegroundColor Red
    }
    
    # Vérifier ChangeDetectorRef
    $hasChangeDetector = Select-String -Path $chatComponentPath -Pattern "ChangeDetectorRef" -Quiet
    if ($hasChangeDetector) {
        Write-Host "✅ ChangeDetectorRef importé et utilisé" -ForegroundColor Green
    } else {
        Write-Host "❌ ChangeDetectorRef manquant" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier chat.component.ts non trouvé" -ForegroundColor Red
}

if (Test-Path $chatTemplatePath) {
    Write-Host "✅ Fichier template HTML trouvé" -ForegroundColor Green
    
    # Vérifier les classes CSS pour le positionnement
    $hasJustifyEnd = Select-String -Path $chatTemplatePath -Pattern "justify-end.*isOwnMessage" -Quiet
    if ($hasJustifyEnd) {
        Write-Host "✅ Classe justify-end conditionnelle présente" -ForegroundColor Green
    } else {
        Write-Host "❌ Classe justify-end conditionnelle manquante" -ForegroundColor Red
    }
    
    $hasMlAuto = Select-String -Path $chatTemplatePath -Pattern "ml-auto.*isOwnMessage" -Quiet
    if ($hasMlAuto) {
        Write-Host "✅ Classe ml-auto conditionnelle présente" -ForegroundColor Green
    } else {
        Write-Host "❌ Classe ml-auto conditionnelle manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier chat.component.html non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== LOGIQUE DE POSITIONNEMENT ===" -ForegroundColor Cyan
Write-Host "📍 Messages expéditeur (isOwnMessage=true):" -ForegroundColor White
Write-Host "   - justify-end : Aligne le conteneur à droite" -ForegroundColor Gray
Write-Host "   - ml-auto : Pousse le message vers la droite" -ForegroundColor Gray
Write-Host "   - Couleur : Bleu (gradient from-blue-600 to-indigo-600)" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Messages destinataire (isOwnMessage=false):" -ForegroundColor White
Write-Host "   - justify-start (par défaut) : Aligne le conteneur à gauche" -ForegroundColor Gray
Write-Host "   - mr-4 : Marge droite pour éviter le bord" -ForegroundColor Gray
Write-Host "   - Couleur : Blanc/Gris (bg-white/90)" -ForegroundColor Gray

Write-Host ""
Write-Host "=== INSTRUCTIONS DE TEST ===" -ForegroundColor Cyan
Write-Host "1. Ouvrir http://localhost:4200 dans Chrome" -ForegroundColor White
Write-Host "2. Ouvrir http://localhost:4200 dans Edge (mode privé)" -ForegroundColor White
Write-Host "3. Se connecter avec deux utilisateurs différents" -ForegroundColor White
Write-Host "4. Aller sur la page Chat pour les deux utilisateurs" -ForegroundColor White
Write-Host "5. Créer une conversation entre les deux utilisateurs" -ForegroundColor White
Write-Host "6. Envoyer des messages dans les deux sens" -ForegroundColor White
Write-Host ""
Write-Host "=== RÉSULTAT ATTENDU ===" -ForegroundColor Green
Write-Host "🎯 Utilisateur A envoie un message → Message apparaît à DROITE chez A" -ForegroundColor White
Write-Host "🎯 Utilisateur A envoie un message → Message apparaît à GAUCHE chez B" -ForegroundColor White
Write-Host "🎯 Utilisateur B envoie un message → Message apparaît à DROITE chez B" -ForegroundColor White
Write-Host "🎯 Utilisateur B envoie un message → Message apparaît à GAUCHE chez A" -ForegroundColor White
Write-Host ""
Write-Host "✨ AUCUN RAFRAÎCHISSEMENT DE PAGE NÉCESSAIRE !" -ForegroundColor Green
Write-Host ""

#!/usr/bin/env pwsh

Write-Host "=== DIAGNOSTIC CONVERSATION PARTICIPANTS ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 PROBLÈME IDENTIFIÉ:" -ForegroundColor Yellow
Write-Host "Dans les conversations privées entre A et B:"
Write-Host "- Utilisateur A voit le nom de B partout ❌"
Write-Host "- Utilisateur B voit le nom de B partout ❌"
Write-Host ""
Write-Host "✅ COMPORTEMENT ATTENDU:"
Write-Host "- Utilisateur A voit le nom de B dans sa liste"
Write-Host "- Utilisateur B voit le nom de A dans sa liste"

Write-Host ""
Write-Host "🔧 CORRECTIFS APPLIQUÉS:" -ForegroundColor Green
Write-Host "1. Ajout de logs de débogage dans getConversationTitle()"
Write-Host "2. Ajout de logs de débogage dans getConversationAvatar()"
Write-Host "3. Ajout de logs de débogage dans loadConversations()"
Write-Host ""

Write-Host "📊 DONNÉES À VÉRIFIER:" -ForegroundColor Cyan
Write-Host "1. Structure des participants dans conversation.participants"
Write-Host "2. Valeur correcte de currentUser.id"
Write-Host "3. Filtrage correct de l'autre participant"
Write-Host ""

Write-Host "🧪 INSTRUCTIONS DE TEST:" -ForegroundColor Yellow
Write-Host "1. Démarrer backend et frontend"
Write-Host "2. Se connecter avec Utilisateur A dans Chrome"
Write-Host "3. Se connecter avec Utilisateur B dans Edge"
Write-Host "4. Créer une conversation privée entre A et B"
Write-Host "5. Vérifier les logs dans la console F12:"
Write-Host ""
Write-Host "   📋 Conversations loaded:"
Write-Host "   🏷️ Getting conversation title:"
Write-Host "   👤 Other participant found:"
Write-Host "   🎭 Getting conversation avatar:"
Write-Host "   👤 Avatar other participant:"
Write-Host ""

Write-Host "🎯 RÉSULTATS ATTENDUS:" -ForegroundColor Green
Write-Host "Utilisateur A (ID=1) conversation avec B (ID=2):"
Write-Host "  - currentUserId: 1"
Write-Host "  - participants: [{id:1,...}, {id:2,...}]"
Write-Host "  - otherParticipant: {id:2, nom:'B', prenom:'UserB'}"
Write-Host "  - titre affiché: 'UserB B'"
Write-Host ""
Write-Host "Utilisateur B (ID=2) conversation avec A (ID=1):"
Write-Host "  - currentUserId: 2"
Write-Host "  - participants: [{id:1,...}, {id:2,...}]"
Write-Host "  - otherParticipant: {id:1, nom:'A', prenom:'UserA'}"
Write-Host "  - titre affiché: 'UserA A'"
Write-Host ""

Write-Host "⚠️ PROBLÈMES POSSIBLES:" -ForegroundColor Red
Write-Host "1. Backend renvoie les mêmes participants pour tous les utilisateurs"
Write-Host "2. currentUser.id n'est pas correctement défini"
Write-Host "3. Les participants ne sont pas correctement récupérés du backend"
Write-Host "4. Cache/session incorrecte côté backend"
Write-Host ""

Write-Host "🔍 VÉRIFICATIONS SUPPLÉMENTAIRES:" -ForegroundColor Magenta
Write-Host "Si le problème persiste, vérifier:"
Write-Host "1. API getConversations() côté backend"
Write-Host "2. Méthode createDirectConversation() côté backend"
Write-Host "3. Authentification et contexte utilisateur"
Write-Host "4. Sérialisation des données conversation->participants"

Write-Host ""
Write-Host "✨ Logs de débogage activés ! Testez maintenant..." -ForegroundColor Green

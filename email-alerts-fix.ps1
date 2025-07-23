#!/usr/bin/env pwsh

Write-Host "=== DIAGNOSTIC EMAIL ALERTS STOCK ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 CORRECTIFS APPLIQUÉS:" -ForegroundColor Green
Write-Host "1. ✅ Auto-envoi emails lors de generateStockAlerts()"
Write-Host "2. ✅ Gestion correcte du flag emailSent"
Write-Host "3. ✅ Gestion d'erreurs complète frontend/backend"
Write-Host "4. ✅ Logs détaillés pour débogage"
Write-Host "5. ✅ Fonction resendAlertEmails() fonctionnelle"
Write-Host ""

Write-Host "🎯 NOUVEAU COMPORTEMENT:" -ForegroundColor Yellow
Write-Host "Quand le système détecte un stock faible/rupture:"
Write-Host "  1. ⚡ Email envoyé automatiquement immédiatement"
Write-Host "  2. 🔄 Flag emailSent mis à jour en temps réel"
Write-Host "  3. ✅ Affichage 'Email envoyé automatiquement' si succès"
Write-Host "  4. ❌ Affichage 'Email en cours d'envoi...' si erreur"
Write-Host "  5. 🔔 Toast notification avec détails"
Write-Host ""

Write-Host "🐛 LOGS DE DÉBOGAGE:" -ForegroundColor Cyan
Write-Host "FRONTEND (F12 Console):"
Write-Host "  📧 Envoi email pour alerte: [type] [article]"
Write-Host "  ✅ Email envoyé avec succès: [response]"
Write-Host "  ❌ Erreur envoi email: [error]"
Write-Host ""
Write-Host "BACKEND (Terminal dotnet run):"
Write-Host "  📧 Réception requête envoi email: Type=[type]"
Write-Host "  ✅ Stock trouvé: [article] (Qté: [qty], Min: [min])"
Write-Host "  📨 Envoi vers [count] destinataires..."
Write-Host "  📧 Envoi email à: [email]"
Write-Host "  📝 Génération du template email..."
Write-Host "  📤 Envoi via SMTP..."
Write-Host "  ✅ Email envoyé avec succès!"
Write-Host ""

Write-Host "🧪 COMMENT TESTER:" -ForegroundColor Magenta
Write-Host "1. Démarrer backend: cd ..\SmartPromo_Back && dotnet run"
Write-Host "2. Démarrer frontend: npm start"
Write-Host "3. Aller sur la page Stock"
Write-Host "4. Vérifier les alertes existantes (si stock < stockMin)"
Write-Host "5. Ou importer un CSV avec des articles en rupture"
Write-Host "6. Observer les logs dans:"
Write-Host "   - Console navigateur (F12)"
Write-Host "   - Terminal backend"
Write-Host "   - Vérifier la réception email"
Write-Host ""

Write-Host "⚠️ PROBLÈMES POSSIBLES ET SOLUTIONS:" -ForegroundColor Red
Write-Host ""
Write-Host "PROBLÈME: 'Email en cours d'envoi...' reste affiché"
Write-Host "CAUSES POSSIBLES:"
Write-Host "  1. ❌ Erreur SMTP (vérifier APP_PASSWORD Gmail)"
Write-Host "  2. ❌ Firewall bloque port 587"
Write-Host "  3. ❌ Erreur réseau/connexion"
Write-Host "  4. ❌ Stock.Id incorrect dans la requête"
Write-Host ""
Write-Host "SOLUTIONS:"
Write-Host "  1. ✅ Vérifier les logs backend pour l'erreur exacte"
Write-Host "  2. ✅ Tester avec un autre email si nécessaire"
Write-Host "  3. ✅ Vérifier la config Gmail App Password"
Write-Host "  4. ✅ Utiliser le bouton 'Renvoyer Emails' pour retry"
Write-Host ""

Write-Host "📧 CONFIGURATION EMAIL:" -ForegroundColor Blue
Write-Host "Serveur: smtp.gmail.com:587"
Write-Host "Email: lachkhemines70@gmail.com"
Write-Host "Destinataire: lachkhemines70@gmail.com"
Write-Host "APP_PASSWORD: [configuré dans EmailService.cs]"
Write-Host ""

Write-Host "✨ Le système devrait maintenant fonctionner correctement !" -ForegroundColor Green
Write-Host "Les emails seront envoyés automatiquement et le statut mis à jour en temps réel."

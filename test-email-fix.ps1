Write-Host "=== DIAGNOSTIC EMAIL ALERTS STOCK ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "CORRECTIFS APPLIQUES:" -ForegroundColor Green
Write-Host "1. Auto-envoi emails lors de generateStockAlerts()"
Write-Host "2. Gestion correcte du flag emailSent"
Write-Host "3. Gestion d'erreurs complete frontend/backend"
Write-Host "4. Logs detailles pour debogage"
Write-Host "5. Fonction resendAlertEmails() fonctionnelle"
Write-Host ""

Write-Host "NOUVEAU COMPORTEMENT:" -ForegroundColor Yellow
Write-Host "Quand le systeme detecte un stock faible/rupture:"
Write-Host "  1. Email envoye automatiquement immediatement"
Write-Host "  2. Flag emailSent mis a jour en temps reel"
Write-Host "  3. Affichage 'Email envoye automatiquement' si succes"
Write-Host "  4. Affichage 'Email en cours d envoi...' si erreur"
Write-Host "  5. Toast notification avec details"
Write-Host ""

Write-Host "LOGS DE DEBOGAGE:" -ForegroundColor Cyan
Write-Host "FRONTEND (F12 Console):"
Write-Host "  Envoi email pour alerte: [type] [article]"
Write-Host "  Email envoye avec succes: [response]"
Write-Host "  Erreur envoi email: [error]"
Write-Host ""
Write-Host "BACKEND (Terminal dotnet run):"
Write-Host "  Reception requete envoi email: Type=[type]"
Write-Host "  Stock trouve: [article] (Qty: [qty], Min: [min])"
Write-Host "  Envoi vers [count] destinataires..."
Write-Host "  Envoi email a: [email]"
Write-Host "  Generation du template email..."
Write-Host "  Envoi via SMTP..."
Write-Host "  Email envoye avec succes!"
Write-Host ""

Write-Host "COMMENT TESTER:" -ForegroundColor Magenta
Write-Host "1. Demarrer backend: cd ..\SmartPromo_Back; dotnet run"
Write-Host "2. Demarrer frontend: npm start"
Write-Host "3. Aller sur la page Stock"
Write-Host "4. Verifier les alertes existantes (si stock < stockMin)"
Write-Host "5. Ou importer un CSV avec des articles en rupture"
Write-Host "6. Observer les logs dans:"
Write-Host "   - Console navigateur (F12)"
Write-Host "   - Terminal backend"
Write-Host "   - Verifier la reception email"
Write-Host ""

Write-Host "PROBLEMES POSSIBLES ET SOLUTIONS:" -ForegroundColor Red
Write-Host ""
Write-Host "PROBLEME: 'Email en cours d envoi...' reste affiche"
Write-Host "CAUSES POSSIBLES:"
Write-Host "  1. Erreur SMTP (verifier APP_PASSWORD Gmail)"
Write-Host "  2. Firewall bloque port 587"
Write-Host "  3. Erreur reseau/connexion"
Write-Host "  4. Stock.Id incorrect dans la requete"
Write-Host ""
Write-Host "SOLUTIONS:"
Write-Host "  1. Verifier les logs backend pour l'erreur exacte"
Write-Host "  2. Tester avec un autre email si necessaire"
Write-Host "  3. Verifier la config Gmail App Password"
Write-Host "  4. Utiliser le bouton 'Renvoyer Emails' pour retry"
Write-Host ""

Write-Host "CONFIGURATION EMAIL:" -ForegroundColor Blue
Write-Host "Serveur: smtp.gmail.com:587"
Write-Host "Email: lachkhemines70@gmail.com"
Write-Host "Destinataire: lachkhemines70@gmail.com"
Write-Host "APP_PASSWORD: [configure dans EmailService.cs]"
Write-Host ""

Write-Host "Le systeme devrait maintenant fonctionner correctement !" -ForegroundColor Green
Write-Host "Les emails seront envoyes automatiquement et le statut mis a jour en temps reel."

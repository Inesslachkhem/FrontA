#!/bin/bash

# Script de test du build Docker en local

echo "🔍 Vérification de l'environnement..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que les fichiers nécessaires existent
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé"
    exit 1
fi

if [ ! -f "angular.json" ]; then
    echo "❌ angular.json non trouvé"
    exit 1
fi

echo "✅ Environnement vérifié"

# Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
docker rmi smartpromo-app:test 2>/dev/null || true

# Test du build avec le Dockerfile simple
echo "🔨 Test du build avec Dockerfile.simple..."
if docker build -f Dockerfile.simple -t smartpromo-app:test .; then
    echo "✅ Build réussi avec Dockerfile.simple"
    
    # Test de démarrage du conteneur
    echo "🚀 Test de démarrage du conteneur..."
    CONTAINER_ID=$(docker run -d -p 4001:4000 smartpromo-app:test)
    
    # Attendre que l'application démarre
    echo "⏳ Attente du démarrage de l'application..."
    sleep 10
    
    # Tester si l'application répond
    if curl -f http://localhost:4001 >/dev/null 2>&1; then
        echo "✅ Application démarrée avec succès sur http://localhost:4001"
    else
        echo "⚠️ Application démarrée mais ne répond pas encore"
    fi
    
    # Afficher les logs
    echo "📋 Logs du conteneur:"
    docker logs $CONTAINER_ID
    
    # Nettoyer
    docker stop $CONTAINER_ID >/dev/null 2>&1
    docker rm $CONTAINER_ID >/dev/null 2>&1
    
else
    echo "❌ Échec du build avec Dockerfile.simple"
    
    # Essayer avec le Dockerfile standard
    echo "🔨 Test du build avec Dockerfile standard..."
    if docker build -t smartpromo-app:test .; then
        echo "✅ Build réussi avec Dockerfile standard"
    else
        echo "❌ Échec du build avec Dockerfile standard"
        exit 1
    fi
fi

echo "🎉 Test terminé avec succès!"

# Utiliser une image Node.js officielle comme base
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache git

# Copier les fichiers package.json et package-lock.json (si disponible)
COPY package*.json ./

# Installer les dépendances (y compris devDependencies pour le build)
RUN npm ci && npm cache clean --force

# Installer Angular CLI globalement
RUN npm install -g @angular/cli@17.3.8

# Copier le code source
COPY . .

# Construire l'application Angular pour la production
RUN npm run build --configuration=production

# Étape de production - utiliser une image plus légère
FROM node:18-alpine AS production

# Installer dumb-init pour gérer les signaux
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S angular -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json pour les dépendances de production uniquement
COPY package*.json ./

# Installer seulement les dépendances de production nécessaires pour le serveur
RUN npm ci --omit=dev && npm cache clean --force

# Copier les fichiers construits depuis l'étape de build
COPY --from=build --chown=angular:nodejs /app/dist ./dist

# Copier le healthcheck
COPY --chown=angular:nodejs healthcheck.js ./

# Changer vers l'utilisateur non-root
USER angular

# Exposer le port sur lequel l'application s'exécute
EXPOSE 4000

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=4000

# Commande de santé pour vérifier si l'application est en cours d'exécution
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Utiliser dumb-init comme point d'entrée et démarrer l'application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/smartpromo-app/server/server.mjs"]

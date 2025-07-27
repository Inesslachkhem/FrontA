pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "ineslachkhem/fronta"  
        DOCKER_TAG = "latest"
        DOCKER_USER = "ines081"
        DOCKER_PASS = "inestebo123"
        NODE_OPTIONS = "--max-old-space-size=4096"
    }

    stages {
        stage('Checkout code') {
            steps {
                git branch: 'tebo', url: 'https://github.com/Inesslachkhem/FrontA.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Installer Node.js si nécessaire
                    sh '''
                        if ! command -v node &> /dev/null; then
                            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                        fi
                        
                        if ! command -v npm &> /dev/null; then
                            sudo apt-get install -y npm
                        fi
                        
                        node --version
                        npm --version
                    '''
                }
            }
        }

        stage('Build Angular') {
            steps {
                script {
                    try {
                        sh '''
                            # Nettoyer le cache npm
                            npm cache clean --force
                            
                            # Installer les dépendances
                            npm ci --prefer-offline --no-audit
                            
                            # Construire l'application avec gestion d'erreur des polices
                            npm run build --configuration=production --aot --build-optimizer || {
                                echo "Build failed, trying without font optimization..."
                                ng build --configuration=production --optimization=false
                            }
                        '''
                    } catch (Exception e) {
                        echo "Build with npm failed, trying with npx..."
                        sh '''
                            npx ng build --configuration=production \
                                --optimization=false \
                                --aot=false \
                                --vendor-chunk=false \
                                --common-chunk=false
                        '''
                    }
                }
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    // Construire l'image Docker avec gestion d'erreur
                    sh '''
                        # Vérifier que Docker est disponible
                        docker --version
                        
                        # Utiliser le Dockerfile simple qui fonctionne mieux
                        if [ -f "Dockerfile.simple" ]; then
                            echo "Using Dockerfile.simple..."
                            docker build \
                                --build-arg NODE_ENV=production \
                                --no-cache \
                                -f Dockerfile.simple \
                                -t $DOCKER_IMAGE:$DOCKER_TAG .
                        else
                            echo "Using standard Dockerfile..."
                            docker build \
                                --build-arg NODE_ENV=production \
                                --no-cache \
                                -t $DOCKER_IMAGE:$DOCKER_TAG .
                        fi
                    '''
                }
            }
        }

        stage('Push Docker image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_IMAGE:$DOCKER_TAG
                        docker logout
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    # Nettoyer les images Docker non utilisées
                    docker image prune -f
                    
                    # Nettoyer node_modules si nécessaire
                    rm -rf node_modules/.cache
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
        }
        failure {
            echo 'Pipeline failed! Check the logs above for details.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        cleanup {
            // Nettoyer le workspace
            deleteDir()
        }
    }
}

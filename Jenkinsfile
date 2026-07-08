pipeline {
    agent any

    environment {
        IMAGE_NAME = 'rag-data-ingestion'
        CONTAINER_NAME = 'rag-data-ingestion'
        PORT_MAPPING = '3017:3000'
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins biasanya melakukan checkout otomatis jika ini Multibranch Pipeline
                echo 'Checking out source code...'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${IMAGE_NAME}:latest..."
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Deploy') {
            steps {
                // Membaca credentials bertipe Secret File
                withCredentials([file(credentialsId: 'rag-ingestion-env', variable: 'ENV_FILE')]) {
                    script {
                        echo "Checking for existing container: ${CONTAINER_NAME}..."
                        // Menghentikan dan menghapus container lama jika ada (tanpa melempar error jika tidak ada)
                        sh "docker ps -a -q --filter name=^/${CONTAINER_NAME}\$ | xargs -r docker rm -f"

                        echo "Starting new container on port ${PORT_MAPPING}..."
                        // Menjalankan container baru dengan file env rahasia dari Jenkins
                        sh "docker run -d --name ${CONTAINER_NAME} -p ${PORT_MAPPING} --env-file \$ENV_FILE --restart always ${IMAGE_NAME}:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up dangling images...'
            // Menghapus docker cache/image sisa build yang tidak terpakai
            sh 'docker image prune -f'
        }
        success {
            echo "Successfully deployed ${CONTAINER_NAME} and running on port 3017!"
        }
        failure {
            echo "Deployment failed! Please check the logs."
        }
    }
}

import { Client } from 'minio';

// Usa os valores definidos no docker-compose.yml
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER || 'admin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'adminpassword'
});

export const BUCKET_NAME = 'user-profiles';

// Inicializa o bucket automaticamente
export async function setupMinio() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`[MinIO] Bucket '${BUCKET_NAME}' criado com sucesso.`);
      
      // Define a policy para leitura pública (permitindo acesso às imagens via URL)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Action: ['s3:GetObject'],
            Effect: 'Allow',
            Principal: '*',
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`[MinIO] Política de leitura pública aplicada ao bucket '${BUCKET_NAME}'.`);
    } else {
      console.log(`[MinIO] Bucket '${BUCKET_NAME}' já existe.`);
    }
  } catch (error) {
    console.error('[MinIO] Erro ao configurar o bucket:', error);
  }
}

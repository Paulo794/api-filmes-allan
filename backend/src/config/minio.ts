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

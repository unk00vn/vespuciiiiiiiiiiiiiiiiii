// UWAGA: Ten kod musi być uruchomiony w bezpiecznym środowisku serwerowym (np. Serverless Function, Node.js API), 
// ponieważ używa tajnych kluczy R2 (R2_SECRET_ACCESS_KEY). 
// W środowisku Dyad/Vite, ten plik służy jako definicja oczekiwanego endpointu.

import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Pobieranie zmiennych środowiskowych (zakładamy, że są dostępne w środowisku serwerowym)
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const s3Client = new S3Client({
    region: "auto", // Wymagane przez R2
    endpoint: R2_ENDPOINT_URL,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

// Oczekiwany format danych wejściowych z frontendu
interface CreateUploadUrlRequest {
    fileName: string;
    fileType: string;
    fileSize: number;
    ownerId: string; 
}

// Oczekiwany format danych wyjściowych dla frontendu
export interface SignedUploadResponse {
    uploadUrl: string;
    fileUrl: string;
    key: string;
    headers: Record<string, string>;
}

// Symulacja funkcji API
export async function createUploadUrl(reqBody: CreateUploadUrlRequest): Promise<SignedUploadResponse | { error: string }> {
    if (!reqBody.ownerId) {
        return { error: "Brak ID właściciela." };
    }

    const fileExtension = reqBody.fileName.split('.').pop();
    const key = `uploads/${reqBody.ownerId}/${uuidv4()}.${fileExtension}`;
    const fileUrl = `${R2_PUBLIC_URL}/${key}`;

    try {
        // Generowanie pre-signed POST URL (ważny 5 minut)
        const { url, fields } = await createPresignedPost(s3Client, {
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Expires: 300, // 5 minut
            Fields: {
                'Content-Type': reqBody.fileType,
            },
            Conditions: [
                { "acl": "public-read" }, // Ustawienie publicznego dostępu
                ["content-length-range", 1, 10485760], // Max 10MB
            ],
        });

        return {
            uploadUrl: url,
            fileUrl: fileUrl,
            key: key,
            headers: fields,
        };

    } catch (err) {
        console.error("Błąd generowania signed URL:", err);
        return { error: "Nie udało się wygenerować URL do uploadu." };
    }
}
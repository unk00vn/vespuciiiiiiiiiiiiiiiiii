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

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT_URL || !R2_PUBLIC_URL) {
    console.error("Brak wymaganych zmiennych środowiskowych R2.");
    // W środowisku serwerowym, to powinno rzucić błąd
}

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
    isProfilePicture?: boolean; // Nowa flaga
}

// Oczekiwany format danych wyjściowych dla frontendu
export interface SignedUploadResponse {
    uploadUrl: string;
    fileUrl: string;
    key: string;
    headers: Record<string, string>;
}

// Symulacja funkcji API (w rzeczywistości byłby to handler HTTP)
export async function createUploadUrl(reqBody: CreateUploadUrlRequest): Promise<SignedUploadResponse | { error: string }> {
    if (!reqBody.ownerId) {
        return { error: "Brak ID właściciela." };
    }

    const fileExtension = reqBody.fileName.split('.').pop();
    
    let key: string;
    if (reqBody.isProfilePicture) {
        // Dla zdjęć profilowych używamy stałego klucza powiązanego z ID użytkownika
        key = `avatars/${reqBody.ownerId}/profile.${fileExtension}`;
    } else {
        // Dla załączników używamy unikalnego UUID
        key = `uploads/${reqBody.ownerId}/${uuidv4()}.${fileExtension}`;
    }
    
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

// UWAGA: W prawdziwej aplikacji, ten kod byłby wyeksportowany jako handler HTTP POST.
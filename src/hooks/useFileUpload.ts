"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveAttachmentMetadata, AttachmentMetadata } from "@/utils/attachments";
import { compressImage } from "@/utils/imageCompression"; // Import kompresji

// Stałe walidacyjne
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Oczekiwana struktura odpowiedzi z API
interface SignedUploadResponse {
    uploadUrl: string;
    fileUrl: string;
    key: string;
    headers: Record<string, string>;
}

interface UploadOptions {
    reportId?: string;
    noteId?: string;
    chatId?: string;
    // Opcja dla zdjęć profilowych, które mogą wymagać innej ścieżki/ACL
    isProfilePicture?: boolean; 
}

export const useFileUpload = () => {
    const { profile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const validateFile = (file: File): boolean => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            toast.error(`Nieobsługiwany typ pliku: ${file.type}. Dozwolone: JPG, PNG, PDF, DOCX.`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(`Plik jest za duży. Maksymalny rozmiar to ${MAX_FILE_SIZE_MB} MB.`);
            return false;
        }
        return true;
    };

    const uploadFile = useCallback(async (file: File, options: UploadOptions) => {
        if (!profile) {
            toast.error("Musisz być zalogowany, aby przesyłać pliki.");
            return null;
        }
        if (!validateFile(file)) return null;

        setIsUploading(true);
        setProgress(0);
        let uploadToastId: string | number = toast.loading("Przygotowanie do uploadu...");
        
        let fileToUpload = file;

        try {
            // 0. Kompresja obrazu (jeśli to obraz)
            if (file.type.startsWith('image/')) {
                toast.update(uploadToastId, { render: "Optymalizacja obrazu..." });
                fileToUpload = await compressImage(file, 0.8, 1920);
            }

            // 1. Pobierz Signed URL z API
            const apiPayload = {
                fileName: fileToUpload.name,
                fileType: fileToUpload.type,
                fileSize: fileToUpload.size,
                ownerId: profile.id,
                isProfilePicture: options.isProfilePicture || false, // Przekazanie informacji o typie
            };

            const response = await fetch("/api/files/create-upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Błąd generowania URL do uploadu.");
            }

            const { uploadUrl, fileUrl, headers } = await response.json() as SignedUploadResponse;
            
            toast.update(uploadToastId, { 
                render: "Przesyłanie pliku do Cloudflare R2...", 
                type: "info", 
                icon: '🚀' 
            });

            // 2. Upload pliku bezpośrednio do R2 (Signed URL)
            const formData = new FormData();
            // Dodaj pola wymagane przez pre-signed POST (zwrócone w 'headers')
            Object.entries(headers).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', fileToUpload); // Plik musi być ostatni

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error("R2 Upload Error:", errorText);
                throw new Error("Błąd uploadu do R2. Sprawdź logi serwera/R2.");
            }
            
            setProgress(100);
            
            // 3. Zapisz metadane w Supabase (tylko jeśli nie jest to zdjęcie profilowe)
            if (!options.isProfilePicture) {
                toast.update(uploadToastId, { 
                    render: "Upload zakończony. Zapisywanie metadanych...", 
                    type: "success", 
                    duration: 1000 
                });
                
                const metadata: AttachmentMetadata = {
                    ownerId: profile.id,
                    fileUrl: fileUrl,
                    fileType: fileToUpload.type,
                    fileSize: fileToUpload.size,
                    ...options,
                };

                const { data: attachmentData, error: metadataError } = await saveAttachmentMetadata(metadata);

                if (metadataError) {
                    throw new Error("Błąd zapisu metadanych.");
                }
                
                toast.success("Plik został pomyślnie załączony!");
                return attachmentData;
            } else {
                // Jeśli to zdjęcie profilowe, zwracamy tylko URL, aby zaktualizować profil
                toast.success("Zdjęcie profilowe przesłane pomyślnie!");
                return { fileUrl };
            }


        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.update(uploadToastId, { 
                render: error.message || "Wystąpił nieznany błąd podczas uploadu.", 
                type: "error", 
                duration: 5000 
            });
            return null;
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    }, [profile]);

    return { uploadFile, isUploading, progress };
};
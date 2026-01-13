"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveAttachmentMetadata, AttachmentMetadata } from "@/utils/attachments";
import { compressImage } from "@/utils/imageCompression";
import { uploadImgBB } from "@/api/upload-imgbb";

interface UploadOptions {
    reportId?: string;
    noteId?: string;
    chatId?: string;
    isProfilePicture?: boolean;
}

const MAX_FILE_SIZE_MB = 10;

export const useFileUpload = () => {
    const { profile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadSingleFile = useCallback(async (file: File, options: UploadOptions, updateProgress: (p: number) => void) => {
        if (!profile) throw new Error("Brak profilu użytkownika.");
        
        updateProgress(10);
        
        // 1. Kompresja do WebP (0.7 quality dla optymalizacji)
        const compressedFile = await compressImage(file, 0.7);
        updateProgress(30);

        // 2. Konwersja do Base64 z nagłówkiem MIME
        const base64WithMime = await fileToBase64(compressedFile);
        updateProgress(50);

        // 3. Upload do ImgBB
        const uploadResult = await uploadImgBB({
            base64Image: base64WithMime,
            fileName: compressedFile.name,
            fileType: compressedFile.type,
            fileSize: compressedFile.size,
            ownerId: profile.id
        });

        if ('error' in uploadResult) {
            throw new Error(uploadResult.error);
        }

        updateProgress(80);

        // 4. Zapisz metadane w Supabase (tylko dla załączników systemowych)
        if (options.isProfilePicture) {
            updateProgress(100);
            return { fileUrl: uploadResult.fileUrl };
        }
        
        const metadata: AttachmentMetadata = {
            ownerId: profile.id,
            fileUrl: uploadResult.fileUrl, // Zapisujemy bezpośredni link z ImgBB
            fileType: compressedFile.type,
            fileSize: uploadResult.size,
            reportId: options.reportId,
            noteId: options.noteId,
            chatId: options.chatId,
        };

        const { data: attachmentData, error: metadataError } = await saveAttachmentMetadata(metadata);
        
        if (metadataError) throw new Error("Błąd zapisu metadanych w bazie.");

        updateProgress(100);
        return attachmentData;

    }, [profile]);

    const uploadFiles = useCallback(async (files: File[], options: UploadOptions) => {
        if (!profile) {
            toast.error("Zaloguj się, aby przesyłać pliki.");
            return [];
        }

        setIsUploading(true);
        const results: any[] = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const toastId = toast.loading(`Przesyłanie: ${file.name}...`);
            
            try {
                const result = await uploadSingleFile(file, options, (p) => {
                    setProgress(Math.floor(((i / files.length) * 100) + (p / files.length)));
                });
                results.push(result);
                toast.success(`Przesłano: ${file.name}`, { id: toastId });
            } catch (error: any) {
                toast.error(`Błąd (${file.name}): ${error.message}`, { id: toastId });
            }
        }

        setIsUploading(false);
        setProgress(0);
        return results;

    }, [profile, uploadSingleFile]);

    return { uploadFiles, isUploading, progress };
};
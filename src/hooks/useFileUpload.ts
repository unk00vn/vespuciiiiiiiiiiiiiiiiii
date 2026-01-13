"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveAttachmentMetadata, AttachmentMetadata } from "@/utils/attachments";
import { compressImage } from "@/utils/imageCompression";

interface UploadOptions {
    reportId?: string;
    noteId?: string;
    chatId?: string;
    isProfilePicture?: boolean;
}

// Limit rozmiaru pliku: 10MB
const MAX_FILE_SIZE_MB = 10;
const MAX_CONCURRENT_UPLOADS = 3;

export const useFileUpload = () => {
    const { profile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Usuń prefiks 'data:image/webp;base64,'
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadSingleFile = useCallback(async (file: File, options: UploadOptions, updateProgress: (p: number) => void) => {
        if (!profile) throw new Error("Brak profilu użytkownika.");
        
        const fileMB = file.size / (1024 * 1024);
        if (fileMB > MAX_FILE_SIZE_MB) {
            throw new Error(`Plik ${file.name} jest za duży (max ${MAX_FILE_SIZE_MB} MB).`);
        }

        updateProgress(10);
        
        // 1. Kompresja (do WebP)
        const fileToUpload = await compressImage(file, 0.7);
        updateProgress(30);

        // 2. Konwersja do Base64
        const base64Image = await fileToBase64(fileToUpload);
        updateProgress(50);

        // 3. Wysyłka do serwerowego endpointu (który komunikuje się z ImgBB)
        const uploadResponse = await fetch("/api/files/upload-imgbb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                base64Image: base64Image,
                fileName: fileToUpload.name,
                fileType: fileToUpload.type,
                fileSize: fileToUpload.size,
                ownerId: profile.id,
                ...options,
            }),
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Błąd przesyłania do ImgBB.");
        }

        const { fileUrl, displayUrl, size } = await uploadResponse.json();
        updateProgress(80);

        // 4. Zapisz metadane w Supabase (tylko jeśli to nie jest zdjęcie profilowe)
        if (options.isProfilePicture) {
            // W przypadku zdjęcia profilowego, URL jest aktualizowany bezpośrednio w komponencie ProfilePage
            updateProgress(100);
            return { fileUrl: fileUrl || displayUrl };
        }
        
        const metadata: AttachmentMetadata = {
            ownerId: profile.id,
            fileUrl: fileUrl || displayUrl,
            fileType: fileToUpload.type,
            fileSize: size,
            ...options,
        };

        const { data: attachmentData, error: metadataError } = await saveAttachmentMetadata(metadata);
        
        if (metadataError) throw new Error("Błąd zapisu metadanych.");

        updateProgress(100);
        return attachmentData;

    }, [profile]);

    const uploadFiles = useCallback(async (files: File[], options: UploadOptions) => {
        if (!profile) {
            toast.error("Musisz być zalogowany, aby przesyłać pliki.");
            return [];
        }

        setIsUploading(true);
        const totalFiles = files.length;
        const results: any[] = [];
        let completedFiles = 0;
        
        const filePromises = files.map((file, index) => async () => {
            let fileToastId: string | number = '';
            try {
                fileToastId = toast.loading(`Przesyłanie pliku ${index + 1}/${totalFiles}: ${file.name}...`);
                
                const result = await uploadSingleFile(file, options, (p) => {
                    // Aktualizacja globalnego paska postępu
                    const baseProgress = (index / totalFiles) * 100;
                    const currentFileProgress = p / totalFiles;
                    setProgress(Math.min(99, Math.floor(baseProgress + currentFileProgress)));
                });
                
                if (result) {
                    results.push(result);
                    toast.success(`Plik ${index + 1}/${totalFiles} przesłany.`, { id: fileToastId });
                }
            } catch (error: any) {
                toast.error(error.message || `Błąd uploadu pliku ${index + 1}/${totalFiles}.`, { id: fileToastId });
            } finally {
                completedFiles++;
                if (completedFiles === totalFiles) {
                    setIsUploading(false);
                    setProgress(100);
                    setTimeout(() => setProgress(0), 1000);
                }
            }
        });

        // Uruchomienie równoległe z limitem
        const concurrentUploads = Math.min(totalFiles, MAX_CONCURRENT_UPLOADS);
        const runningPromises: Promise<void>[] = [];
        let fileIndex = 0;

        const runNext = () => {
            if (fileIndex < totalFiles) {
                const promise = filePromises[fileIndex]().then(() => {
                    runningPromises.splice(runningPromises.indexOf(promise), 1);
                    runNext();
                });
                runningPromises.push(promise);
                fileIndex++;
            }
        };

        for (let i = 0; i < concurrentUploads; i++) {
            runNext();
        }

        await Promise.all(runningPromises);
        
        setIsUploading(false);
        setProgress(0);
        return results;

    }, [profile, uploadSingleFile]);

    return { uploadFiles, isUploading, progress };
};
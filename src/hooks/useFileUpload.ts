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
}

export const useFileUpload = () => {
    const { profile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = useCallback(async (file: File, options: UploadOptions) => {
        if (!profile) return null;

        setIsUploading(true);
        setProgress(10);
        let uploadToastId = toast.loading("Przetwarzanie pliku...");
        
        try {
            // 1. Kompresja
            const fileToUpload = await compressImage(file, 0.7);
            setProgress(30);

            // 2. Pobierz Signed URL z Twojego API (Zakładamy istnienie endpointu)
            const response = await fetch("/api/files/create-upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: fileToUpload.name,
                    fileType: fileToUpload.type,
                    fileSize: fileToUpload.size,
                    ownerId: profile.id
                }),
            });

            if (!response.ok) throw new Error("Błąd generowania URL do uploadu.");

            const { uploadUrl, fileUrl, headers } = await response.json();
            setProgress(50);

            // 3. Upload bezpośrednio do R2
            const formData = new FormData();
            Object.entries(headers).forEach(([key, value]) => {
                formData.append(key, value as string);
            });
            formData.append('file', fileToUpload);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Błąd przesyłania do storage.");
            setProgress(80);

            // 4. Zapisz metadane w Supabase
            const metadata: AttachmentMetadata = {
                ownerId: profile.id,
                fileUrl: fileUrl,
                fileType: fileToUpload.type,
                fileSize: fileToUpload.size,
                ...options,
            };

            const { data: attachmentData } = await saveAttachmentMetadata(metadata);
            
            setProgress(100);
            toast.success("Plik przesłany pomyślnie!", { id: uploadToastId });
            return attachmentData;

        } catch (error: any) {
            toast.error(error.message || "Błąd uploadu.", { id: uploadToastId });
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [profile]);

    return { uploadFile, isUploading, progress };
};
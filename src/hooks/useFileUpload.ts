"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveAttachmentMetadata, AttachmentMetadata } from "@/utils/attachments";
import { compressImage } from "@/utils/imageCompression";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

interface UploadOptions {
    reportId?: string;
    noteId?: string;
    chatId?: string;
}

// Używamy stałej nazwy bucketu, zakładając, że jest to 'attachments'
const BUCKET_NAME = "attachments"; 

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

            const fileExtension = fileToUpload.name.split('.').pop();
            const filePath = `${profile.id}/${uuidv4()}.${fileExtension}`;

            // 2. Upload bezpośrednio do Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: fileToUpload.type,
                    // Możemy użyć onUploadProgress, ale Supabase nie zawsze go wspiera w React
                });

            if (uploadError) {
                throw new Error("Błąd przesyłania do Supabase Storage: " + uploadError.message);
            }
            
            // 3. Pobierz publiczny URL
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (!publicUrlData.publicUrl) {
                throw new Error("Nie udało się uzyskać publicznego URL.");
            }
            
            const fileUrl = publicUrlData.publicUrl;
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
            setProgress(0);
        }
    }, [profile]);

    return { uploadFile, isUploading, progress };
};
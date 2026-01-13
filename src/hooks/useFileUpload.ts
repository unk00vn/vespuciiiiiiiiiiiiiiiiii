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

    // Zmieniona funkcja na stub
    const uploadSingleFile = useCallback(async (file: File, options: UploadOptions, updateProgress: (p: number) => void) => {
        throw new Error("Obsługa plików jest tymczasowo wyłączona.");
    }, []);

    const uploadFiles = useCallback(async (files: File[], options: UploadOptions) => {
        toast.error("Obsługa plików i zdjęć jest tymczasowo wyłączona.");
        return [];
    }, []);

    return { uploadFiles, isUploading, progress };
};
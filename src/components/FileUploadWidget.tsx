"use client";

import React, { useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface FileUploadWidgetProps {
    parentId?: string; // Zmieniono na opcjonalne
    parentType: 'report' | 'note' | 'chat';
    onUploadSuccess: (attachments: any[]) => void;
}

export const FileUploadWidget = ({ parentId, parentType, onUploadSuccess }: FileUploadWidgetProps) => {
    const { uploadFiles, isUploading, progress } = useFileUpload();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Funkcjonalność wyłączona
        toast.error("Obsługa plików jest tymczasowo wyłączona.");
        e.target.value = '';
    };

    return (
        <div className="space-y-4 p-4 border-2 border-dashed border-lapd-gold/30 rounded-lg bg-black/20">
            <div className="flex flex-col items-center justify-center py-4">
                <Paperclip className="h-8 w-8 text-lapd-gold mb-2 opacity-50" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Przeciągnij zdjęcia lub kliknij aby wybrać</p>
                <label className="cursor-pointer">
                    <div className="bg-gray-600 text-white px-6 py-2 rounded font-black text-xs uppercase transition-colors cursor-not-allowed">
                        FUNKCJA WYŁĄCZONA
                    </div>
                    <Input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={true} // Zablokowanie inputu
                        accept="image/*" 
                    />
                </label>
            </div>
            
            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-lapd-gold">
                        <span>UPLOAD W TOKU...</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-white/10" indicatorClassName="bg-lapd-gold" />
                </div>
            )}
        </div>
    );
};
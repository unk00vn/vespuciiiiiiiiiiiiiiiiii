"use client";

import React, { useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Paperclip } from "lucide-react";

interface FileUploadWidgetProps {
    parentId: string;
    parentType: 'report' | 'note' | 'chat';
    onUploadSuccess: (attachments: any[]) => void;
}

export const FileUploadWidget = ({ parentId, parentType, onUploadSuccess }: FileUploadWidgetProps) => {
    const { uploadFiles, isUploading, progress } = useFileUpload();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            
            const options = {
                reportId: parentType === 'report' ? parentId : undefined,
                noteId: parentType === 'note' ? parentId : undefined,
                chatId: parentType === 'chat' ? parentId : undefined,
            };
            
            const results = await uploadFiles(files, options);
            if (results.length > 0) {
                onUploadSuccess(results);
            }
            // Reset input field
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-4 p-4 border-2 border-dashed border-lapd-gold/30 rounded-lg bg-black/20">
            <div className="flex flex-col items-center justify-center py-4">
                <Paperclip className="h-8 w-8 text-lapd-gold mb-2 opacity-50" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Przeciągnij zdjęcia lub kliknij aby wybrać</p>
                <label className="cursor-pointer">
                    <div className="bg-lapd-gold text-lapd-navy px-6 py-2 rounded font-black text-xs uppercase hover:bg-yellow-500 transition-colors">
                        {isUploading ? "PRZESYŁANIE..." : "DODAJ ZAŁĄCZNIK"}
                    </div>
                    <Input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={isUploading}
                        accept="image/*" // Ograniczamy do obrazów, ponieważ ImgBB jest głównie dla obrazów
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
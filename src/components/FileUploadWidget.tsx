"use client";

import React, { useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadWidgetProps {
    parentId: string;
    parentType: 'report' | 'note' | 'chat';
    onUploadSuccess: (attachment: any) => void;
}

export const FileUploadWidget = ({ parentId, parentType, onUploadSuccess }: FileUploadWidgetProps) => {
    const { uploadFile, isUploading, progress } = useFileUpload();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.warning("Wybierz plik do przesłania.");
            return;
        }

        const options = parentType === 'report' ? { reportId: parentId } :
                        parentType === 'note' ? { noteId: parentId } :
                        { chatId: parentId };

        const result = await uploadFile(selectedFile, options);

        if (result) {
            onUploadSuccess(result);
            setSelectedFile(null);
        }
    };

    return (
        <Card className="border-lapd-gold shadow-sm">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lapd-navy text-lg flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Załącz Plik
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                <Input 
                    type="file" 
                    onChange={handleFileChange} 
                    disabled={isUploading}
                    className="border-lapd-gold"
                />
                
                {selectedFile && (
                    <div className="text-sm text-gray-600 flex items-center justify-between">
                        <span className="truncate max-w-[70%]">
                            <FileText className="h-4 w-4 inline mr-1 text-lapd-gold" />
                            {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>
                )}

                {isUploading && (
                    <Progress value={progress} className="h-2 bg-gray-200" indicatorClassName="bg-lapd-gold" />
                )}

                <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-lapd-navy text-lapd-gold hover:bg-lapd-navy/90 font-bold"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            PRZESYŁANIE...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            PRZEŚLIJ ZAŁĄCZNIK
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};
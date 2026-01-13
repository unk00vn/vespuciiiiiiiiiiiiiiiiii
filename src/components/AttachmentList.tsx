"use client";

import React from "react";
import { FileText, Image, Download, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Attachment {
    id: string;
    file_url: string;
    file_type: string;
    file_size: number;
    created_at: string;
}

interface AttachmentListProps {
    attachments: Attachment[];
    onDelete?: (id: string) => void; // Opcjonalna funkcja usuwania
    canDelete: boolean;
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
        return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (fileType.includes('pdf')) {
        return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (fileType.includes('word')) {
        return <FileText className="h-5 w-5 text-indigo-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
};

export const AttachmentList = ({ attachments, onDelete, canDelete }: AttachmentListProps) => {
    if (attachments.length === 0) {
        return <p className="text-sm text-gray-400 italic">Brak załączników.</p>;
    }

    return (
        <div className="space-y-3">
            {attachments.map((attachment) => (
                <div 
                    key={attachment.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center space-x-3 min-w-0">
                        {getFileIcon(attachment.file_type)}
                        <div className="min-w-0">
                            <a 
                                href={attachment.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-lapd-navy hover:underline truncate block"
                            >
                                {attachment.file_url.split('/').pop()}
                            </a>
                            <Badge variant="secondary" className="text-[10px] mt-0.5">
                                {formatFileSize(attachment.file_size)}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {canDelete && onDelete && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onDelete(attachment.id)}
                                className="text-red-500 hover:bg-red-100"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                        <Button asChild size="sm" className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
                            <a href={attachment.file_url} target="_blank" download>
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
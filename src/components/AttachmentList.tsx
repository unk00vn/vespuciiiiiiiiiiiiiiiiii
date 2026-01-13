"use client";

import React from "react";
import { FileText, Image as ImageIcon, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentListProps {
    attachments: any[];
    onDelete?: (id: string) => void;
    canDelete?: boolean;
}

export const AttachmentList = ({ attachments, onDelete, canDelete }: AttachmentListProps) => {
    if (attachments.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        {file.file_type.startsWith('image/') ? (
                            <div className="h-10 w-10 rounded border border-lapd-gold/30 overflow-hidden flex-shrink-0">
                                <img src={file.file_url} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <FileText className="h-10 w-10 p-2 text-lapd-gold bg-white/5 rounded" />
                        )}
                        <div className="truncate">
                            <p className="text-[10px] font-black text-white uppercase truncate">{file.file_url.split('/').pop()}</p>
                            <p className="text-[8px] text-slate-500 font-mono">{(file.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" asChild>
                            <a href={file.file_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                        {canDelete && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-500" onClick={() => onDelete?.(file.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
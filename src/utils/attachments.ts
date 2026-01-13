import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface AttachmentMetadata {
    fileUrl: string;
    fileType: string;
    fileSize: number;
    ownerId: string;
    reportId?: string;
    noteId?: string;
    chatId?: string;
}

export async function saveAttachmentMetadata(metadata: AttachmentMetadata) {
    const { data, error } = await supabase
        .from("attachments")
        .insert({
            owner_id: metadata.ownerId,
            file_url: metadata.fileUrl,
            file_type: metadata.fileType,
            file_size: metadata.fileSize,
            report_id: metadata.reportId,
            note_id: metadata.noteId,
            chat_id: metadata.chatId,
        })
        .select()
        .single();

    if (error) {
        toast.error("Błąd zapisu metadanych: " + error.message);
        return { data: null, error };
    }

    return { data, error: null };
}

export async function getAttachments(parentId: string, type: 'report' | 'note') {
    const field = type === 'report' ? 'report_id' : 'note_id';
    const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq(field, parentId)
        .order('created_at', { ascending: true });

    return { data: data || [], error };
}
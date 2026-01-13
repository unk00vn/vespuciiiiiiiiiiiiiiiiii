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

/**
 * Zapisuje metadane pliku do tabeli attachments w Supabase.
 */
export async function saveAttachmentMetadata(metadata: AttachmentMetadata) {
    const { ownerId, fileUrl, fileType, fileSize, reportId, noteId, chatId } = metadata;

    // Walidacja, czy istnieje przynajmniej jedno powiązanie
    if (!reportId && !noteId && !chatId) {
        toast.error("Błąd: Załącznik musi być powiązany z raportem, notatką lub czatem.");
        return { data: null, error: new Error("Missing parent ID") };
    }

    const { data, error } = await supabase
        .from("attachments")
        .insert({
            owner_id: ownerId,
            file_url: fileUrl,
            file_type: fileType,
            file_size: fileSize,
            report_id: reportId,
            note_id: noteId,
            chat_id: chatId,
        })
        .select()
        .single();

    if (error) {
        console.error("Błąd zapisu metadanych:", error);
        toast.error("Błąd zapisu metadanych pliku: " + error.message);
        return { data: null, error };
    }

    return { data, error: null };
}

/**
 * Pobiera załączniki dla danego raportu/notatki.
 */
export async function getAttachments(parentId: string, parentType: 'report' | 'note' | 'chat') {
    let query = supabase.from("attachments").select("*");

    if (parentType === 'report') {
        query = query.eq('report_id', parentId);
    } else if (parentType === 'note') {
        query = query.eq('note_id', parentId);
    } else if (parentType === 'chat') {
        query = query.eq('chat_id', parentId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
        console.error("Błąd pobierania załączników:", error);
        return [];
    }
    return data;
}
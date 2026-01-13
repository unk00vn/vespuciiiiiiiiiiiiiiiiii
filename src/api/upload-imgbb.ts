/**
 * Funkcja wykonująca upload do ImgBB.
 * W środowisku front-endowym wykonuje bezpośrednie zapytanie do API ImgBB.
 */

interface UploadImgBBRequest {
    base64Image: string; // Base64 z nagłówkiem lub bez
    fileName: string;
    fileType: string;
    fileSize: number;
    ownerId: string;
}

interface ImgBBResponse {
    data: {
        url: string;
        size: number;
    };
    success: boolean;
    status: number;
}

export async function uploadImgBB(req: UploadImgBBRequest): Promise<{ fileUrl: string; size: number } | { error: string }> {
    // TEMPORARY: Image upload is disabled.
    console.warn("UploadImgBB: Image upload is temporarily disabled.");
    return { error: "Obsługa plików jest tymczasowo wyłączona." };
}
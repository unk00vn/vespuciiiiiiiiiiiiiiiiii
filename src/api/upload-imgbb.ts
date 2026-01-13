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
    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

    if (!IMGBB_API_KEY) {
        return { error: "Brak klucza API ImgBB (VITE_IMGBB_API_KEY) w konfiguracji." };
    }

    try {
        let finalBase64 = req.base64Image;

        // Jeśli brakuje nagłówka MIME, dodaj go na podstawie fileType
        if (!finalBase64.startsWith('data:')) {
            finalBase64 = `data:${req.fileType};base64,${finalBase64}`;
        }

        // ImgBB oczekuje czystego base64 (bez nagłówka data:...) w polu 'image' 
        // lub pełnego URL. Jednak najbezpieczniejszą metodą dla multipart jest 
        // wysłanie tylko części po przecinku.
        const base64DataOnly = finalBase64.split(',')[1];

        const formData = new FormData();
        formData.append('image', base64DataOnly);
        formData.append('name', req.fileName);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const result: ImgBBResponse = await response.json();

        if (result.success) {
            // Zwracamy wyłącznie data.url zgodnie z wymaganiem
            return {
                fileUrl: result.data.url,
                size: result.data.size,
            };
        } else {
            return { error: "Błąd ImgBB: " + JSON.stringify(result) };
        }
    } catch (error: any) {
        console.error("Upload error:", error);
        return { error: "Błąd połączenia z API ImgBB: " + error.message };
    }
}
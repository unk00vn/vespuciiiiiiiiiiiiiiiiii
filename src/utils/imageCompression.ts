/**
 * Kompresuje obraz po stronie klienta, zwracając nowy obiekt File.
 * Obsługuje tylko obrazy (JPEG, PNG, WebP).
 * @param file Oryginalny plik
 * @param quality Jakość kompresji (0.1 do 1.0)
 * @param maxWidth Maksymalna szerokość obrazu
 * @returns Promise<File> lub oryginalny plik, jeśli nie jest obrazem lub jest mały.
 */
export function compressImage(file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/') || file.type.includes('svg')) {
            // Nie kompresuj, jeśli to nie jest typowy obraz rastrowy
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Skalowanie, jeśli obraz jest zbyt szeroki
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Konwersja do WebP (jeśli przeglądarka obsługuje) lub JPEG
                const outputType = 'image/webp'; 
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                            type: outputType,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        // W przypadku błędu, zwróć oryginalny plik
                        resolve(file);
                    }
                }, outputType, quality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}
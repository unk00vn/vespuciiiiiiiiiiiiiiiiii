/**
 * Kompresuje obraz po stronie klienta, zwracając nowy obiekt File.
 */
export function compressImage(file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> {
    // TEMPORARY: Image compression is disabled.
    console.warn("compressImage: Image compression is temporarily disabled.");
    return Promise.resolve(file);
}
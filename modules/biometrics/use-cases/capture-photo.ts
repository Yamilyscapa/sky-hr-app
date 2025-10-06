import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { IMAGE_PROCESSING_CONFIG } from "../config";

export interface ProcessedPhoto {
    uri: string;
    width: number;
    height: number;
}

/**
 * Redimensiona y procesa una imagen para la detección de rostros
 */
export async function processImageForDetection(imageUri: string): Promise<ProcessedPhoto> {
    console.log('🔄 Procesando imagen:', imageUri);
    
    const resizedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: IMAGE_PROCESSING_CONFIG.resizeWidth } }],
        { 
            compress: IMAGE_PROCESSING_CONFIG.compressionQuality, 
            format: SaveFormat.JPEG 
        }
    );
    
    console.log('✅ Imagen procesada:', resizedImage.uri, resizedImage.width, 'x', resizedImage.height);
    
    return {
        uri: resizedImage.uri,
        width: resizedImage.width,
        height: resizedImage.height,
    };
}

/**
 * Normaliza la URI de la imagen para asegurar que tenga el prefijo correcto
 * En iOS necesitamos el prefijo 'file://' si no lo tiene
 */
export function normalizeImageUri(uri: string): string {
    const normalizedUri = uri.startsWith('file://') 
        ? uri 
        : `file://${uri}`;
    
    return normalizedUri;
}

/**
 * Captura y procesa una foto desde la cámara
 */
export async function captureAndProcessPhoto(
    cameraRef: any,
    options: { quality?: number; base64?: boolean } = {}
): Promise<ProcessedPhoto | null> {
    if (!cameraRef) {
        console.warn('⚠️ No hay referencia a la cámara');
        return null;
    }

    const photo = await cameraRef.takePictureAsync({
        quality: options.quality ?? 0.7,
        base64: options.base64 ?? false,
    });

    console.log('📸 Foto capturada:', photo);

    if (!photo?.uri) {
        console.warn('⚠️ No se obtuvo URI de la foto');
        return null;
    }

    const processedImage = await processImageForDetection(photo.uri);
    
    return {
        uri: normalizeImageUri(processedImage.uri),
        width: processedImage.width,
        height: processedImage.height,
    };
}


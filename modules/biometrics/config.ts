import { FaceDetectionOptions, OvalBounds, PhotoCaptureOptions, ScannerDimensions } from "./types";

/**
 * Configuración por defecto para la detección de rostros
 */
export const DEFAULT_FACE_DETECTION_OPTIONS: FaceDetectionOptions = {
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'all',
    minFaceSize: 0.05,
};

/**
 * Configuración por defecto para la captura de fotos
 */
export const DEFAULT_PHOTO_CAPTURE_OPTIONS: PhotoCaptureOptions = {
    quality: 0.8,
    base64: true,
};

/**
 * Configuración del procesamiento de imágenes
 */
export const IMAGE_PROCESSING_CONFIG = {
    resizeWidth: 900,
    compressionQuality: 0.8,
} as const;

/**
 * Configuración de intervalos y tiempos de espera
 */
export const TIMING_CONFIG = {
    cameraInitDelay: 500,
    detectionInterval: 5000,
} as const;

/**
 * Dimensiones del óvalo del scanner facial
 */
export const SCANNER_DIMENSIONS = {
    width: 280,
    height: 360,
    distanceFromTop: 0.35,
} as const;

/**
 * Calcula las dimensiones del scanner basado en las dimensiones de la pantalla
 */
export function calculateScannerPosition(
    screenWidth: number,
    screenHeight: number
): ScannerDimensions {
    const { width, height, distanceFromTop } = SCANNER_DIMENSIONS;
    
    const top = screenHeight * distanceFromTop - height / 2;
    const left = (screenWidth - width) / 2;
    
    return {
        width,
        height,
        top,
        left,
    };
}

/**
 * Calcula los límites del óvalo del scanner
 */
export function calculateOvalBounds(
    screenWidth: number,
    screenHeight: number
): OvalBounds {
    const scannerDimensions = calculateScannerPosition(screenWidth, screenHeight);
    
    const centerX = scannerDimensions.left + scannerDimensions.width / 2;
    const centerY = scannerDimensions.top + scannerDimensions.height / 2;
    const radiusX = scannerDimensions.width / 2;
    const radiusY = scannerDimensions.height / 2;
    
    return {
        centerX,
        centerY,
        radiusX,
        radiusY,
    };
}


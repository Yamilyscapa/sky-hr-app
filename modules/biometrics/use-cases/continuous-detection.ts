import { Face } from "@react-native-ml-kit/face-detection";
import { captureAndDetectFaces } from "./detect-faces";
import { showFaceDetectionAlert } from "./show-alerts";
import { filterValidFaces } from "./validate-face-position";

/**
 * Contexto para manejar el estado de la detección
 */
export interface DetectionContext {
    intervalRef: ReturnType<typeof setInterval> | null;
    isDetecting: boolean;
    isMounted: boolean;
}

/**
 * Crea un contexto inicial para la detección
 */
export function createDetectionContext(): DetectionContext {
    return {
        intervalRef: null,
        isDetecting: false,
        isMounted: true,
    };
}

/**
 * Inicia la detección continua de rostros
 */
export function startDetection(
    context: DetectionContext,
    cameraRef: any,
    onFacesDetected: (faces: Face[]) => void,
    intervalMs: number = 2000,
    onDetectionComplete?: () => void,
    validatePosition: boolean = false
): DetectionContext {
    // Detener cualquier detección previa
    const cleanContext = stopDetection(context);
    
    const intervalRef = setInterval(async () => {
        await detectFaces(context, cameraRef, onFacesDetected, onDetectionComplete, validatePosition);
    }, intervalMs);
    
    return {
        ...cleanContext,
        intervalRef,
    };
}

/**
 * Detiene la detección continua
 */
export function stopDetection(context: DetectionContext): DetectionContext {
    if (context.intervalRef) {
        clearInterval(context.intervalRef);
    }
    
    return {
        ...context,
        intervalRef: null,
    };
}

/**
 * Realiza una detección única de rostros
 */
async function detectFaces(
    context: DetectionContext,
    cameraRef: any,
    onFacesDetected: (faces: Face[]) => void,
    onDetectionComplete?: () => void,
    validatePosition: boolean = false
): Promise<void> {
    if (!context.isMounted || !cameraRef || context.isDetecting) {
        return;
    }

    try {
        context.isDetecting = true;
        
        if (!cameraRef || !context.isMounted) {
            return;
        }

        const result = await captureAndDetectFaces(cameraRef);
        
        if (!context.isMounted || !result) {
            return;
        }

        // Filtrar rostros que estén centrados si se solicitó validación
        let validFaces = result.faces;
        if (validatePosition && result.imageWidth && result.imageHeight) {
            validFaces = filterValidFaces(result.faces, result.imageWidth, result.imageHeight);
            
            // Log para debugging
            if (result.faces.length > 0 && validFaces.length === 0) {
                console.log('⚠️ Rostro detectado fuera del óvalo del scanner');
            }
        }

        onFacesDetected(validFaces);
        
        if (validFaces.length > 0) {
            showFaceDetectionAlert(validFaces.length);
            
            // Detener la detección después de encontrar un rostro
            stopDetection(context);
            
            if (onDetectionComplete) {
                onDetectionComplete();
            }
        }
    } catch (error) {
        if (context.isMounted) {
            console.error('Error detecting faces:', error);
        }
    } finally {
        if (context.isMounted) {
            context.isDetecting = false;
        }
    }
}

/**
 * Limpia el contexto al desmontar
 */
export function cleanupDetection(context: DetectionContext): DetectionContext {
    const cleanContext = stopDetection(context);
    
    return {
        ...cleanContext,
        isMounted: false,
    };
}


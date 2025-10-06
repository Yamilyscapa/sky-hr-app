import { Face } from "@react-native-ml-kit/face-detection";
import { useEffect, useRef, useState } from "react";
import {
    cleanupDetection,
    createDetectionContext,
    startDetection,
} from "./use-cases/continuous-detection";

/**
 * Opciones para el hook de detección facial
 */
interface UseFaceDetectionOptions {
    enabled?: boolean;
    intervalMs?: number;
    initDelayMs?: number;
    onDetectionComplete?: () => void;
    validatePosition?: boolean;
}

/**
 * Hook personalizado para manejar la detección facial
 */
export function useFaceDetection(
    cameraRef: React.RefObject<any>,
    options: UseFaceDetectionOptions = {}
) {
    const {
        enabled = true,
        intervalMs = 2000,
        initDelayMs = 2000,
        onDetectionComplete,
        validatePosition = false,
    } = options;

    const [faces, setFaces] = useState<Face[]>([]);
    const detectionContextRef = useRef(createDetectionContext());

    useEffect(() => {
        if (!enabled || !cameraRef.current) {
            return;
        }

        // Esperar para que la cámara esté lista
        const timeout = setTimeout(() => {
            detectionContextRef.current = startDetection(
                detectionContextRef.current,
                cameraRef.current,
                setFaces,
                intervalMs,
                onDetectionComplete,
                validatePosition
            );
        }, initDelayMs);

        return () => {
            clearTimeout(timeout);
            detectionContextRef.current = cleanupDetection(
                detectionContextRef.current
            );
        };
    }, [enabled, cameraRef, intervalMs, initDelayMs, onDetectionComplete, validatePosition]);

    return { faces };
}

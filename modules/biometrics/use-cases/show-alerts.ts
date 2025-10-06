import { Alert } from "react-native";

/**
 * Muestra un alert cuando se detectan rostros
 */
export function showFaceDetectionAlert(faceCount: number): void {
    if (faceCount === 0) return;
    
    console.log('✅ ¡ROSTRO DETECTADO!');
    
    Alert.alert(
        '¡Rostro Detectado!',
        faceCount === 1 
            ? 'Se detectó 1 rostro' 
            : `Se detectaron ${faceCount} rostros`,
        [{ text: 'OK' }]
    );
}


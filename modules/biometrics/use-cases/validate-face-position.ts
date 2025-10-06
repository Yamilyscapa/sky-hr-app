import { Face } from "@react-native-ml-kit/face-detection";

/**
 * Valida si el rostro está centrado en la imagen (lo que indica que está en el óvalo)
 */
export function isFaceCentered(face: Face, imageWidth: number, imageHeight: number): boolean {
    const { frame } = face;
    
    // Calcular el centro del rostro
    const faceCenterX = frame.left + frame.width / 2;
    const faceCenterY = frame.top + frame.height / 2;
    
    // Calcular el centro de la imagen
    const imageCenterX = imageWidth / 2;
    const imageCenterY = imageHeight / 2;
    
    // Calcular la desviación del centro como porcentaje
    const deviationX = Math.abs(faceCenterX - imageCenterX) / imageWidth;
    const deviationY = Math.abs(faceCenterY - imageCenterY) / imageHeight;
    
    // El rostro debe estar centrado horizontalmente (±15%) y verticalmente (±20%)
    // Permitimos más tolerancia vertical porque el óvalo puede estar un poco arriba del centro
    const isHorizontallyCentered = deviationX < 0.15;
    const isVerticallyCentered = deviationY < 0.20;
    
    // Verificar que el rostro tenga un tamaño razonable (ni muy pequeño ni muy grande)
    const faceWidthRatio = frame.width / imageWidth;
    const faceHeightRatio = frame.height / imageHeight;
    const isSizeAppropriate = faceWidthRatio > 0.3 && faceWidthRatio < 0.85 &&
                              faceHeightRatio > 0.3 && faceHeightRatio < 0.85;
    
    const isCentered = isHorizontallyCentered && isVerticallyCentered && isSizeAppropriate;
    
    if (!isCentered) {
        console.log('📊 Análisis del rostro:', {
            deviationX: (deviationX * 100).toFixed(1) + '%',
            deviationY: (deviationY * 100).toFixed(1) + '%',
            faceWidthRatio: (faceWidthRatio * 100).toFixed(1) + '%',
            faceHeightRatio: (faceHeightRatio * 100).toFixed(1) + '%',
            isHorizontallyCentered,
            isVerticallyCentered,
            isSizeAppropriate,
        });
    }
    
    return isCentered;
}

/**
 * Filtra los rostros que están correctamente posicionados en el óvalo
 */
export function filterValidFaces(
    faces: Face[],
    imageWidth: number,
    imageHeight: number
): Face[] {
    return faces.filter(face => isFaceCentered(face, imageWidth, imageHeight));
}


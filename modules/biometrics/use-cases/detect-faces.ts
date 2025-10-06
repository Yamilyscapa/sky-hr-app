import FaceDetection, { Face } from "@react-native-ml-kit/face-detection";
import { DEFAULT_FACE_DETECTION_OPTIONS } from "../config";
import { FaceDetectionOptions, FaceDetectionResult } from "../types";
import { captureAndProcessPhoto } from "./capture-photo";

/**
 * Detecta rostros en una imagen usando ML Kit
 */
export async function detectFacesInImage(
    imageUri: string,
    options: FaceDetectionOptions = DEFAULT_FACE_DETECTION_OPTIONS
): Promise<Face[]> {
    const detectedFaces = await FaceDetection.detect(imageUri, options);
    
    return detectedFaces;
}

/**
 * Captura una foto y detecta rostros en ella
 */
export async function captureAndDetectFaces(
    cameraRef: any,
    options: FaceDetectionOptions = DEFAULT_FACE_DETECTION_OPTIONS
): Promise<FaceDetectionResult | null> {
    const processedPhoto = await captureAndProcessPhoto(cameraRef);
    
    if (!processedPhoto) {
        return null;
    }
    
    const faces = await detectFacesInImage(processedPhoto.uri, options);
    
    return {
        faces,
        imageUri: processedPhoto.uri,
        imageWidth: processedPhoto.width,
        imageHeight: processedPhoto.height,
    };
}


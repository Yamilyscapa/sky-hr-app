import FaceDetection, { Face } from "@react-native-ml-kit/face-detection";
import { defaultFaceDetectionOptions } from "../config";
import { FaceDetectionOptions, FaceDetectionResult } from "../types";
import { captureAndProcessPhoto } from "./capture-photo";

export async function detectFacesInImage(
    imageUri: string,
    options: FaceDetectionOptions = defaultFaceDetectionOptions
): Promise<Face[]> {
    const detectedFaces = await FaceDetection.detect(imageUri, options);
    
    return detectedFaces;
}

export async function captureAndDetectFaces(
    cameraRef: any,
    options: FaceDetectionOptions = defaultFaceDetectionOptions
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


import FaceScannerOverlay from "@/components/face-scanner-overlay";
import { useCameraPermission } from "@/hooks/use-camera-permission";
import { calculateScannerPosition, timingConfig } from "@/modules/biometrics/config";
import { CapturedImage } from "@/modules/biometrics/use-cases/continuous-detection";
import { useFaceDetection } from "@/modules/biometrics/use-face-detection";
import { CameraView } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function BiometricsScanner() {
    const { hasPermission, isLoading, requestPermission } = useCameraPermission();
    const { width, height } = useWindowDimensions();
    const cameraRef = useRef<any>(null);
    const [isCaptureDone, setIsCaptureDone] = useState(false);

    const handleDetectionComplete = useCallback((image: CapturedImage) => {
        setIsCaptureDone(true);
        let isImageValid = false;

        if (image.base64) {
            isImageValid = true;
        }

        if (isImageValid) {
            Alert.alert('Rostro capturado exitosamente', 'Listo para enviar a Rekognition');
        }

    }, []);

    useFaceDetection(cameraRef, {
        enabled: hasPermission && !isCaptureDone,
        intervalMs: timingConfig.detectionInterval,
        initDelayMs: timingConfig.cameraInitDelay,
        validatePosition: true,
        onDetectionComplete: handleDetectionComplete,
    });

    useEffect(() => {
        if (!hasPermission && !isLoading) {
            requestPermission();
        }
    }, [hasPermission, isLoading]);

    const scannerDimensions = calculateScannerPosition(width, height);

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>
                    Se necesitan permisos de cámara
                </Text>
            </View>
        );
    }

    return <>
        <CameraView
            ref={cameraRef}
            facing="front"
            style={styles.container}
        />

        <FaceScannerOverlay
            width={width}
            height={height}
            scannerWidth={scannerDimensions.width}
            scannerHeight={scannerDimensions.height}
            scannerTop={scannerDimensions.top}
            scannerLeft={scannerDimensions.left}
        />
    </>
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    successOverlay: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 200, 0, 0.9)',
        padding: 20,
        alignItems: 'center',
    },
    successText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    successSubtext: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        textAlign: 'center',
    },
});
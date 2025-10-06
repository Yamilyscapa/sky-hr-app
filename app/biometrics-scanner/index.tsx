import FaceScannerOverlay from "@/components/face-scanner-overlay";
import { useCameraPermission } from "@/hooks/use-camera-permission";
import {
    calculateScannerPosition,
    TIMING_CONFIG,
    useFaceDetection
} from "@/modules/biometrics";
import { CameraView } from "expo-camera";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function BiometricsScanner() {
    const { hasPermission, isLoading, requestPermission } = useCameraPermission();
    const { width, height } = useWindowDimensions();
    const cameraRef = useRef<any>(null);

    const { faces } = useFaceDetection(cameraRef, {
        enabled: hasPermission,
        intervalMs: TIMING_CONFIG.detectionInterval,
        initDelayMs: TIMING_CONFIG.cameraInitDelay,
         validatePosition: true,
    });

    useEffect(() => {
        if (!hasPermission && !isLoading) {
            requestPermission();
        }
    }, [hasPermission, isLoading]);

    // Calcular dimensiones del scanner
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
});
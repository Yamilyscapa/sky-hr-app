import FaceScannerOverlay from "@/components/face-scanner-overlay";
import { useCameraPermission } from "@/hooks/use-camera-permission";
import { CameraView } from "expo-camera";
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

export default function BiometricsScanner() {
    const { hasPermission, isLoading, requestPermission } = useCameraPermission();
    const { width, height } = useWindowDimensions();

    useEffect(() => {
        if (!hasPermission && !isLoading) {
            requestPermission();
        }
    }, [hasPermission, isLoading]);

    // Dimensiones del óvalo para el rostro (más alto que ancho)
    const scannerWidth = 280;
    const scannerHeight = 360;
    const distanceFromTop = 0.35;

    const scannerTop = height * distanceFromTop - scannerHeight / 2;
    const scannerLeft = (width - scannerWidth) / 2;

    return <>
        <CameraView
            facing="front"
            style={styles.container}
        >
        </CameraView>

        <FaceScannerOverlay
            width={width}
            height={height}
            scannerWidth={scannerWidth}
            scannerHeight={scannerHeight}
            scannerTop={scannerTop}
            scannerLeft={scannerLeft}
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
});
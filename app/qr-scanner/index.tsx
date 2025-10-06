import QRScannerOverlay from "@/components/qr-scanner-overlay";
import { useCameraPermission } from "@/hooks/use-camera-permission";
import { BarcodeScanningResult, CameraView } from "expo-camera";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

export default function QRScanner() {
    const { hasPermission, isLoading, requestPermission } = useCameraPermission();
    const { width, height } = useWindowDimensions();
    const isDevelopment = process.env.NODE_ENV === 'development';
    let isScanned = false;

    useEffect(() => {
        if (!hasPermission && !isLoading) {
            requestPermission();
        }
    }, [hasPermission, isLoading]);

    const handleBarcodeScanned = async (event: BarcodeScanningResult) => {
        if (isScanned) return;

        const scannerWidth = 250;
        const scannerHeight = 250;
        const distanceFromTop = 0.30;

        const scannerLeft = (width - scannerWidth) / 2;
        const scannerTop = height * distanceFromTop - scannerHeight / 2;
        const scannerRight = scannerLeft + scannerWidth;
        const scannerBottom = scannerTop + scannerHeight;

        // Verificar si al menos el 80% del código QR está dentro del área del scanner
        if (event.cornerPoints && event.cornerPoints.length > 0) {
            // Contar cuántos puntos del código QR están dentro del área
            const pointsInside = event.cornerPoints.filter(point => {
                return point.x >= scannerLeft &&
                    point.x <= scannerRight &&
                    point.y >= scannerTop &&
                    point.y <= scannerBottom;
            }).length;

            const percentageInside = pointsInside / event.cornerPoints.length;

            if (percentageInside >= 0.8) {
                isScanned = true;
                router.push('/biometrics-scanner');

                await new Promise(resolve => setTimeout(resolve, 1000));
                isScanned = false;
            }
        }
    }

    const scannerSize = 250;
    const scannerTop = height * 0.30 - scannerSize / 2;
    const scannerLeft = (width - scannerSize) / 2;
    const borderRadius = 16;

    return <>
        <CameraView
            facing="back"
            style={styles.container}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
        >
        </CameraView>

        <QRScannerOverlay
            width={width}
            height={height}
            scannerSize={scannerSize}
            scannerTop={scannerTop}
            scannerLeft={scannerLeft}
            borderRadius={borderRadius}
        />

        <View style={[styles.scanner, {
            top: scannerTop,
            left: scannerLeft,
        }]} />
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
        fontSize: 16,
        color: '#666',
    },
    scanner: {
        width: 250,
        height: 250,
        backgroundColor: 'transparent',
        borderRadius: 16,
        position: 'absolute',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
});
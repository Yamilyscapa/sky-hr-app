import QRScannerOverlay from "@/components/qr-scanner-overlay";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

export default function QRScanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [hasPermission, setHasPermission] = useState(false);
    const { width, height } = useWindowDimensions();
    let isScanned = false;

    useEffect(() => {
        if (permission?.status === 'granted') {
            setHasPermission(true);
        } else {
            requestPermission();
        }
    }, [permission]);

    const handleBarcodeScanned = (event: BarcodeScanningResult) => {
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
                alert(event.data);
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
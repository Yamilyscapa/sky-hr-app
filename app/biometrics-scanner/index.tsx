import api from "@/api";
import FaceScannerOverlay from "@/components/face-scanner-overlay";
import { useCameraPermission } from "@/hooks/use-camera-permission";
import { useLocation } from "@/hooks/use-location";
import { calculateScannerPosition, timingConfig } from "@/modules/biometrics/config";
import { CapturedImage } from "@/modules/biometrics/use-cases/continuous-detection";
import { useFaceDetection } from "@/modules/biometrics/use-face-detection";
import { CameraView } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function BiometricsScanner() {
    const { hasPermission, isLoading, requestPermission } = useCameraPermission();
    const { width, height } = useWindowDimensions();
    const cameraRef = useRef<any>(null);
    const [isCaptureDone, setIsCaptureDone] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const { location_id, organization_id } = useLocalSearchParams<{
        location_id?: string;
        organization_id?: string;
    }>();

    const { latitude, longitude, hasPermission: hasLocationPermission, isLoading: isLocationLoading, error: locationError } = useLocation();

    useEffect(() => {
        if (!location_id || !organization_id) {
            Alert.alert('QR invalido', 'El codigo QR no es correcto, intente nuevamente');
            router.replace('/qr-scanner');
        }
    }, [location_id, organization_id, router]);
    
    const handleDetectionComplete = useCallback(async (image: CapturedImage) => {
        if (!image.base64 || !location_id || !organization_id) {
            Alert.alert('Error', 'Datos incompletos para registrar asistencia');
            return;
        }

        if (!latitude || !longitude) {
            Alert.alert('Error de ubicación', 'No se pudo obtener tu ubicación. Asegúrate de haber otorgado permisos de ubicación.');
            return;
        }

        setIsCaptureDone(true);
        setIsSubmitting(true);

        try {
            await api.checkIn({
                organization_id,
                location_id,
                image: image.base64,
                latitude,
                longitude,
            });

            Alert.alert(
                'Asistencia registrada',
                'Tu entrada ha sido registrada exitosamente',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]
            );
        } catch (error) {
            console.error('Check-in error:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'No se pudo registrar la asistencia. Intenta nuevamente.'
            );
            setIsCaptureDone(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [location_id, organization_id, latitude, longitude, router]);

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

    if (isLocationLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.permissionText}>
                    Obteniendo ubicación...
                </Text>
            </View>
        );
    }

    if (!hasLocationPermission || locationError) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>
                    Se necesitan permisos de ubicación para registrar asistencia
                </Text>
                {locationError && (
                    <Text style={styles.errorText}>
                        {locationError}
                    </Text>
                )}
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

        {isSubmitting && (
            <View style={styles.submittingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.submittingText}>
                    Registrando asistencia...
                </Text>
            </View>
        )}
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
        marginTop: 16,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    submittingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submittingText: {
        color: 'white',
        fontSize: 16,
        marginTop: 16,
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
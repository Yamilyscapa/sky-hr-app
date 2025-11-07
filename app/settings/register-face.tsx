import api from "@/api";
import FaceScannerOverlay from "@/components/face-scanner-overlay";
import Button from "@/components/ui/button";
import { useActiveOrganization, useAuth, useUser } from "@/hooks/use-auth";
import { useCameraPermission } from "@/hooks/use-camera-permission";
import { getUserFaceUrls } from "@/lib/user";
import { calculateScannerPosition, timingConfig } from "@/modules/biometrics/config";
import { CapturedImage } from "@/modules/biometrics/use-cases/continuous-detection";
import { useFaceDetection } from "@/modules/biometrics/use-face-detection";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function RegisterFaceScreen() {
  const { hasPermission, isLoading, requestPermission } = useCameraPermission();
  const { session } = useAuth();
  const user = useUser();
  const activeOrganization = useActiveOrganization();
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const { width, height } = useWindowDimensions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptureDone, setIsCaptureDone] = useState(false);
  const faceUrls = useMemo(() => getUserFaceUrls(user), [user]);
  const hasRegisteredFace = faceUrls.length > 0;
  const hasOrganization = Boolean(activeOrganization);
  const requestedOnceRef = useRef(false);
  const submissionLockRef = useRef(false);
  const hasWarnedExistingFaceRef = useRef(false);

  useEffect(() => {
    if (hasRegisteredFace && !hasWarnedExistingFaceRef.current) {
      hasWarnedExistingFaceRef.current = true;
      Alert.alert(
        'Rostro registrado',
        'Ya cuentas con un registro biométrico activo.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [hasRegisteredFace, router]);

  useEffect(() => {
    if (!hasPermission && !isLoading && !requestedOnceRef.current) {
      requestedOnceRef.current = true;
      requestPermission();
    }
  }, [hasPermission, isLoading, requestPermission]);

  const refetchSession = session.refetch;

  const handleDetectionComplete = useCallback(async (image: CapturedImage | null) => {
    if (submissionLockRef.current || isCaptureDone) {
      return;
    }

    if (!image?.uri) {
      return;
    }

    submissionLockRef.current = true;
    setIsCaptureDone(true);
    setIsSubmitting(true);

    try {
      await api.registerFace(image.uri);
      refetchSession();
      hasWarnedExistingFaceRef.current = true;
      Alert.alert(
        'Registro completado',
        'Tu rostro fue registrado exitosamente.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Face registration error:', error);
      Alert.alert(
        'No pudimos registrar tu rostro',
        error instanceof Error ? error.message : 'Intenta nuevamente en unos minutos.'
      );
      submissionLockRef.current = false;
      setIsCaptureDone(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isCaptureDone, refetchSession, router]);

  useFaceDetection(cameraRef, {
    enabled: hasPermission && !isCaptureDone && !hasRegisteredFace && hasOrganization,
    intervalMs: timingConfig.detectionInterval,
    initDelayMs: timingConfig.cameraInitDelay,
    validatePosition: true,
    onDetectionComplete: handleDetectionComplete,
  });

  if (!hasOrganization) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Necesitas una organización activa para registrar tu rostro.
        </Text>
        <Button onPress={() => router.replace('/(tabs)')}>Volver al inicio</Button>
      </View>
    );
  }

  if (hasRegisteredFace) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#0051FE" />
        <Text style={styles.permissionText}>Verificando permisos de cámara…</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Necesitamos acceso a la cámara para registrar tu rostro.
        </Text>
        <Button onPress={() => requestPermission()}>Otorgar permiso</Button>
      </View>
    );
  }

  const scanner = calculateScannerPosition(width, height);

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        facing="front"
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Alinea tu rostro</Text>
        <Text style={styles.instructionsSubtitle}>
          Mantén tu mirada al frente y ubica tu cara dentro del óvalo hasta que se complete el registro.
        </Text>
      </View>

      <FaceScannerOverlay
        width={width}
        height={height}
        scannerWidth={scanner.width}
        scannerHeight={scanner.height}
        scannerTop={scanner.top}
        scannerLeft={scanner.left}
      />

      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.submittingText}>Registrando tu rostro...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  instructions: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  instructionsSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
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
    gap: 16,
  },
  submittingText: {
    color: '#fff',
    fontSize: 16,
  },
});

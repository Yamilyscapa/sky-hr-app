import { useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";

export function useCameraPermission() {
    const [permission, requestPermission] = useCameraPermissions();
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        if (permission?.status === 'granted') {
            setHasPermission(true);
        } else if (permission?.status === 'denied') {
            setHasPermission(false);
        }
    }, [permission]);

    const requestCameraPermission = async () => {
        const result = await requestPermission();
        return result.granted;
    };

    return {
        hasPermission,
        isLoading: permission === null,
        isDenied: permission?.status === 'denied',
        requestPermission: requestCameraPermission,
    };
}


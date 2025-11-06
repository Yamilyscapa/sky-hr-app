import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useLocation() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                setHasPermission(status === 'granted');
                
                if (status === 'granted') {
                    const currentLocation = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });
                    setLocation(currentLocation);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to get location');
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const refreshLocation = async () => {
        if (!hasPermission) {
            setError('Location permission not granted');
            return null;
        }

        try {
            setIsLoading(true);
            setError(null);
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(currentLocation);
            return currentLocation;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to get location';
            setError(errorMsg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        location,
        hasPermission,
        isLoading,
        error,
        refreshLocation,
        latitude: location?.coords.latitude.toString(),
        longitude: location?.coords.longitude.toString(),
    };
}



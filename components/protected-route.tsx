import { useAuth } from '@/hooks/use-auth';
import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Note: Session loading is now handled by AuthProvider
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, isInitialized } = useAuth();
    const segments = useSegments();
    
    const isAuthRoute = segments[0] === 'auth';
    const isAuthenticated = !!session.data?.user;

    useEffect(() => {
        // Only run navigation logic after auth is fully initialized
        if (!isInitialized) {
            return;
        }

        // If not authenticated and not on an auth route, redirect to login
        if (!isAuthenticated && !isAuthRoute) {
            router.replace('/auth/sign-in');
        }

        // If authenticated and on an auth route, redirect to home
        if (isAuthenticated && isAuthRoute) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isAuthRoute, isInitialized]);

    // AuthProvider already handles loading state, so just render children
    return <>{children}</>;
}


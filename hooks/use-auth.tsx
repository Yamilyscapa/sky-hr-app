import { authClient } from '@/lib/auth-client';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Authentication context type
 */
interface AuthContextType {
    session: ReturnType<typeof authClient.useSession>;
    signIn: typeof authClient.signIn;
    signUp: typeof authClient.signUp;
    signOut: typeof authClient.signOut;
    isInitialized: boolean;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component
 * Wraps the Better Auth client and provides authentication state and methods
 * Ensures session is loaded from SecureStore before rendering children
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const session = authClient.useSession();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Wait for the initial session check to complete
        // This ensures SecureStore has been checked before rendering
        if (!session.isPending) {
            setIsInitialized(true);
        }
    }, [session.isPending]);

    const value: AuthContextType = {
        session,
        signIn: authClient.signIn,
        signUp: authClient.signUp,
        signOut: authClient.signOut,
        isInitialized,
    };

    // Show loading screen while initializing session from SecureStore
    if (!isInitialized) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

/**
 * Hook to access authentication context
 * @returns Authentication context with session state and auth methods
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export function useIsAuthenticated() {
    const { session } = useAuth();
    return !!session.data?.user;
}

/**
 * Hook to get current user
 * @returns Current user object or null if not authenticated
 */
export function useUser() {
    const { session } = useAuth();
    return session.data?.user ?? null;
}


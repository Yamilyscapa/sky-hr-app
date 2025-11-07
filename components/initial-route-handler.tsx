import { useAuth } from '@/hooks/use-auth';
import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

/**
 * Initial Route Handler Component
 * Handles routing based on authentication and organization state
 * Priority 1: Check if user is authenticated
 * Priority 2: If authenticated, check if user has an organization
 */
export default function InitialRouteHandler() {
    const { session, activeOrganization, organizations, isInitialized } = useAuth();
    const segments = useSegments();
    
    const isAuthRoute = segments[0] === 'auth' || segments[0] === undefined;
    const isNoOrgRoute = segments[0] === 'no-organization';
    const isTabsRoute = segments[0] === '(tabs)';
    const isAuthenticated = !!session.data?.user;
    
    // Wait for organization data to finish loading before making routing decisions
    const isOrganizationDataLoaded = !activeOrganization.isPending && !organizations.isPending;
    const hasOrganization = Boolean(activeOrganization.data) || (organizations.data?.length ?? 0) > 0;

    useEffect(() => {
        // Only run navigation logic after auth is fully initialized
        if (!isInitialized) {
            return;
        }

        // Priority 1: Check if user is authenticated
        if (!isAuthenticated) {
            // If not authenticated and not on an auth route, redirect to welcome
            if (!isAuthRoute) {
                router.replace('/auth/welcome');
            }
            return;
        }

        // Wait for organization data to load before checking organization state
        if (!isOrganizationDataLoaded) {
            return;
        }

        // User is authenticated, now check organization (Priority 2)
        if (!hasOrganization) {
            // If no organization and not on no-organization route, redirect there
            if (!isNoOrgRoute && !isAuthRoute) {
                router.replace('/no-organization');
            }
            return;
        }

        // User is authenticated and has organization
        // If on auth route or no-org route, redirect to tabs
        if ((isAuthRoute || isNoOrgRoute) && !isTabsRoute) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, hasOrganization, isAuthRoute, isNoOrgRoute, isTabsRoute, isInitialized, isOrganizationDataLoaded]);

    return null;
}


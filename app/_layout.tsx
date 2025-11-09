import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import InitialRouteHandler from '@/components/initial-route-handler';
import { AuthProvider } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocationProvider } from '@/hooks/use-location';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'auth/welcome',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LocationProvider>
        <InitialRouteHandler />
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerBackVisible: true,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="qr-scanner/index"
              options={{
                title: 'Escanear QR',
                headerBackTitle: 'Cancelar',
                headerBackVisible: true,
              }}
            />
            <Stack.Screen
              name="qr-checkout/index"
              options={{
                title: 'Registrar salida',
                headerBackTitle: 'Cancelar',
                headerBackVisible: true,
              }}
            />
            <Stack.Screen
              name="biometrics-scanner/index"
              options={{
                title: 'Escanear Biometrico',
                headerBackTitle: 'Cancelar',
                headerBackVisible: true,
              }}
            />
            <Stack.Screen
              name="settings/register-face"
              options={{
                title: 'Registrar rostro',
                headerBackTitle: 'Atrás',
                headerBackVisible: true,
              }}
            />
            <Stack.Screen
              name="settings/index"
              options={{
                title: 'Ajustes',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/welcome"
              options={{
                title: 'Bienvenido',
                headerShown: false,
                
              }}
            />
            <Stack.Screen
              name="auth/sign-up"
              options={{
                title: 'Crear cuenta',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/sign-in"
              options={{
                title: 'Iniciar sesión',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="no-organization"
              options={{
                title: 'Invitación pendiente',
                headerShown: false,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

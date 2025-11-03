import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
} from 'react-native';
import Button from '@/components/ui/button';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signUp.email({
                email,
                password,
                name,
            });

            if (result.error) {
                Alert.alert('Error', result.error.message || 'Error al registrarse');
            } else {
                Alert.alert(
                    'Éxito',
                    'Cuenta creada exitosamente',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(tabs)'),
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Error al registrarse. Por favor intenta de nuevo.');
            console.error('Sign up error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToSignIn = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.form}>
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Regístrate para comenzar</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        autoComplete="name"
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="password"
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="password"
                        editable={!isLoading}
                    />

                    <Button
                        title={isLoading ? 'Registrando...' : 'Registrarse'}
                        onPress={handleSignUp}
                        disabled={isLoading}
                        style={styles.button}
                    />

                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={navigateToSignIn} disabled={isLoading}>
                            <Text style={styles.signInLink}>Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 8,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signInText: {
        fontSize: 16,
        color: '#666',
    },
    signInLink: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});


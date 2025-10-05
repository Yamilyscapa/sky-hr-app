import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import ThemedText from "../themed-text";

export default function Button({ children, type = 'primary', style, onPress }: { children: React.ReactNode, type?: 'primary' | 'secondary', style?: ViewStyle, onPress?: () => void }) {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'tint');
  return (
    <TouchableOpacity style={[styles.button, type === 'secondary' && styles.secondary, { backgroundColor: type === 'secondary' ? secondaryColor : primaryColor }, style]} onPress={onPress}>
      <ThemedText style={[styles.text, type === 'secondary' && { color: primaryColor }]}>{children}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 18,
    borderRadius: 100,
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
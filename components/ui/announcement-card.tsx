import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import ThemedText from "../themed-text";

export default function AnnouncementCard({ title, category }: { title: string, category: string }) {
  const themeColor = useThemeColor({}, 'neutral');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { borderColor: themeColor, backgroundColor: cardColor }]}>
      <ThemedText style={{ color: textColor }}>{title}</ThemedText>
      <ThemedText style={{ color: textColor }}>{category}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
});
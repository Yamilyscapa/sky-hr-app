import ThemedText from "@/components/themed-text";
import AnnouncementCard from "@/components/ui/announcement-card";
import Button from "@/components/ui/button";
import ThemedView from "@/components/ui/themed-view";
import { TextSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const user = { firstName: 'Juan' }
  const themeColor = useThemeColor({}, 'neutral');
  const primaryColor = useThemeColor({}, 'primary');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const colorScheme = useColorScheme();

  const accentColor = colorScheme === 'dark' ? tintColor : primaryColor;
  const headerBackgroundColor = colorScheme === 'dark' ? primaryColor : tintColor;

  // Mock data
  const announcements = [
    { id: '1', title: 'Aviso 1', category: 'Event' },
    { id: '2', title: 'Aviso 2', category: 'News' },
    { id: '3', title: 'Aviso 3', category: 'Learning' },
    { id: '4', title: 'Aviso 4', category: 'Event' },
    { id: '5', title: 'Aviso 5', category: 'News' },
    { id: '6', title: 'Aviso 6', category: 'Learning' },
    { id: '7', title: 'Aviso 7', category: 'Event' },
    { id: '8', title: 'Aviso 8', category: 'News' },
    { id: '9', title: 'Aviso 9', category: 'Learning' },
    { id: '10', title: 'Aviso 10', category: 'Event' },
  ];

  return <>
    <SafeAreaView>
      <ThemedView>
        <View style={styles.header}>
          <View style={[styles.headerBackground, headerBackgroundColor && { backgroundColor: headerBackgroundColor }]} />
          <ThemedText style={{ fontSize: TextSize.h1, fontWeight: 'bold' }}>Bienvenido</ThemedText>
          <ThemedText style={{ fontSize: TextSize.h1, fontWeight: 'medium' }}>{user.firstName}</ThemedText>
        </View>

        <View style={[styles.attendanceController, { borderColor: themeColor, borderWidth: 1, backgroundColor: cardColor }]}>
          <View>
            <ThemedText style={{ fontSize: TextSize.p, fontWeight: 'bold', color: accentColor }}>Recuerda</ThemedText>
            <ThemedText style={{ fontSize: TextSize.h2, fontWeight: 'medium', marginTop: 8 }}>Registrar tu asistencia</ThemedText>
          </View>

          <View style={styles.attendanceControllerButtons}>
            <Button style={{ flex: 7 }} onPress={() => router.navigate('/qr-scanner')}>Registrar</Button>
            <Button type="secondary" style={{ flex: 3 }}>Ver más</Button>
          </View>
        </View>

        <View style={styles.announcements}>
            <ThemedText style={{ fontSize: TextSize.h2, fontWeight: '600' }}>Avisos</ThemedText>
          <View style={[styles.announcementsCard, { borderColor: themeColor, borderWidth: 1, backgroundColor: cardColor }]}>
            {/* Announcements rendering */}
            <FlatList contentContainerStyle={{ gap: 8 }} data={announcements} renderItem={({ item }) => <AnnouncementCard title={item.title} category={item.category} />}></FlatList>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  </>
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: -200,
    left: -200,
    right: -200,
    bottom: -80,
  },
  attendanceController: {
    display: 'flex',
    gap: 16,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 28,
  },
  attendanceControllerButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  announcements: {
    height: 300,
    paddingTop: 24,
  },
  announcementsCard: {
    marginTop: 20,
    height: 300,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
});
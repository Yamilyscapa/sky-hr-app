import api from "@/api";
import DebugMenu from "@/components/debug-menu";
import ThemedText from "@/components/themed-text";
import AnnouncementCard from "@/components/ui/announcement-card";
import Button from "@/components/ui/button";
import ThemedView from "@/components/ui/themed-view";
import { ATTENDANCE_REFRESH_EVENT } from "@/constants/events";
import { TextSize } from "@/constants/theme";
import { useUser } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AttendanceEvent {
  data: {
    id: string;
    organization_id: string;
    user_id: string;
    location_id: string;
    start_time: string;
    check_out: string | null;
  };
}

async function getTodayAttendanceEvent(userId: string): Promise<AttendanceEvent | null> {
  if (!userId) {
    return null;
  }

  try {
    const response = await api.getTodayAttendanceEvent(userId);

    // 404 is a valid state (no attendance event today)
    if (response.status === 404) {
      return null;
    }

    if (response.status !== 200) {
      return null;
    }
    
    if (!response.data || response.data.check_out) {
      return null;
    }

    return response.data as AttendanceEvent;
  } catch (error) {
    console.error('Failed to fetch attendance event', error);
    return null;
  }
}

export default function Index() {
  const user = useUser() ?? { name: 'Usuario', id: '' };
  const themeColor = useThemeColor({}, 'neutral');
  const primaryColor = useThemeColor({}, 'primary');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const colorScheme = useColorScheme();
  const [todayAttendanceEvent, setTodayAttendanceEvent] = useState<AttendanceEvent | null>(null);

  // Organization access is controlled by the (protected) layout guard,
  // so users without orgs never reach this screen.

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

  const refreshTodayAttendanceEvent = useCallback(async () => {
    try {
      const attendanceEvent = await getTodayAttendanceEvent(user.id);

      if (!attendanceEvent || attendanceEvent.data.check_out) {
        setTodayAttendanceEvent(null);
        return;
      }

      setTodayAttendanceEvent(attendanceEvent);
    } catch (error) {
      console.log('Failed to fetch attendance event', error);
      setTodayAttendanceEvent(null);
    }
  }, [user.id]);

  useEffect(() => {
    router.prefetch('/(protected)/qr-scanner');
    router.prefetch('/(protected)/qr-checkout');
    refreshTodayAttendanceEvent();
  }, [refreshTodayAttendanceEvent]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      ATTENDANCE_REFRESH_EVENT,
      () => {
        refreshTodayAttendanceEvent();
      },
    );

    return () => subscription.remove();
  }, [refreshTodayAttendanceEvent]);

  useFocusEffect(
    useCallback(() => {
      refreshTodayAttendanceEvent();
    }, [refreshTodayAttendanceEvent]),
  );

  const hasActiveAttendance = Boolean(todayAttendanceEvent);

  const handleAttendanceAction = () => {
    console.log('todayAttendanceEvent', todayAttendanceEvent);
    
    if (!todayAttendanceEvent) {
      router.push('/(protected)/qr-scanner');
      return;
    }

    const { data: { id, location_id } } = todayAttendanceEvent;
    if (id && location_id) {
      router.push({
        pathname: '/(protected)/qr-checkout',
        params: {
          attendance_event_id: id,
          location_id: location_id,
        },
      });
      return;
    }

    router.push('/(protected)/qr-scanner');
  };

  const attendanceActionLabel = hasActiveAttendance ? 'Marcar salida' : 'Registrar entrada';

  return <>
    <SafeAreaView>
      <ThemedView>
        <DebugMenu screenName="Home" />
        <View style={styles.header}>
          <View style={[styles.headerBackground, headerBackgroundColor && { backgroundColor: headerBackgroundColor }]} />
          <ThemedText style={{ fontSize: TextSize.h1, fontWeight: 'bold' }}>Bienvenido</ThemedText>
          <ThemedText style={{ fontSize: TextSize.h1, fontWeight: 'medium' }}>{user.name}</ThemedText>
        </View>

        <View style={[styles.attendanceController, { borderColor: themeColor, borderWidth: 1, backgroundColor: cardColor }]}>
          <View>
            <ThemedText style={{ fontSize: TextSize.p, fontWeight: 'bold', color: accentColor }}>Recuerda</ThemedText>
            <ThemedText style={{ fontSize: TextSize.h2, fontWeight: 'medium', marginTop: 8 }}> Registrar tu asistencia</ThemedText>
          </View>

          <View style={styles.attendanceControllerButtons}>
            <Button style={{ flex: 7 }} onPress={handleAttendanceAction}>{attendanceActionLabel}</Button>
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

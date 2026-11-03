import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { getPermissionsAsync, requestPermissionsAsync } from "expo-notifications/build/NotificationPermissions";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";
import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";
import { setNotificationChannelAsync } from "expo-notifications/build/setNotificationChannelAsync";

const CLAVE_MAPA = "notificacionesReservas";
const CANAL = "reservas";
const MS_24_HORAS = 24 * 60 * 60 * 1000;

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type MapaNotificaciones = Record<string, string>;

async function leerMapa(): Promise<MapaNotificaciones> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE_MAPA);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function guardarMapa(mapa: MapaNotificaciones) {
  await AsyncStorage.setItem(CLAVE_MAPA, JSON.stringify(mapa));
}

let canalCreado = false;

export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      await setNotificationChannelAsync(CANAL, {
        name: "Recordatorios de reservas",
        importance: 4 as never,
      });
      canalCreado = true;
    } catch (e) {
      console.log("No se pudo crear el canal de notificaciones:", e);
    }
  }

  const { status: actual } = await getPermissionsAsync();
  if (actual === "granted") return true;

  const { status } = await requestPermissionsAsync();
  return status === "granted";
}

type DatosRecordatorio = {
  reservaId: number | string;
  fecha: string; 
  hora: string; 
  nombreServicio: string;
};

export async function programarRecordatorioReserva({
  reservaId,
  fecha,
  hora,
  nombreServicio,
}: DatosRecordatorio): Promise<string | null> {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);

  const fechaReserva = new Date(anio, mes - 1, dia, horas, minutos);
  const momentoAviso = new Date(fechaReserva.getTime() - MS_24_HORAS);

  if (momentoAviso.getTime() <= Date.now()) return null;

  const { status } = await getPermissionsAsync();
  if (status !== "granted") return null;

  const notificationId = await scheduleNotificationAsync({
    content: {
      title: "Recordatorio de reserva",
      body: `Mañana tienes tu reserva de ${nombreServicio} a las ${hora.slice(0, 5)}.`,
      data: { reservaId },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: momentoAviso,
      channelId: CANAL,
    },
  });

  const mapa = await leerMapa();
  mapa[String(reservaId)] = notificationId;
  await guardarMapa(mapa);

  return notificationId;
}

export async function cancelarRecordatorioReserva(reservaId: number | string) {
  const mapa = await leerMapa();
  const notificationId = mapa[String(reservaId)];
  if (!notificationId) return;

  await cancelScheduledNotificationAsync(notificationId);
  delete mapa[String(reservaId)];
  await guardarMapa(mapa);
}

export async function cancelarTodosLosRecordatorios() {
  await cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(CLAVE_MAPA);
}
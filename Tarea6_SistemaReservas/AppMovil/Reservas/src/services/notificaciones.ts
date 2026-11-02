import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CLAVE_MAPA = "notificacionesReservas";
const CANAL = "reservas";
const MS_24_HORAS = 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
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

export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: "Recordatorios de reservas",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: actual } = await Notifications.getPermissionsAsync();
  if (actual === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
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

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Recordatorio de reserva",
      body: `Mañana tienes tu reserva de ${nombreServicio} a las ${hora.slice(0, 5)}.`,
      data: { reservaId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
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

  await Notifications.cancelScheduledNotificationAsync(notificationId);
  delete mapa[String(reservaId)];
  await guardarMapa(mapa);
}

export async function cancelarTodosLosRecordatorios() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(CLAVE_MAPA);
}
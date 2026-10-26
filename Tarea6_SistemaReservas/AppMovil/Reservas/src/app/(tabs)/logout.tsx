import { cerrarSesion } from "@/services/auth";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

export default function TabLogOut() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      Alert.alert(
        "Cerrar sesión",
        "¿Seguro que quieres salir?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => router.navigate("/servicios/home"), // vuelve a una pestaña normal
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: async () => {
              await cerrarSesion();
              router.replace("/"); // ruta de tu login
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => router.navigate("/servicios/home"), // Android: tocar fuera del diálogo
        },
      );
    }, [router]),
  );

  return null;
}

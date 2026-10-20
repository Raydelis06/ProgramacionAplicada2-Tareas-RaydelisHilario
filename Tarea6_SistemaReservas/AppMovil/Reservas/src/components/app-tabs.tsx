import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors.light;
  const [esAdmin, setEsAdmin] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const verificarRolYCargar = async () => {
        try {
          const rol = await AsyncStorage.getItem("rol");
          setEsAdmin(rol === "admin");
        } catch (error) {
          console.error("Error al cargar datos:", error);
        }
      };

      void verificarRolYCargar();
    }, []),
  );

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      {esAdmin && (
        <NativeTabs.Trigger name="crearServicio">
          <NativeTabs.Trigger.Label>Crear servicio</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require("@/assets/images/tabIcons/plus.png")}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      )}

      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logout">
        <NativeTabs.Trigger.Label>Salir</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/logout.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

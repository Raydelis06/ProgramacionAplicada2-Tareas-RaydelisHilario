import { Stack } from "expo-router";
import React from "react";

export default function ServiciosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="crearServicio" />
      <Stack.Screen name="editarServicio" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

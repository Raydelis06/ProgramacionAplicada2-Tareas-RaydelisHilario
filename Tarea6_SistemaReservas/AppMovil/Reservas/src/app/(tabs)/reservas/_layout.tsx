import { Stack } from "expo-router";
import React from "react";

export default function ReservasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nueva" />
    </Stack>
  );
}

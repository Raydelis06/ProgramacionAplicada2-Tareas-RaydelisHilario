import { Colors } from "@/constants/theme";
import { actualizarPerfil, cerrarSesion, obtenerPerfil } from "@/services/auth";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PerfilScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [nombreEditado, setNombreEditado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      (async () => {
        try {
          const perfil = await obtenerPerfil();
          if (!activo) return;
          setNombre(perfil.nombre);
          setEmail(perfil.email);
          setNombreEditado(perfil.nombre);
        } catch (error) {
          if (activo) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "No se pudo cargar el perfil.",
            );
          }
        } finally {
          if (activo) setCargando(false);
        }
      })();

      return () => {
        activo = false;
      };
    }, []),
  );

  const nombreLimpio = nombreEditado.trim().replace(/\s+/g, " ");
  const hayCambios = nombreLimpio.length >= 2 && nombreLimpio !== nombre;

  const handleGuardar = async () => {
    if (!hayCambios || guardando) return;
    setGuardando(true);
    try {
      const nuevoNombre = await actualizarPerfil(nombreLimpio);
      setNombre(nuevoNombre);
      setNombreEditado(nuevoNombre);
      Alert.alert("Listo", "Tu nombre se actualizó correctamente.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo actualizar el nombre.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await cerrarSesion();
            router.replace("/");
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color={Colors.light.principal} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("@/assets/images/logo_sublime.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.card}>
          <Text style={styles.nombre} numberOfLines={1}>{nombre}</Text>
          <Text style={styles.email} numberOfLines={1}>{email}</Text>
        </View>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombreEditado}
          onChangeText={setNombreEditado}
          placeholder="Tu nombre"
          placeholderTextColor="#98a2b3"
          autoCapitalize="words"
          maxLength={100}
          editable={!guardando}
        />
        <TouchableOpacity
          style={[styles.guardarButton, (!hayCambios || guardando) && styles.buttonDisabled]}
          onPress={handleGuardar}
          disabled={!hayCambios || guardando}
          activeOpacity={0.8}
        >
          {guardando ? (
            <ActivityIndicator color={Colors.light.light_color} />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.separador} />

        <TouchableOpacity
          style={styles.salirButton}
          onPress={handleCerrarSesion}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.light_color 
  },
  content: { 
    padding: 24, 
    paddingBottom: 40 
  },
  centrado: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  logo: { 
    width: 80, 
    height: 80, 
    resizeMode: "contain", 
    alignSelf: "flex-end" 
  },
  title: {
    color: Colors.light.principal,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nombre: {
    color: Colors.light.principal,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: { 
    color: "#667085", 
    fontSize: 15 
  },
  label: {
    color: Colors.light.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#dcdbdb",
    borderRadius: 10,
    borderWidth: 1,
    color: "#101828",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  guardarButton: {
    alignItems: "center",
    backgroundColor: Colors.light.principal,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 52,
  },
  salirButton: {
    alignItems: "center",
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { 
    color: Colors.light.light_color, 
    fontSize: 16, 
    fontWeight: "700" },
  separador: { 
    borderTopWidth: 1, 
    borderColor: "#dcdbdb",
    marginVertical: 24 },
});
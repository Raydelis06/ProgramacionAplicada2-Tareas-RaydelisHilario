import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import React from "react";
import { registrarUsuario } from "../services/auth";

export default function registroScreen() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegistrarse = async () => {
    if (!email.trim() || !password) {
      setError("Todos los campos son requeridos");
      return;
    }

    setCargando(true);
    setError("");
    try {
      await registrarUsuario(nombre, email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar el registro.",
      );
    } finally {
      setCargando(false);
    }
  };

  const irLogin = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo_sublime.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Registro</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
        placeholderTextColor={Colors.light.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@email.com"
        placeholderTextColor={Colors.light.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="********"
        placeholderTextColor={Colors.light.placeholder}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, cargando && styles.buttonDisabled]}
        onPress={handleRegistrarse}
        disabled={cargando}
      >
        <Text style={styles.buttonText}>
          {cargando ? "Registrando..." : "Registrarse"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={irLogin}>
        <Text style={styles.link}>Ya tienes una cuenta? inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: Colors.light.principal,
  },
  logo: {
    width: "80%",
    height: "20%",
    alignSelf: "center",
    marginBottom: 50,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.secondary,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#ffffff8d",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#ffffff33",
    color: Colors.light.secondary,
  },
  button: {
    marginTop: 8,
    backgroundColor: Colors.light.principal,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.light.light_color,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    color: Colors.light.error,
    marginBottom: 12,
  },
  link: {
    marginTop: 16,
    color: Colors.light.placeholder,
    fontSize: 14,
    textAlign: "center",
  },
});

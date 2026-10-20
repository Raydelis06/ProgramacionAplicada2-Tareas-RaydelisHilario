import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { crearServicio } from "../../services/servicios";

export default function CrearServicioScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardarServicio = async () => {
    const precioNumerico = Number(precio.replace(",", "."));
    const duracionNumerica = Number(duracion);

    if (!nombre.trim() || !descripcion.trim() || !precio || !duracion) {
      Alert.alert("Datos incompletos", "Completa todos los campos.");
      return;
    }
    if (!Number.isFinite(precioNumerico) || precioNumerico <= 0) {
      Alert.alert("Precio inválido", "Ingresa un precio mayor que cero.");
      return;
    }
    if (!Number.isInteger(duracionNumerica) || duracionNumerica <= 0) {
      Alert.alert("Duración inválida", "Ingresa la duración en minutos.");
      return;
    }

    try {
      setGuardando(true);
      await crearServicio(
        nombre.trim(),
        descripcion.trim(),
        precioNumerico,
        duracionNumerica,
      );
      Alert.alert("Servicio creado", "El servicio se guardó correctamente.", [
        { text: "Aceptar", onPress: () => router.replace("/(tabs)/home") },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo crear el servicio.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require("../../../assets/images/logo_sublime.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Crear servicio</Text>
      <Text style={styles.subtitle}>Completa la información del servicio.</Text>
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Corte de cabello"
        placeholderTextColor={Colors.light.placeholder}
        value={nombre}
        onChangeText={setNombre}
        maxLength={100}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe brevemente el servicio"
        placeholderTextColor={Colors.light.placeholder}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        textAlignVertical="top"
        maxLength={500}
      />

      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={Colors.light.placeholder}
        value={precio}
        onChangeText={setPrecio}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Duración (minutos)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 30"
        placeholderTextColor={Colors.light.placeholder}
        value={duracion}
        onChangeText={setDuracion}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={[styles.button, guardando && styles.buttonDisabled]}
        onPress={guardarServicio}
        disabled={guardando}
        activeOpacity={0.8}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar servicio</Text>
        )}
      </TouchableOpacity>
      <Text></Text>
      <Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.light.light_color,
  },
  title: {
    color: Colors.light.principal,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    alignSelf: "flex-end",
  },
  label: {
    color: Colors.light.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#d0d5dd",
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.light.secondary,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: Colors.light.principal,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: Colors.light.light_color,
    fontSize: 16,
    fontWeight: "700",
  },
});

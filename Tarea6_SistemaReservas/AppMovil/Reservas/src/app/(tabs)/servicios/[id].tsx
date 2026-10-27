import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  eliminarServicio,
  obtenerServicios,
  type Servicio,
} from "../../../services/servicios";

export default function DetalleServicioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);

  const cargarDetalleServicio = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const rol = await AsyncStorage.getItem("rol");
      setEsAdmin(rol === "admin");

      const servicios = await obtenerServicios();
      const encontrado = servicios.find((s) => s.id === Number(id));

      if (encontrado) {
        setServicio(encontrado);
      } else {
        setError("No se encontró el servicio solicitado.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el servicio.",
      );
    } finally {
      setCargando(false);
    }
  }, [id]);

  React.useEffect(() => {
    void cargarDetalleServicio();
  }, [cargarDetalleServicio]);

  function handleEditar(): void {
    if (!servicio) return;
    router.push({
      pathname: "/servicios/editarServicio",
      params: {
        servicioId: String(servicio.id),
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: String(servicio.precio),
        duracion: String(servicio.duracion),
      },
    });
  }

  function handleEliminar(): void {
    if (!servicio) return;
    Alert.alert(
      "Eliminar servicio",
      "¿Seguro que quieres eliminar este servicio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarServicio(servicio.id);
              Alert.alert("Éxito", "El servicio ha sido eliminado.", [
                {
                  text: "Aceptar",
                  onPress: () => router.replace("/servicios/home"),
                },
              ]);
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar el servicio.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  }

  function handleReservar(): void {
    if (!servicio) return;
    router.push({
      pathname: "/reservas/nueva",
      params: {
        servicioId: String(servicio.id),
      },
    });
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require("@/assets/images/logo_sublime.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Detalle del Servicio</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {cargando && (
        <ActivityIndicator
          size="large"
          color={Colors.light.principal}
          style={styles.loader}
        />
      )}

      {!cargando && !error && servicio && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>{servicio.nombre}</Text>
          <Text style={styles.value}>{servicio.descripcion}</Text>

          <View style={styles.containerH}>
            <Text style={styles.duracionText}>{servicio.duracion} minutos</Text>
            <Text style={styles.precioText}>${servicio.precio}</Text>
          </View>

          {esAdmin && (
            <View style={styles.accionesContainer}>
              <TouchableOpacity
                style={[styles.accionButton, styles.btnEditar]}
                onPress={() => handleEditar()}
              >
                <Text style={styles.accionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.accionButton, styles.btnEliminar]}
                onPress={() => handleEliminar()}
              >
                <Text style={styles.accionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
          {!esAdmin && (
            <View style={styles.accionesContainer}>
              <TouchableOpacity
                style={[styles.accionButton, styles.btnEditar]}
                onPress={() => handleReservar()}
              >
                <Text style={styles.accionButtonText}>Reservar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.light.light_color,
  },
  containerH: {
    flex: 1,
    flexDirection: "row",
    marginTop: 50,
    marginHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: Colors.light.principal,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 15,
    color: Colors.light.secondary,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    alignSelf: "flex-end",
  },
  loader: {
    marginTop: 40,
  },
  error: {
    color: Colors.light.error,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.secondary,
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: "#344054",
    lineHeight: 22,
  },
  accionesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 16,
  },
  accionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  btnEditar: {
    backgroundColor: Colors.light.principal,
  },
  btnEliminar: {
    backgroundColor: Colors.light.error || "#ff5252",
  },
  accionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  precioText: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.light.principal,
  },
  duracionText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.secondary,
  },
});

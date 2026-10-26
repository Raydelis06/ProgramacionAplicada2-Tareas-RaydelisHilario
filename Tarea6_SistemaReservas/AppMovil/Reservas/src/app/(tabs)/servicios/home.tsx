import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { obtenerServicios, type Servicio } from "../../../services/servicios";

export default function TabTwoScreen() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [esAdmin, setEsAdmin] = useState(false);

  const cargarServicios = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setServicios(await obtenerServicios());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const verificarRolYCargar = async () => {
        try {
          await cargarServicios();
          const rol = await AsyncStorage.getItem("rol");
          setEsAdmin(rol === "admin");
        } catch (error) {
          console.error("Error al cargar datos:", error);
        }
      };

      void verificarRolYCargar();
      void cargarServicios();
    }, [cargarServicios]),
  );

  function handleVerDetalle(item: Servicio): void {
    console.log("Ver detalle servicio: ", item.nombre);

    router.push({
      pathname: "/servicios/[id]",
      params: {
        id: String(item.id),
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: String(item.precio),
        duracion: String(item.duracion),
      },
    });
  }

  function handleCrear(): void {
    router.push("/(tabs)/servicios/crearServicio");
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo_sublime.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Bienvenido/a!</Text>
      {esAdmin && (
        <Text style={styles.subtitle}>
          Has iniciado sesion como administrador, consulta, crea o modifica
          servicios y reservas.
        </Text>
      )}
      {!esAdmin && (
        <Text style={styles.subtitle}>
          Consulta nuestros servicios y reserva al instante.
        </Text>
      )}
      {esAdmin && (
        <View style={styles.accionesContainer}>
          <TouchableOpacity
            style={[styles.accionButton, styles.btnPrincipal]}
            onPress={() => handleCrear()}
          >
            <Text style={styles.accionButtonText}>Crear servicio</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
      {cargando && <Text style={styles.message}>Cargando servicios...</Text>}
      {!cargando && !error && servicios.length === 0 && (
        <Text style={styles.message}>Todavía no tienes servicios.</Text>
      )}

      <FlatList
        data={servicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.containerHorizontal}>
            <TouchableOpacity onPress={() => handleVerDetalle(item)}>
              <View style={styles.servicio}>
                <Text style={styles.servicioText}>{item.nombre}</Text>
                <Text style={styles.servicioDetailText}>
                  {item.descripcion}
                </Text>
                <Text style={styles.servicioDetailText}>
                  {item.duracion} minutos - ${item.precio}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: Colors.light.light_color,
  },
  containerHorizontal: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: Colors.light.principal,
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
  message: {
    color: "#a7a7a7",
    marginBottom: 12,
  },
  error: {
    color: Colors.light.error,
    marginBottom: 12,
  },
  servicio: {
    backgroundColor: "#fbfbfb",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  servicioText: {
    fontSize: 16,
    color: Colors.light.secondary,
    padding: 5,
    fontWeight: "bold",
  },
  servicioDetailText: {
    fontSize: 16,
    color: "#a7a7a7",
    padding: 5,
  },
  accionesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  accionButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    marginBottom: 35,
  },
  btnPrincipal: {
    backgroundColor: Colors.light.principal,
  },
  btnEliminar: {
    backgroundColor: Colors.light.error || "#ff5252",
  },
  accionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

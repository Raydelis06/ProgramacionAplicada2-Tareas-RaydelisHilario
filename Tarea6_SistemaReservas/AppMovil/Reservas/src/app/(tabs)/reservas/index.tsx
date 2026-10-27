import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import {
  actualizarEstadoReserva,
  cancelarReserva,
  obtenerMisReservas,
  obtenerTodasLasReservas,
  type Reserva,
} from "@/services/reservas";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export default function ListaReservasScreen() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [esAdmin, setEsAdmin] = useState(false);

  const cargarReservas = useCallback(
    async (admin: boolean) => {
      setCargando(true);
      setError("");
      try {
        if (esAdmin) {
          setReservas(await obtenerTodasLasReservas());
        } else {
          setReservas(await obtenerMisReservas());
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las reservas.",
        );
      } finally {
        setCargando(false);
      }
    },
    [esAdmin],
  );

  useFocusEffect(
    useCallback(() => {
      const verificarRolYCargar = async () => {
        try {
          setReservas([]);
          const rol = await AsyncStorage.getItem("rol");
          const admin = rol === "admin";
          setEsAdmin(admin);
          try {
            setReservas(
              admin
                ? await obtenerTodasLasReservas()
                : await obtenerMisReservas(),
            );
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar");
          } finally {
            setCargando(false);
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
        }
      };

      void verificarRolYCargar();
    }, [cargarReservas]),
  );

  function handleCancelar(id: number): void {
    Alert.alert(
      "Cancelar reserva",
      "¿Seguro que quieres cancelar esta reserva? El cambio es permanente",
      [
        {
          text: "Ahora no",
          style: "cancel",
        },
        {
          text: "Cancelar reserva",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelarReserva(id);
              await cargarReservas(esAdmin);
              Alert.alert(
                "Reserva cancelada",
                "La reserva ha sido cancelada correctamente.",
              );
            } catch (err) {
              Alert.alert("Error", "No se pudo cancelar la reserva.");
            }
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => router.push("/reservas"),
      },
    );
  }

  async function handleCambiarEstado(id: number): Promise<void> {
    try {
      const reservaActualizada = await reservas.find(
        (s) => s.id === Number(id),
      );
      if (!reservaActualizada) {
        Alert.alert("Error", "No se encontro la reserva");
        return;
      }
      await actualizarEstadoReserva(id, {
        ...reservaActualizada,
        estado: "completada",
      });
      await cargarReservas(esAdmin);
      Alert.alert(
        "Reserva completada",
        "La reserva ha sido completada correctamente.",
      );
    } catch (err) {
      Alert.alert("Error", "No se pudo completar la reserva.");
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo_sublime.png")}
        style={styles.logo}
      />
      {esAdmin && <Text style={styles.title}>Todas las reservas</Text>}
      {!esAdmin && <Text style={styles.title}>Mis reservas</Text>}

      {!!error && <Text style={styles.error}>{error}</Text>}
      {cargando && <Text style={styles.message}>Cargando reservas...</Text>}
      {!cargando && !error && reservas.length === 0 && (
        <Text style={styles.message}>Todavía no hay reservas registradas.</Text>
      )}

      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.containerHorizontal}>
            <View style={styles.servicio}>
              <Text style={styles.servicioText}>
                {item.servicio?.nombre || "Servicio"}
              </Text>
              <Text style={styles.servicioDetailText}>
                Fecha: {new Date(item.fecha).toLocaleDateString()} - Hora:{" "}
                {item.hora}
              </Text>
              <Text style={styles.servicioDetailText}>
                Estado: <Text style={styles.estadoText}>{item.estado}</Text>
              </Text>
              {esAdmin && item.usuario && (
                <Text style={styles.servicioDetailText}>
                  Cliente: {item.usuario.nombre || item.usuario.email}
                </Text>
              )}
            </View>
            {!esAdmin && item.estado === "pendiente" && (
              <View style={styles.accionesContainer}>
                <TouchableOpacity
                  style={[styles.accionButton, styles.btnEliminar]}
                  onPress={() => handleCancelar(item.id)}
                >
                  <Text style={styles.accionButtonText}>Cancelar reserva</Text>
                </TouchableOpacity>
              </View>
            )}
            {esAdmin && item.estado === "pendiente" && (
              <View style={styles.accionesContainer}>
                <TouchableOpacity
                  style={[styles.accionButton, styles.btnSecondary]}
                  onPress={() => handleCambiarEstado(item.id)}
                >
                  <Text style={styles.accionButtonText}>
                    Marcar como completada
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  estadoText: {
    fontWeight: "600",
    color: Colors.light.principal,
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
  btnEliminar: {
    backgroundColor: Colors.light.error,
  },
  btnCrear: {
    backgroundColor: Colors.light.principal,
  },
  btnSecondary: {
    backgroundColor: Colors.light.secondary,
  },
  accionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

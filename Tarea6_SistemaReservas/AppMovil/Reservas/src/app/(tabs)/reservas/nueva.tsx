import { Colors } from "@/constants/theme";
import { Servicio } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { crearReserva, esFechaHoraFutura } from "../../../services/reservas";
import { obtenerServicios } from "../../../services/servicios";

export default function ReservasScreen() {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [servicios, setServicios] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [usuarioId, setUsuarioId] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [esAdmin, setEsAdmin] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Servicio | null>(null);

  const { servicioId } = useLocalSearchParams<{ servicioId: string }>();

  useFocusEffect(
    useCallback(() => {
      setSelectedValue(null);
      setFecha(new Date());
      setHora(new Date());

      const cargarDatosIniciales = async () => {
        try {
          const rol = await AsyncStorage.getItem("rol");
          setEsAdmin(rol === "admin");
          const listaServicios = await obtenerServicios();
          setServicios(listaServicios);

          if (servicioId && listaServicios.length > 0) {
            const encontrado = listaServicios.find(
              (item) => String(item.id) === String(servicioId),
            );
            if (encontrado) {
              setSelectedValue(encontrado);
            }
          }
        } catch (error) {
          console.error("Error al cargar datos iniciales", error);
        }
      };

      cargarDatosIniciales();
    }, [servicioId]),
  );

  const guardarReserva = async () => {
    if (!selectedValue) {
      Alert.alert("Servicio requerido", "Por favor selecciona un servicio.");
      return;
    }

    try {
      setGuardando(true);
      const fechaFormateada = fecha.toISOString().split("T")[0];
      const horaFormateada = hora.toTimeString().split(" ")[0];

      const idServicioFinal = selectedValue?.id ?? 0;

      await crearReserva({
        fecha: fechaFormateada,
        hora: horaFormateada,
        servicioId: Number(idServicioFinal),
        usuarioId: Number(usuarioId),
        estado: "pendiente",
      });

      Alert.alert(
        "Reserva creada",
        "Tu reserva se ha registrado correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/(tabs)/reservas"),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo crear la reserva.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require("@/assets/images/logo_sublime.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Reservar</Text>
      <Text style={styles.subtitle}>
        Selecciona la fecha, hora y servicio de tu cita.
      </Text>

      {/* Selector de Fecha */}
      <Text style={styles.label}>Fecha de la reserva</Text>
      <TouchableOpacity
        style={styles.inputSelector}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.inputText}>{fecha.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setFecha(selectedDate);
          }}
        />
      )}

      {/* Selector de Hora */}
      <Text style={styles.label}>Hora de la reserva</Text>
      <TouchableOpacity
        style={styles.inputSelector}
        onPress={() => setShowTimePicker(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.inputText}>
          {hora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={hora}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (!selectedTime) return;

            if (!esFechaHoraFutura(fecha, selectedTime)) {
              Alert.alert(
                "Hora no válida",
                "Selecciona una hora que aún no haya pasado.",
              );
              return;
            }
            setHora(selectedTime);
          }}
        />
      )}

      {/* Selector de Servicio  */}
      <Text style={styles.label}>Seleccionar Servicio</Text>
      <Picker
        style={styles.inputSelector}
        selectedValue={
          selectedValue ? String(selectedValue.id ?? selectedValue.id) : ""
        }
        onValueChange={(itemValue) => {
          const encontrado = servicios.find(
            (s) => String(s.id ?? s.servicioId) === String(itemValue),
          );
          if (encontrado) {
            setSelectedValue(encontrado);
          }
        }}
      >
        <Picker.Item label="Selecciona un servicio..." value="" />
        {servicios.map((servicio) => {
          const currentId = servicio.id ?? servicio.servicioId;
          return (
            <Picker.Item
              style={styles.inputText}
              key={currentId}
              label={servicio.nombre}
              value={String(currentId)}
            />
          );
        })}
      </Picker>
      <View style={styles.containerH}>
        <Text style={styles.label}>Total del servicio</Text>
        <Text style={styles.precioText}>
          ${selectedValue ? String(selectedValue.precio) : "0.00"}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, guardando && styles.buttonDisabled]}
        onPress={guardarReserva}
        disabled={guardando}
        activeOpacity={0.8}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirmar Reserva</Text>
        )}
      </TouchableOpacity>
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
  containerH: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-between",
    alignItems: "center",
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
  inputSelector: {
    backgroundColor: "#fff",
    borderColor: "#d0d5dd",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 20,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  inputText: {
    color: Colors.light.text,
    fontSize: 16,
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
  precioText: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.light.principal,
  },
});

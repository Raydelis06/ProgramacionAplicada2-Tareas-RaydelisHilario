import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Image,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default async function PerfilScreen() {
    const nombreUsuario = await AsyncStorage.getItem("nombreUsuario");
    const emailUsuario = AsyncStorage.getItem("emailUsuario");

    function handleCerrarSesion(): void {
        throw new Error("Function not implemented.");
    }

 return(
    <>
        <View style={styles.container}>
            <Image
                source={require("@/assets/images/logo_sublime.png")}
                style={styles.logo}
            />
            <Text style={styles.title}>Perfil</Text>
            <Text style={styles.label}>{nombreUsuario} || {"No identificado"}</Text>
            <Text style={styles.subtitle}>{emailUsuario} || {"No identificado"}</Text>
            {/* editar nombre usuario */}
            <TextInput></TextInput>
            <TouchableOpacity></TouchableOpacity>

            <View style={styles.separador}></View>
            <TouchableOpacity
                style={styles.salirButton}
                onPress={() => handleCerrarSesion()}
                activeOpacity={0.8}
                >
                <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    </>
 )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.light.light_color,
  },
  separador: {
    borderTopWidth: 1,
    borderColor: "gray",
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
  salirButton: {
    alignItems: "center",
    backgroundColor: Colors.light.error,
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
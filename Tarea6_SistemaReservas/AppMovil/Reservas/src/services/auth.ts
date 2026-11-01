import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { request, esValido, getAuthToken, setAuthToken } from "./api";

export type Servicio = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: Number;
  precio: Number;
};

export async function iniciarSesion(email: string, password: string) {
  const response = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (
    !esValido(response) ||
    typeof response.token !== "string" ||
    !response.token.trim()
  ) {
    throw new Error("La respuesta de inicio de sesión no incluye un token.");
  }

  setAuthToken(response.token);
  await AsyncStorage.setItem("userToken", getAuthToken() || "");

  const { rol } = jwtDecode<{ rol?: string }>(getAuthToken() || "");

  if (typeof rol !== "string" || !rol.trim()) {
    throw new Error("El token de inicio de sesión no incluye un rol válido.");
  }
  await AsyncStorage.setItem("email", email)
  await AsyncStorage.setItem("rol", rol);
}

export function registrarUsuario(
  nombre: string,
  email: string,
  password: string,
) {
  return request("/auth/registro", {
    method: "POST",
    body: { nombre, email, password, rol: "cliente" },
  });
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("rol");
}

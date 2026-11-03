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

export async function obtenerPerfil() {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("No hay una sesión activa.");

  const { id } = jwtDecode<{ id?: number }>(token);
  if (typeof id !== "number") {
    throw new Error("El token no incluye un id válido.");
  }

  const usuario = await request(`/usuarios/${id}`, {
    method: "GET",
    authenticated: true,
  });
  if (
    !esValido(usuario) ||
    typeof usuario.nombre !== "string" ||
    typeof usuario.email !== "string"
  ) {
    throw new Error("La respuesta del perfil no es válida.");
  }

  await AsyncStorage.setItem("nombre", usuario.nombre);
  await AsyncStorage.setItem("email", usuario.email);

  return { nombre: usuario.nombre, email: usuario.email };
}

export async function actualizarPerfil(nombre: string) {
  const usuario = await request("/usuarios/perfil", {
    method: "PUT",
    body: { nombre },
    authenticated: true,
  });
  if (!esValido(usuario) || typeof usuario.nombre !== "string") {
    throw new Error("La respuesta al actualizar el perfil no es válida.");
  }

  await AsyncStorage.setItem("nombre", usuario.nombre);
  return usuario.nombre;
}

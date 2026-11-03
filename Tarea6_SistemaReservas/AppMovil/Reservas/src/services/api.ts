import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

let authToken: string | null = null;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function esValido(item: unknown): item is Record<string, unknown> {
  return typeof item === "object" && item !== null;
}

export function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (esValido(body)) {
    for (const key of ["message", "detail", "error"]) {
      if (typeof body[key] === "string") {
        return body[key];
      }
    }
  }

  return fallback;
}

export async function request(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    authenticated?: boolean;
  } = {},
): Promise<unknown> {
  if (!API_URL) {
    throw new Error("Error al conectarse a la API");
  }

  const headers: Record<string, string> = {};

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.authenticated) {
    console.log(
      "request autenticado a:",
      path,
      "| token en memoria:",
      !!authToken,
    );
    console.trace();
    if (!authToken) {
      try {
        const tokenGuardado = await AsyncStorage.getItem("userToken");
        if (tokenGuardado) {
          authToken = tokenGuardado;
        }
      } catch (e) {
        console.error("Error al leer el token", e);
      }
    }
    console.log("request a:", path, "| authToken en memoria:", !!authToken);

    if (!authToken) {
      authToken = null;
      AsyncStorage.removeItem("userToken");
      router.replace("/");
      alert("Su sesion expiró. Inicia sesión para consultar los servicios");
      throw new Error("Sesión expirada");
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseText = await response.text();
  let responseBody: unknown = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as unknown;
    } catch {
      if (response.ok) {
        throw new Error("La API devolvió una respuesta no válida.");
      }
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(responseBody, `Error de la API (${response.status}).`),
    );
  }

  return responseBody;
}
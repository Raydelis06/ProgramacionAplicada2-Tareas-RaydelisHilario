import AsyncStorage from "@react-native-async-storage/async-storage";
import { router} from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Tarea = {
  id: number;
  titulo: string;
  completada: boolean;
  creadoEn: string;
};

let authToken: string | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (isRecord(body)) {
    for (const key of ['message', 'detail', 'error']) {
      if (typeof body[key] === 'string') {
        return body[key];
      }
    }
  }

  return fallback;
}

async function request(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, string>;
    params?: Record<string, unknown>
    authenticated?: boolean;
  } = {},
): Promise<unknown> {
  if (!API_URL) {
    throw new Error('Error al conectarse a la API');
  }

  const headers: Record<string, string> = {};

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.authenticated) {
    if (!authToken) {
      await AsyncStorage.clear();
      router.push("/");
      alert('Su sesion expiró. Inicia sesión para consultar o crear tareas.');
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
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
        throw new Error('La API devolvió una respuesta no válida.');
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

export async function iniciarSesion(email: string, password: string) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (
    !isRecord(response) ||
    typeof response.token !== 'string' ||
    !response.token.trim()
  ) {
    throw new Error('La respuesta de inicio de sesión no incluye un token.');
  }
  
  authToken = response.token;
  await AsyncStorage.setItem('userToken', authToken);
}

export function registrarUsuario(
  nombre: string,
  email: string,
  password: string,
) {
  return request('/auth/registro', {
    method: 'POST',
    body: { nombre, email, password, rol: 'usuario' },
  });
}

export async function obtenerTareas(): Promise<Tarea[]> {
  const response = await request('/v2/tareas', { authenticated: true });

  if (!Array.isArray(response)) {
    throw new Error('La API devolvió una lista de tareas no válida.');
  }

  return response.map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'number' ||
      typeof item.titulo !== 'string' ||
      typeof item.completada !== 'boolean' ||
      typeof item.creadoEn !== 'string'
    ) {
      throw new Error('La API devolvió una tarea con formato no válido.');
    }

    return {
      id: item.id,
      titulo: item.titulo,
      completada: item.completada,
      creadoEn: item.creadoEn,
    };
  });
}

export function crearTarea(titulo: string) {
  return request('/v2/tareas', {
    method: 'POST',
    body: { titulo },
    authenticated: true,
  });
}

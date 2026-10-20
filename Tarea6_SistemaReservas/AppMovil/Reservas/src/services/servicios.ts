import { router} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Servicio = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: Number;
  precio: Number;
};

let authToken: string | null = null;

function esValido(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null;
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (esValido(body)) {
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
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
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
      alert('Su sesion expiró. Inicia sesión para consultar los servicios');
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

export async function obtenerServicios(): Promise<Servicio[]> {
  const response = await request('/servicios', { authenticated: true });

  if (!Array.isArray(response)) {
    throw new Error('La API devolvió una lista de servicios no válida.');
  }

  return response.map((item: unknown) => {
    if (!esValido(item) ||
        typeof item.id !== 'number' ||
        typeof item.nombre !== 'string' ||
        typeof item.descripcion !== 'string' ||
        typeof item.duracion !== 'number' ||
        typeof item.precio !== 'number') {
      throw new Error('La API devolvió un servicio con formato no válido.');
    }

    return {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      duracion: item.duracion,
      precio: item.precio
    };
  });
}

export function crearServicio(
  nombre: string, 
  descripcion: string,
  duracion: number,
  precio: number
) {
  return request('/servicios', {
    method: 'POST',
    body: {
      nombre,
      descripcion,
      duracion: Math.trunc(duracion),
      precio: Number(precio),
    },
    authenticated: true,
  });
}

export function actualizarServicio(
  id: number,
  nombre: string,
  descripcion: string,
  duracion: number,
  precio: number
) {
  return request(`/servicios/${id}`, {
    method: 'PUT', 
    body: {
      nombre,
      descripcion,
      duracion: Math.trunc(duracion),
      precio: Number(precio),
    },
    authenticated: true,
  });
}

export function eliminarServicio(id: number) {
  return request(`/servicios/${id}`, {
    method: 'DELETE',
    authenticated: true,
  });
}
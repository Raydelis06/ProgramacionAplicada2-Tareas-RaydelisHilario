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
    method?: 'GET' | 'POST' ;
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
      try {
        const tokenGuardado = await AsyncStorage.getItem('userToken');
        if (tokenGuardado) {
          authToken = tokenGuardado;
        }
      } catch (e) {
        console.error("Error al leer el token", e);
      }
    }
    console.log('request a:', path, '| authToken en memoria:', !!authToken);
    
    if (!authToken) {
      authToken = null;
      AsyncStorage.removeItem('userToken');
      router.replace("/");
      alert('Su sesion expiró. Inicia sesión para consultar los servicios');
      throw new Error('Sesión expirada');
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
    !esValido(response) ||
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
    body: { nombre, email, password, rol: 'cliente' },
  });
}
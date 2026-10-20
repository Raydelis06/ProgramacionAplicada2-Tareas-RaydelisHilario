import { request } from "./auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Servicio = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
};

function esValido(item: unknown): item is Record<string, unknown> {
  return typeof item === "object" && item !== null;
}

function getErrorMessage(body: unknown, fallback: string) {
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

export async function obtenerServicios(): Promise<Servicio[]> {
  const response = await request("/servicios", { authenticated: true });

  if (!Array.isArray(response)) {
    throw new Error("La API devolvió una lista de servicios no válida.");
  }

  return response.map((item: unknown) => {
    if (
      !esValido(item) ||
      typeof item.id !== "number" ||
      typeof item.nombre !== "string" ||
      typeof item.descripcion !== "string" ||
      typeof item.duracion !== "number"
    ) {
      throw new Error("La API devolvió un servicio con formato no válido.");
    }
    const precio = Number(item.precio);
    if (!Number.isFinite(precio)) {
      throw new Error("La API devolvió un servicio con precio no válido.");
    }
    return {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      duracion: item.duracion,
      precio,
    };
  });
}

export function crearServicio(
  nombre: string,
  descripcion: string,
  duracion: number,
  precio: number,
) {
  return request("/servicios", {
    method: "POST",
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
  precio: number,
) {
  return request(`/servicios/${id}`, {
    method: "PUT",
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
    method: "DELETE",
    authenticated: true,
  });
}

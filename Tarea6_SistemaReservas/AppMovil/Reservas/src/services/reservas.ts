import { Alert } from "react-native";
import { request } from "./auth";

export type Reserva = {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre?: string;
    email?: string;
  };
  servicioId: number;
  servicio?: {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: number;
    precio: number;
  };
};

function esValido(item: unknown): item is Record<string, unknown> {
  return typeof item === "object" && item !== null;
}

export const combinarFechaHora = (fecha: Date, hora: Date): Date => {
  const resultado = new Date(fecha);
  resultado.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
  return resultado;
};

export const esFechaHoraFutura = (fecha: Date, hora: Date): boolean =>
  combinarFechaHora(fecha, hora).getTime() > Date.now();

export async function obtenerTodasLasReservas(): Promise<Reserva[]> {
  const response = await request("/reservas", { authenticated: true });

  if (!Array.isArray(response)) {
    throw new Error("La API devolvió una lista de reservas no válida.");
  }

  const reservasMapeadas = response.map((item: unknown) => {
    if (
      !esValido(item) ||
      typeof item.id !== "number" ||
      typeof item.fecha !== "string" ||
      typeof item.hora !== "string" ||
      typeof item.estado !== "string" ||
      typeof item.usuarioId !== "number" ||
      typeof item.servicioId !== "number"
    ) {
      throw new Error("La API devolvió una reserva con formato no válido.");
    }

    return {
      id: item.id,
      fecha: item.fecha,
      hora: item.hora,
      estado: item.estado,
      usuarioId: item.usuarioId,
      usuario: esValido(item.usuario)
        ? {
            id: Number(item.usuario.id),
            nombre:
              typeof item.usuario.nombre === "string"
                ? item.usuario.nombre
                : undefined,
            email:
              typeof item.usuario.email === "string"
                ? item.usuario.email
                : undefined,
          }
        : undefined,
      servicioId: item.servicioId,
      servicio: esValido(item.servicio)
        ? {
            id: Number(item.servicio.id),
            nombre: String(item.servicio.nombre || ""),
            descripcion: String(item.servicio.descripcion || ""),
            duracion: Number(item.servicio.duracion || 0),
            precio: Number(item.servicio.precio || 0),
          }
        : undefined,
    };
  });

  return reservasMapeadas.sort((a, b) => a.estado.localeCompare(b.estado));
}

export async function obtenerMisReservas(): Promise<Reserva[]> {
  const response = await request("/reservas/mis-reservas", {
    authenticated: true,
  });

  if (!Array.isArray(response)) {
    throw new Error("La API devolvió una lista de reservas no válida.");
  }

  return response.map((item: unknown) => {
    if (
      !esValido(item) ||
      typeof item.id !== "number" ||
      typeof item.fecha !== "string" ||
      typeof item.hora !== "string" ||
      typeof item.estado !== "string" ||
      typeof item.usuarioId !== "number" ||
      typeof item.servicioId !== "number"
    ) {
      throw new Error("La API devolvió una reserva con formato no válido.");
    }

    return {
      id: item.id,
      fecha: item.fecha,
      hora: item.hora,
      estado: item.estado,
      usuarioId: item.usuarioId,
      usuario: esValido(item.usuario)
        ? {
            id: Number(item.usuario.id),
            nombre:
              typeof item.usuario.nombre === "string"
                ? item.usuario.nombre
                : undefined,
            email:
              typeof item.usuario.email === "string"
                ? item.usuario.email
                : undefined,
          }
        : undefined,
      servicioId: item.servicioId,
      servicio: esValido(item.servicio)
        ? {
            id: Number(item.servicio.id),
            nombre: String(item.servicio.nombre || ""),
            descripcion: String(item.servicio.descripcion || ""),
            duracion: Number(item.servicio.duracion || 0),
            precio: Number(item.servicio.precio || 0),
          }
        : undefined,
    };
  });
}

export function crearReserva(data: {
  fecha: string;
  hora: string;
  servicioId: number;
  usuarioId: number;
  estado?: string;
}) {
  const fechaHora = new Date(`${data.fecha}T${data.hora}`);
  if (fechaHora.getTime() <= Date.now()) {
    Alert.alert("Error", "La fecha y hora deben ser futuras");
    return;
  } else {
    return request("/reservas", {
      method: "POST",
      body: {
        fecha: data.fecha,
        hora: data.hora,
        servicioId: Number(data.servicioId),
        usuarioId: Number(data.usuarioId),
        estado: data.estado || "pendiente",
      },
      authenticated: true,
    });
  }
}

export function actualizarEstadoReserva(
  id: number,
  data: {
    fecha: string;
    hora: string;
    estado: string;
    servicioId: number;
    usuarioId: number;
  },
) {
  return request(`/reservas/${id}/estado`, {
    method: "PUT",
    body: {
      fecha: data.fecha,
      hora: data.hora,
      estado: data.estado,
      servicioId: Number(data.servicioId),
      usuarioId: Number(data.usuarioId),
    },
    authenticated: true,
  });
}

export function cancelarReserva(id: number) {
  return request(`/reservas/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

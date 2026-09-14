import { prisma } from "../db.js";

const soloFecha = (fecha) => {
    const fechaLocal = new Date(fecha);
    const año = fechaLocal.getFullYear();
    const mes = String(fechaLocal.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaLocal.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

const calcularEstadisticas = (habito) => {
    const registrosOrdenados = [...habito.registros].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
    const diasCompletados = registrosOrdenados.filter(registro => registro.completado);

    let mejorRacha = 0;
    let rachaTemporal = 0;
    let fechaAnterior = null;

    for (const registro of registrosOrdenados) {
        if (!registro.completado) {
            rachaTemporal = 0;
            fechaAnterior = null;
            continue;
        }

        const fechaActual = new Date(`${soloFecha(registro.fecha)}T00:00:00`);
        if (fechaAnterior) {
            const diferenciaDias = Math.round(
                (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24)
            );
            rachaTemporal = diferenciaDias === 1 ? rachaTemporal + 1 : 1;
        } else {
            rachaTemporal = 1;
        }

        mejorRacha = Math.max(mejorRacha, rachaTemporal);
        fechaAnterior = fechaActual;
    }

    let rachaActual = 0;
    for (let i = registrosOrdenados.length - 1; i >= 0; i--) {
        const registro = registrosOrdenados[i];
        if (!registro.completado) break;

        if (i === registrosOrdenados.length - 1) {
            rachaActual = 1;
            continue;
        }

        const fechaActual = new Date(`${soloFecha(registro.fecha)}T00:00:00`);
        const fechaSiguiente = new Date(`${soloFecha(registrosOrdenados[i + 1].fecha)}T00:00:00`);
        const diferenciaDias = Math.round(
            (fechaSiguiente - fechaActual) / (1000 * 60 * 60 * 24)
        );

        if (diferenciaDias === 1) {
            rachaActual += 1;
        } else {
            break;
        }
    }

    const porcentajeCumplimiento = habito.registros.length > 0
        ? `${((diasCompletados.length / habito.registros.length) * 100).toFixed(2)}%`
        : "0%";

    return { rachaActual, mejorRacha, porcentajeCumplimiento };
};

// POST /habitos - Crear un nuevo hábito
export const crearHabito = async (req, res) => {
    try {
        const { nombre, meta } = req.body;
        const habitoExistente = await prisma.habito.findFirst({ where: { nombre } });

        if (habitoExistente) {
            return res.status(400).json({ Mensaje: "El hábito ya existe." });
        }

        const habito = await prisma.habito.create({
            data: {
                nombre,
                meta
            }
        });

        res.status(201).json({ Mensaje: "Hábito creado exitosamente!", habito });
    } catch (error) {
        console.error("Error al crear el hábito:", error);
        res.status(500).json({ error: "Error interno del servidor al crear hábito" });
    }
};

// GET /habitos - Obtener los hábitos creados
export const obtenerHabitos = async (req, res) => {
    try {
        const habitos = await prisma.habito.findMany({
            include: { registros: true },
            orderBy: { id: "asc" }
        });

        res.status(200).json(habitos);
    } catch (error) {
        console.error("Error al obtener los hábitos:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar los hábitos" });
    }
};

// POST /habitos/:id/registrar - Registrar el cumplimiento del día
export const registrarHabitoDiario = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "El parámetro ID debe ser un número entero válido" });
        }

        const habito = await prisma.habito.findUnique({ where: { id } });
        if (!habito) {
            return res.status(404).json({ Mensaje: "Hábito no encontrado." });
        }

        const hoy = new Date();
        const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioDelSiguienteDia = new Date(inicioDelDia);
        inicioDelSiguienteDia.setDate(inicioDelSiguienteDia.getDate() + 1);
        const registroExistente = await prisma.registroHabito.findFirst({
            where: {
                habitoId: id,
                fecha: { gte: inicioDelDia, lt: inicioDelSiguienteDia }
            }
        });

        if (registroExistente) {
            return res.status(400).json({ Mensaje: "El hábito ya fue registrado hoy." });
        }

        const registro = await prisma.registroHabito.create({
            data: {
                fecha: hoy,
                completado: true,
                habitoId: id
            }
        });

        res.status(201).json({ Mensaje: "Hábito registrado exitosamente!", registro });
    } catch (error) {
        console.error("Error al registrar el hábito:", error);
        res.status(500).json({ error: "Error interno del servidor al registrar el hábito" });
    }
};

// GET /habitos/:id/estadisticas - Obtener las estadísticas del hábito
export const obtenerEstadisticas = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "El parámetro ID debe ser un número entero válido" });
        }

        const habito = await prisma.habito.findUnique({
            where: { id },
            include: { registros: true }
        });

        if (!habito) {
            return res.status(404).json({ Mensaje: "Hábito no encontrado." });
        }

        res.status(200).json({
            habito: habito.nombre,
            estadisticas: calcularEstadisticas(habito)
        });
    } catch (error) {
        console.error("Error al obtener las estadísticas:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener las estadísticas" });
    }
};

// DELETE /habitos/:id - Eliminar un hábito
export const eliminarHabito = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "El parámetro ID debe ser un número entero válido" });
        }

        const habito = await prisma.habito.findUnique({ where: { id } });
        if (!habito) {
            return res.status(404).json({ Mensaje: "Hábito no encontrado." });
        }

        await prisma.habito.delete({ where: { id } });

        res.status(200).json({ Mensaje: "Hábito eliminado exitosamente!" });
    } catch (error) {
        console.error("Error al eliminar el hábito:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar el hábito" });
    }
};

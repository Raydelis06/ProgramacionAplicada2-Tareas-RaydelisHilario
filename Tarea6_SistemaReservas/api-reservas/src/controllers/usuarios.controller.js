import prisma from "../lib/prisma.js";

export const actualizarPerfil = async (req, res) => {
    try {
        const { nombre } = req.body;

        const usuario = await prisma.usuario.update({
            where: { id: req.usuario.id },
            data: { nombre },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
            }
        });

        return res.status(200).json(usuario);
    } catch (error) {
        console.error("Error al actualizar el perfil: ", error);
        return res.status(500).json({ error: "Error interno del servidor al intentar actualizar el perfil" });
    }
};

export const obtenerUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "El id del usuario no es válido" });
        }
        if (id !== req.usuario.id) {
            return res.status(403).json({ error: "No puedes consultar el perfil de otro usuario" });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: { id: true, nombre: true, email: true, rol: true }
        });
        if (!usuario) {
            return res.status(404).json({ error: "El usuario no existe" });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        console.error("Error al obtener el usuario: ", error);
        return res.status(500).json({ error: "Error interno del servidor al intentar obtener el usuario" });
    }
};
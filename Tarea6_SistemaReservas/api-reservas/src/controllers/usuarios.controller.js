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
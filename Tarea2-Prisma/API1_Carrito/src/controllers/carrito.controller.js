import { prisma } from "../db.js";

// POST /productos - Agregar producto al carrito
export const agregarProducto = async (req, res) => {
    try {
        const { nombre, precio, cantidad } = req.body;

        const productoExistente = await prisma.producto.findFirst({
            where: {
                nombre
            }
        });

        if (productoExistente) {
            const productoActualizado = await prisma.producto.update({
                where: {
                    id: productoExistente.id
                },
                data: {
                    cantidad: {
                        increment: cantidad
                    }
                }
            });

            return res.status(200).json({
                mensaje: "El producto ya estaba en el carrito, se sumó la nueva cantidad",
                producto: productoActualizado
            });
        }

        const producto = await prisma.producto.create({
            data: {
                nombre,
                precio,
                cantidad
            }
        });

        return res.status(201).json({
            mensaje: "Producto agregado al carrito con éxito",
            producto
        });

    } catch (error) {
        console.error("Error al crear producto:", error);

        return res.status(500).json({
            error: "Error interno del servidor al crear el producto"
        });
    }
};

// GET /productos - Listar productos del carrito
export const obtenerProductos = async (req, res) => {
    try {
        const productos = await prisma.producto.findMany();

        return res.status(200).json(productos);

    } catch (error) {
        console.error("Error al obtener los productos:", error);

        return res.status(500).json({
            error: "Error interno del servidor al consultar los productos"
        });
    }
};

// PUT /productos/:id - Actualizar cantidad
export const actualizarCantidad = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: "El parámetro ID debe ser un número entero válido"
            });
        }

        const { cantidad } = req.body;

        const productoExistente = await prisma.producto.findUnique({
            where: {
                id
            }
        });

        if (!productoExistente) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        const producto = await prisma.producto.update({
            where: {
                id
            },
            data: {
                cantidad
            }
        });

        return res.status(200).json({
            mensaje: "Cantidad actualizada con éxito",
            producto
        });

    } catch (error) {
        console.error("Error al actualizar el producto:", error);

        return res.status(500).json({
            error: "Error interno del servidor al actualizar el producto"
        });
    }
};

// DELETE /productos/:id - Eliminar producto del carrito
export const eliminarProducto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: "El parámetro ID debe ser un número entero válido"
            });
        }

        const producto = await prisma.producto.findUnique({
            where: {
                id
            }
        });

        if (!producto) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        await prisma.producto.delete({
            where: {
                id
            }
        });

        return res.status(200).json({
            mensaje: "Producto eliminado del carrito con éxito"
        });

    } catch (error) {
        console.error("Error al eliminar el producto:", error);

        return res.status(500).json({
            error: "Error interno del servidor al eliminar el producto"
        });
    }
};

// GET /carrito/total - Calcular total
export const obtenerTotalCarrito = async (req, res) => {
    try {
        const productos = await prisma.producto.findMany();

        const total = productos.reduce(
            (acumulado, producto) => acumulado + (producto.precio * producto.cantidad), 0 );

        return res.status(200).json({
            total
        });

    } catch (error) {
        console.error("Error al calcular el total:", error);

        return res.status(500).json({
            error: "Error interno del servidor al calcular el total"
        });
    }
};

// POST /carrito/aplicar-descuento
export const aplicarDescuento = async (req, res) => {
    try {
        const { porcentaje } = req.body;

        const productos = await prisma.producto.findMany();

        const total = productos.reduce(
            (acumulado, producto) =>
                acumulado + (producto.precio * producto.cantidad),
            0
        );

        const montoDescuento = total * (porcentaje / 100);

        const totalConDescuento = total - montoDescuento;

        return res.status(200).json({
            mensaje: "Descuento aplicado con éxito",
            total,
            porcentaje,
            montoDescuento,
            totalConDescuento
        });

    } catch (error) {
        console.error("Error al aplicar descuento:", error);

        return res.status(500).json({
            error: "Error interno del servidor al aplicar el descuento"
        });
    }
};
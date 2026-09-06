const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

//Middleware global de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

//Middleware de validación de campos
function validarCampos(...campos) {
  return (req, res, next) => {
    const faltantes = campos.filter(
      (campo) => req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === ''
    );
    if (faltantes.length > 0) {
      console.warn(`Warning: faltan campos requeridos en ${req.method} ${req.originalUrl}: ${faltantes.join(', ')}`);
      return res.status(400).json({ error: `Faltan los siguientes campos: ${faltantes.join(', ')}` });
    }
    next();
  };
}

// El puerto 3000 es el que se va a usar para escuchar las solicitudes
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

let productos = [
    {
      id: 1,
      nombre: "Lata de salsa",
      precio: 100,
      cantidad: 5
    },
    {
      id: 2,
      nombre: "Lata de leche evaporada",
      precio: 75,
      cantidad: 20
    }
];

let carrito = [
  {
    productos: [
      {
        producto: productos.find(p => p.id === parseInt(1)),
        cantidadDeCompra: 1
      }
    ],
    total: 0,
    porcentaje: 0,
    totalConDescuento: 0
  }
];

let nextId = 3;

//Gestion de productos
app.get('/productos', (req, res) => {
  res.status(200).json(productos);
});

app.post('/productos', validarCampos('nombre', 'precio', 'cantidad'), (req, res) => {
  const { nombre, precio, cantidad } = req.body;
  if (typeof precio !== 'number' || typeof cantidad !== 'number') {
    console.warn('Warning: precio/cantidad con formato inválido en POST /productos');
    return res.status(400).json({ error: "Precio y cantidad deben ser numeros" });
  }
  if (precio <= 0 || cantidad <= 0) {
    return res.status(400).json({ error: "Precio y cantidad deben ser mayores a cero" });
  }

  //verificar si existe por nombre y devolver un error si ya existe
  if (productos.some(p => p.nombre === nombre)) {
    return res.status(400).json({ mensaje: "El producto ya existe, no se puede crear uno nuevo con el mismo nombre" });
  }

  const nuevoProducto = {
    id: nextId++,
    nombre,
    precio,
    cantidad
  };
  productos.push(nuevoProducto);
  res.status(201).json({ mensaje: "Producto creado con exito!", producto: nuevoProducto });
});

app.put('/productos/:id', validarCampos('nombre', 'precio', 'cantidad'), (req, res) => {
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  const { nombre, precio, cantidad } = req.body;
  if (typeof precio !== 'number' || typeof cantidad !== 'number') {
    console.warn('Warning: precio/cantidad con formato inválido en PUT /productos/:id');
    return res.status(400).json({ error: "Precio y cantidad deben ser numeros" });
  }
  if (precio <= 0 || cantidad <= 0) {
    return res.status(400).json({ error: "Precio y cantidad deben ser mayores a cero" });
  }
  producto.nombre = nombre;
  producto.precio = precio;
  producto.cantidad = cantidad;
  return res.status(200).json({ mensaje: "Producto actualizado con exito!", producto: producto });
});

app.delete('/productos/:id', (req, res) => {
  const index = productos.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });
  productos.splice(index, 1);
  return res.status(200).json({ mensaje: "Producto eliminado con exito!" });
});


//Gestion de carrito de compras
function calcularTotalCarrito() {
  const total = carrito[0].productos.reduce((acc, item) => acc + (item.producto.precio * item.cantidadDeCompra), 0);
  return total;
}

// Agregar producto al carrito
app.post('/carrito', validarCampos('productoId', 'cantidadDeCompra'), (req, res) => {
  const { productoId, cantidadDeCompra } = req.body;

  if (typeof cantidadDeCompra !== 'number' || cantidadDeCompra <= 0) {
    console.warn('Warning: cantidadDeCompra con formato inválido en POST /carrito');
    return res.status(400).json({ error: "cantidadDeCompra debe ser un número positivo" });
  }

  const producto = productos.find(p => p.id === parseInt(productoId));
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const itemExistente = carrito[0].productos.find(item => item.producto.nombre === producto.nombre);

  if (itemExistente) {
    // Ya existe en el carrito: se suma la cantidad al item existente en vez de duplicarlo
    const cantidadTotal = itemExistente.cantidadDeCompra + cantidadDeCompra;
    if (cantidadTotal > producto.cantidad) {
      return res.status(400).json({ error: "La cantidad de compra supera la cantidad disponible del producto" });
    }
    itemExistente.cantidadDeCompra = cantidadTotal;
    carrito[0].total = calcularTotalCarrito();
    return res.status(200).json({
      mensaje: "El producto ya estaba en el carrito, se sumó la nueva cantidad al item existente",
      carrito
    });
  }

  if (cantidadDeCompra > producto.cantidad) {
    return res.status(400).json({ error: "La cantidad de compra supera la cantidad disponible del producto" });
  }

  carrito[0].productos.push({ producto, cantidadDeCompra });
  carrito[0].total = calcularTotalCarrito();
  return res.status(201).json({ mensaje: "Producto agregado al carrito con exito!", carrito });
});
//quitar producto del carrito
app.delete('/carrito/:id', (req, res) => {
  const index = carrito[0].productos.findIndex(p => p.producto.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "El producto no ha sido agregado al carrito previamente"});
  }
  carrito[0].productos.splice(index, 1);
  carrito[0].total = calcularTotalCarrito();
  return res.status(200).json({ mensaje: "Producto eliminado de el carrito con exito!", carrito });
});

app.get('/carrito/total', (req, res) => {
  carrito[0].total = calcularTotalCarrito();
  return res.status(200).json({ carrito });
});

app.post('/carrito/aplicar-descuento', (req, res) => {
  const { porcentaje } = req.body;

  if (porcentaje === undefined || porcentaje === null) {
    carrito[0].porcentaje = 0;
    carrito[0].total = calcularTotalCarrito();
    carrito[0].totalConDescuento = carrito[0].total;
    return res.status(200).json({ mensaje: "No se aplico ningun descuento", carrito });
  }

  if (typeof porcentaje !== 'number') {
    console.warn('Warning: porcentaje con formato inválido en POST /carrito/aplicar-descuento');
    return res.status(400).json({ error: "El porcentaje debe ser un número" });
  }

  if (porcentaje > 50 || porcentaje < 0) {
    return res.status(400).json({ mensaje: "El porcentaje de descuento debe estar entre 0 y 50" });
  }

  carrito[0].total = calcularTotalCarrito();
  carrito[0].porcentaje = porcentaje;
  carrito[0].totalConDescuento = carrito[0].total - (carrito[0].total * (carrito[0].porcentaje / 100));

  return res.status(200).json({ mensaje: "Descuento aplicado con exito!", carrito });
});

//JSON inválido en el body
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('Warning: JSON inválido recibido en', req.method, req.originalUrl);
    return res.status(400).json({ error: "El cuerpo de la solicitud no contiene JSON válido" });
  }
  next(err);
});

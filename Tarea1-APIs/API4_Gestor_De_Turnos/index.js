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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

let estado = [
    "esperando",
    "atendiendo",
    "finalizado"
];

let turnos = [
    {
        id: 1,
        cliente: "Juan Perez",
        servicio: "Corte de cabello",
        estado: estado[0]
    }
];

let nextTurnoId = 2;

function getTurnoSiguiente() {
    return turnos.find(turno => turno.estado === "esperando");
}

function getTurnoEnAtencion() {
    return turnos.find(turno => turno.estado === "atendiendo");
}

app.post('/turnos', validarCampos('cliente', 'servicio'), (req, res) => {
    const { cliente, servicio } = req.body;

    const nuevoTurno = {
        id: nextTurnoId++,
        cliente,
        servicio,
        estado: estado[0]
    };
    turnos.push(nuevoTurno);
    res.status(201).json({ Mensaje: 'Turno creado correctamente!', Turno: nuevoTurno });
});

app.get('/turnos', (req, res) => {
    res.status(200).json({ Turnos: turnos });
});

app.get('/turnos/siguiente', (req, res) => {
    const turnoSiguiente = getTurnoSiguiente();
    if (!turnoSiguiente) {
        return res.status(400).json({ Mensaje: 'No hay turnos en espera' });
    }
    res.status(200).json({ Turno: turnoSiguiente });
});

app.put('/turnos/llamar', (req, res) => {
    const turnoEnAtencion = getTurnoEnAtencion();
    if (turnoEnAtencion) {
        return res.status(400).json({ Mensaje: 'Finalice el turno actual antes de llamar otro cliente', Turno: turnoEnAtencion });
    }

    const turnoSiguiente = getTurnoSiguiente();
    if (!turnoSiguiente) {
        return res.status(400).json({ Mensaje: 'No hay turnos en espera' });
    }

    turnoSiguiente.estado = estado[1];
    const siguienteEnCola = getTurnoSiguiente();
    res.status(200).json({ Turno: turnoSiguiente, Siguiente: siguienteEnCola ? siguienteEnCola : 'No hay más turnos en espera' });
});

app.put('/turnos/:id/finalizar', (req, res) => {
    const turnoId = parseInt(req.params.id);
    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) {
        return res.status(404).json({ error: 'Turno no encontrado' });
    }
    if (turno.estado !== "atendiendo") {
        return res.status(400).json({ error: 'El turno no está en estado "atendiendo", no se puede finalizar' });
    }
    turno.estado = estado[2];
    res.status(200).json({ Mensaje: 'Turno finalizado correctamente!', Turno: turno });
});

app.get('/turnos/espera', (req, res) => {
    const turnosEnEspera = turnos.filter(turno => turno.estado === "esperando");
    res.status(200).json({ Mensaje: `Hay ${turnosEnEspera.length} turnos en espera`, turnos: turnosEnEspera });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.warn('Warning: JSON inválido recibido en', req.method, req.originalUrl);
        return res.status(400).json({ error: "El cuerpo de la solicitud no contiene JSON válido" });
    }
    next(err);
});

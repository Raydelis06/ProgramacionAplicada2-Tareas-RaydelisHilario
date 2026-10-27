-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('pendiente', 'completada', 'cancelada');

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'pendiente',
    "usuarioId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

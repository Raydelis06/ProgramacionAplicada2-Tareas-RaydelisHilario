-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('esperando', 'atendiendo', 'finalizado');

-- CreateTable
CREATE TABLE "Turno" (
    "id" SERIAL NOT NULL,
    "cliente" TEXT NOT NULL,
    "servicio" TEXT NOT NULL,
    "estado" "EstadoTurno" NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

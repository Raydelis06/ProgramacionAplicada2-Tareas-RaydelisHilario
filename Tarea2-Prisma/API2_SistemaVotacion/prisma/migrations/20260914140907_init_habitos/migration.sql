-- CreateTable
CREATE TABLE "Habito" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "meta" INTEGER NOT NULL,

    CONSTRAINT "Habito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroHabito" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "completado" BOOLEAN NOT NULL,
    "habitoId" INTEGER NOT NULL,

    CONSTRAINT "RegistroHabito_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RegistroHabito" ADD CONSTRAINT "RegistroHabito_habitoId_fkey" FOREIGN KEY ("habitoId") REFERENCES "Habito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

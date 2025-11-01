-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "house_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "room_name" VARCHAR(100) NOT NULL,
    "renter" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "area" DECIMAL(6,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "room_price" DECIMAL(10,2) NOT NULL,
    "elect_price" DECIMAL(8,2) NOT NULL,
    "water_price" DECIMAL(8,2) NOT NULL,
    "trash_fee" DECIMAL(8,2) NOT NULL,
    "washing_machine_fee" DECIMAL(8,2) NOT NULL,
    "elevator_fee" DECIMAL(8,2) NOT NULL,
    "rented_at" TIMESTAMPTZ NOT NULL,
    "deposit" DECIMAL(10,2) NOT NULL,
    "note" TEXT NOT NULL,
    "house_id" INTEGER NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_payment" (
    "id" SERIAL NOT NULL,
    "elect_start" INTEGER NOT NULL,
    "elect_end" INTEGER NOT NULL,
    "water_start" INTEGER NOT NULL,
    "water_end" INTEGER NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "monthly_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_payment_room_id_month_year_key" ON "monthly_payment"("room_id", "month", "year");

-- AddForeignKey
ALTER TABLE "house" ADD CONSTRAINT "house_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "house"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_payment" ADD CONSTRAINT "monthly_payment_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "price" (
    "id" SERIAL NOT NULL,
    "price_name" VARCHAR(50) NOT NULL,
    "room_price" DECIMAL(10,2) NOT NULL,
    "elect_price" DECIMAL(8,2) NOT NULL,
    "water_price" DECIMAL(8,2) NOT NULL,
    "trash_fee" DECIMAL(8,2) NOT NULL,
    "washing_machine_fee" DECIMAL(8,2) NOT NULL,
    "elevator_fee" DECIMAL(8,2) NOT NULL,
    "deposit" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_pkey" PRIMARY KEY ("id")
);

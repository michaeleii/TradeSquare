import { PrismaClient, Item, User, Category } from "@prisma/client";

let prisma = new PrismaClient();

export default prisma;

export  { Item, User, Category };


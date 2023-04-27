import { PrismaClient, Item, User } from "@prisma/client";

let prisma = new PrismaClient();

export default prisma;

export  { Item, User };
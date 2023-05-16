import prisma from "../client";

async function getAllSquares() {
  try {
    const allSquares = await prisma.square.findMany();
    return allSquares;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getAllSortedSquares() {
  try {
    const squares = await prisma.square.findMany({
      orderBy: { users: { _count: "desc" } },
    });
    return squares;
  } catch (error) {
    throw error;
  }
}

async function getSquareById(id: number) {
  try {
    const square = await prisma.square.findUnique({
      where: {
        id: id,
      },
      include: {
        posts: {
          include: {
            user: true,
          },
        },
      },
    });
    return square;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export { getAllSquares, getAllSortedSquares, getSquareById };

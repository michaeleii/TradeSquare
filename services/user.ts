import prisma from "../client";
import { Request, Response, NextFunction } from "express";

async function getUserById(id: number) {
  try {
    const getUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        items: {
          include: {
            category: true,
          },
        },
        likes: true,
      },
    });
    return getUser;
  } catch (error) {
    throw error;
  }
}

async function checkIfUserExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req.oidc;
  if (!user) return next();
  const userExists = await prisma.user.findUnique({
    where: {
      auth0Id: user.sub,
    },
  });
  if (!userExists) {
    await prisma.user.create({
      data: {
        auth0Id: user.sub,
        f_name: user.f_name,
        l_name: user.l_name,
        profilePic: user.picture,
        email: user.email,
      },
    });
  }
  next();
}

async function getUserByAuth0Id(auth0Id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        items: { include: { category: true } },
        likes: true,
        posts: true,
        squares: true,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
}

async function checkIfUserLiked(userId: number, itemId: number) {
  try {
    const liked = await prisma.like.findFirst({
      where: {
        userId,
        itemId,
      },
    });
    return liked ? true : false;
  } catch (error) {
    throw error;
  }
}

async function likeItem(userId: number, itemId: number) {
  try {
    const like = await prisma.like.create({
      data: {
        userId,
        itemId,
      },
    });
    return like;
  } catch (error) {
    throw error;
  }
}

async function unlikeItem(userId: number, itemId: number) {
  try {
    await prisma.like.delete({
      where: { userId_itemId: { userId, itemId } },
    });
  } catch (error) {
    throw error;
  }
}

async function getUserLikedItems(userId: number) {
  try {
    const likedItems = await prisma.like.findMany({
      where: {
        userId,
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
    });
    return likedItems;
  } catch (error) {
    throw error;
  }
}

async function getUserSquares(userId: number) {
  try {
    const userSquares = await prisma.squaresUsers.findMany({
      where: {
        userId,
      },
      include: {
        square: true,
      },
    });
    return userSquares;
  } catch (error) {
    throw error;
  }
}

async function checkIfUserJoined(userId: number, squareId: number) {
  try {
    const joined = await prisma.squaresUsers.findFirst({
      where: {
        userId,
        squareId,
      },
    });
    return joined ? true : false;
  } catch (error) {
    throw error;
  }
}

async function joinSquare(userId: number, squareId: number) {
  try {
    const joinSquare = await prisma.squaresUsers.create({
      data: {
        userId,
        squareId,
      },
    });
    return joinSquare;
  } catch (error) {
    throw error;
  }
}

async function unjoinSquare(userId: number, squareId: number) {
  try {
    await prisma.squaresUsers.delete({
      where: { squareId_userId: { squareId, userId } },
    });
  } catch (error) {
    throw error;
  }
}

export {
  getUserById,
  checkIfUserExists,
  getUserByAuth0Id,
  checkIfUserLiked,
  likeItem,
  unlikeItem,
  getUserLikedItems,
  getUserSquares,
  checkIfUserJoined,
  joinSquare,
  unjoinSquare,
};

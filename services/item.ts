import { Item } from "@prisma/client";
import prisma from "../client";

async function getAllItems(currentUserAuth0Id: string) {
  try {
    const allItems = await prisma.item
      .findMany({
        where: {
          user: {
            auth0Id: { not: currentUserAuth0Id },
          },
        },
        include: {
          user: true,
          likes: true,
        },
      })
      .then((items) => {
        return items.map((item) => ({ ...item, likeCount: item.likes.length }));
      });
    return allItems;
  } catch (error) {
    throw error;
  }
}

async function sortItemsByLikes(currentUserAuth0Id: string) {
  try {
    const sortedItems = await prisma.item
      .findMany({
        where: {
          user: {
            auth0Id: { not: currentUserAuth0Id },
          },
        },
        include: {
          user: true,
          likes: true,
        },
        orderBy: {
          likes: {
            _count: "desc",
          },
        },
      })
      .then((items) => {
        return items.map((item) => ({ ...item, likeCount: item.likes.length }));
      });
    return sortedItems;
  } catch (error) {
    throw error;
  }
}

async function getItemByItemId(itemId: number) {
  try {
    const item = await prisma.item
      .findUnique({
        where: {
          id: itemId,
        },
        include: {
          user: true,
          likes: true,
          category: true,
        },
      })
      .then((item) => {
        if (!item) {
          throw new Error("Item not found");
        }
        return {
          ...item,
          likeCount: item.likes.length,
        };
      });
    return item;
  } catch (error) {
    throw error;
  }
}

async function createItem(formData: Item) {
  try {
    const newItem = await prisma.item.create({
      data: formData,
    });
    return newItem;
  } catch (error) {
    throw error;
  }
}

async function deleteItem(itemId: number) {
  try {
    await prisma.like.deleteMany({
      where: { itemId },
    });
    const deletedItem = await prisma.item.delete({
      where: {
        id: itemId,
      },
    });
    return deletedItem;
  } catch (error) {
    throw error;
  }
}

async function updateItem(itemId: number, formData: Item) {
  try {
    const updatedItem = await prisma.item.update({
      where: {
        id: itemId,
      },
      data: formData,
    });
    return updatedItem;
  } catch (error) {
    throw error;
  }
}

export { getAllItems, getItemByItemId, createItem, updateItem, deleteItem, sortItemsByLikes };


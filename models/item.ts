// import ItemData from "../interfaces/ItemData";
// import { getUserById } from "./user";

// const items: Item[] = [
//     {
//         id: 1,
//         name: "Wall Decor for Living Room",
//         description:
//             "2 modern minimalistic paintings. I don't like the style and would like to trade it for something more flashy.",
//         user_id: 1,
//         likes: 20,
//     },
//     {
//         id: 2,
//         name: "Single Seat Foam Sofa, One Piece",
//         description: "Some weird sofa if you want.",
//         user_id: 2,
//         likes: 88,
//     },
//     {
//         id: 3,
//         name: "Artificial Fiddle Leaf Fig Plants",
//         description: "Plants that eat human hahahahaha :).",
//         user_id: 3,
//         likes: 666,
//     },
//     {
//         id: 4,
//         name: "Hanobe Rustic Wooden Serving Tray",
//         description: "Useless.",
//         user_id: 4,
//         likes: 666,
//     },
//     {
//         id: 5,
//         name: "Sofa and Supportive Bed Pillow",
//         description: "Good sleep bro.",
//         user_id: 5,
//         likes: 16,
//     },
//     {
//         id: 6,
//         name: "SONGMICS Carbinet Organizer shelf",
//         description: "Gimme some books in exchange.",
//         user_id: 6,
//         likes: 9,
//     },
//     {
//         id: 7,
//         name: "Artificial Eucalyptus Branches Fake Plants",
//         description: "Why don't you just buy some real plants??",
//         user_id: 7,
//         likes: 57,
//     },
//     {
//         id: 8,
//         name: "Plant Wall Decor, Botanical Wall Art",
//         description: "No comment.",
//         user_id: 8,
//         likes: 3,
//     },
// ];

// function getAllItems(): ItemData[] {
//     return items.map((item) => {
//         const user = getUserById(item.user_id);
//         return {
//             id: item.id,
//             name: item.name,
//             description: item.description,
//             likes: item.likes,
//             user,
//         };
//     });
// };

// function getItemByItemId(id: number): ItemData | null {
//     const item = items.find((item) => item.id === id) || null;
//     if (item) {
//         const user = getUserById(item.user_id);
//         return {
//             id: item.id,
//             name: item.name,
//             description: item.description,
//             likes: item.likes,
//             user,
//         };
//     } else {
//         return null;
//     }
// }
// console.log(getItemByItemId(1))

import prisma from "../client";
import { Item, User } from "@prisma/client";

async function getAllItems(): Promise<(Item & { user: User | null })[]> {
	try {
		const allItems = await prisma.item.findMany({
			include: {
				user: true,
			},
		});
		return allItems;
	} catch (error) {
		throw error;
	}
}

// getAllItems().then((items) => console.log(items));

async function getItemByItemId(
	itemId: number
): Promise<(Item & { user: User | null }) | null> {
	try {
		const item = await prisma.item.findUnique({
			where: {
				id: itemId,
			},
			include: {
				user: true,
			},
		});
		return item;
	} catch (error) {
		throw error;
	}
}

// getItemByItemId(1).then((item) => console.log(item));

export { getAllItems, getItemByItemId };

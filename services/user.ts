import prisma from "../client";

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
			},
		});
		return getUser;
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
// async function getUserLikedItems(id: number) {
// 	try {
// 		const userLikedItems = await prisma.user
// 			.findUnique({
// 				where: {
// 					id: id,
// 				},
// 			})
// 			.likedItems();
// 		return userLikedItems;
// 	} catch (error) {
// 		throw error;
// 	}
// }

// async function increaseItemLikes(itemId: number) {
// 	try {
// 		const likePlus = await prisma.item.update({
// 			where: {
// 				id: itemId,
// 			},
// 			data: {
// 				likes: { increment: 1 },
// 			},
// 		});
// 		return likePlus;
// 	} catch (error) {
// 		throw error;
// 	}
// }

// async function decreaseItemLikes(itemId: number) {
// 	try {
// 		const likeMinus = await prisma.item.update({
// 			where: {
// 				id: itemId,
// 			},
// 			data: {
// 				likes: { decrement: 1 },
// 			},
// 		});
// 		return likeMinus;
// 	} catch (error) {
// 		throw error;
// 	}
// }

export { getUserById, checkIfUserLiked, likeItem, unlikeItem };

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

async function getUserLikedItems(id: number) {
	try {
		const userLikedItems = await prisma.user.findUnique({
			where: {
				id: id,
			},
		}).likedItems();
		return userLikedItems;
	}
	catch (error) {
		throw error;
	}
}

async function userLikeOrUnlike(id: number, itemId: number) {
	const userLikedItems = await getUserLikedItems(id);
	if (userLikedItems) {
		const itemIsLiked = userLikedItems.some((item) => item.id === itemId);
		try {
			if (itemIsLiked) {
				const userUnlikedItem = await prisma.user.update({
					where: {
						id: id,
					},
					data: {
						likedItems: {
							disconnect: {
								id: itemId,
							},
						},
					},
				}).likedItems();
				await decreaseItemLikes(itemId);
				return userUnlikedItem;
			} else {
				const userLikedItem = await prisma.user.update({
					where: {
						id: id,
					},
					data: {
						likedItems: {
							connect: {
								id: itemId,
							},
						},
					},
				}).likedItems();
				await increaseItemLikes(itemId);
				return userLikedItem;
			}
		} catch (error) {
			throw error;
		}
	}
}

async function increaseItemLikes(itemId: number) {
	try {
		const likePlus = await prisma.item.update({
			where: {
				id: itemId,
			},
			data: {
				likes: {increment: 1},}
			});
		return likePlus;
		}
	catch (error) {
		throw error;
	}
}

async function decreaseItemLikes(itemId: number) {
	try {
		const likeMinus = await prisma.item.update({
			where: {
				id: itemId,
			},
			data: {
				likes: { decrement: 1 },
			}
		});
		return likeMinus;
	}
	catch (error) {
		throw error;
	}
}

export { getUserById, getUserLikedItems, userLikeOrUnlike };

// increaseItemLikes(5).then((data) => console.log(data));
// decreaseItemLikes(5).then((data) => console.log(data));
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
		for (const item of userLikedItems) {
			if (item.id === itemId) {
				try {
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
					return userUnlikedItem;
				}
				catch (error) {
					throw error;
				}
			} else {
				try {
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
					return userLikedItem;
				}
				catch (error) {
					throw error;
				}
			}
		}
	}
	
	
}

export { getUserById, getUserLikedItems, userLikeOrUnlike };

// userLikeOrUnlike(1, 3).then((res) => console.log(res?.map(item => {return item.id}))).catch((err) => console.log(err));
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

export { getUserById, getUserLikedItems};


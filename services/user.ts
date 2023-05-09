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
				likes: true,
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

export {
	getUserById,
	checkIfUserLiked,
	likeItem,
	unlikeItem,
	getUserLikedItems,
	getUserSquares,
};

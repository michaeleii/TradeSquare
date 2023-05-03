import prisma from "../client";

async function getAllCategories() {
	try {
		const categories = await prisma.category.findMany({});
		return categories;
	} catch (error) {
		throw error;
	}
}

async function getItemsByCategoryId(categoryId: number) {
	try {
		const itemsInCategory = await prisma.category.findUnique({
			where: {
				id: categoryId,
			},
			include: {
				items: {
					include: {
						user: true,
					},
				},
			},
		});
		return itemsInCategory;
	} catch (error) {
		throw error;
	}
}

export { getAllCategories, getItemsByCategoryId };

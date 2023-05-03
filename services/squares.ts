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

export default getAllSquares;

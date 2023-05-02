// const users: User[] = [
//   {
//     id: 1,
//     f_name: "Adarsha",
//     l_name: "Srivastava",
//     rating: 3.8,
//   },
//   {
//     id: 2,
//     f_name: "Shelly",
//     l_name: "Doe",
//     rating: 4.5,
//   },
//   {
//     id: 3,
//     f_name: "Jessica ",
//     l_name: "Tyshynski",
//     rating: 4.2,
//   },
//   {
//     id: 4,
//     f_name: "Michelle",
//     l_name: "Weitzman",
//     rating: 2.0,
//   },
//   {
//     id: 5,
//     f_name: "Asma",
//     l_name: "Faseeh",
//     rating: 5.0,
//   },
//   {
//     id: 6,
//     f_name: "Gina",
//     l_name: "Donaher",
//     rating: 4.5,
//   },
//   {
//     id: 7,
//     f_name: "Mike",
//     l_name: "Tyson",
//     rating: 4.0,
//   },
//   {
//     id: 8,
//     f_name: "Connor",
//     l_name: "John",
//     rating: 3.5,
//   },
// ];

import prisma from "../client";
import { Item, User } from "@prisma/client";

async function getUserById(id: number): Promise<
	| (User & {
			items: Item[];
	  })
	| null
> {
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

export { getUserById };

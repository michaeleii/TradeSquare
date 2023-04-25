import User from "./User";

export default interface Item {
	id: number;
	name: string;
	description: string;
	user: User | null;
	likes: number;
}

import User from "./User";

interface ItemData {
	id: number;
	name: string;
	description: string;
	user: User | null;
	likes: number;
}

export default ItemData;

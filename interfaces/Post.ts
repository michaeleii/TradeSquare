import User from "./User";
import Square from "./Square";
interface Post {
	id: number;
	user_id: User;
	square_id: Square
	img_url: string;
	date: Date;
	description: string;
}

export default Post;

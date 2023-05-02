import User from "./User";
import Square from "./Square";
interface Post {
  id: number;
  user_id: number;
  square_id: number;
  img_url: string;
  date: Date;
  description: string;
}

export default Post;

// import Post from "../interfaces/Post";

// const posts: Post[] = [
//   {
//     id: 1,
//     user_id: 1,
//     square_id: 1,
//     img_url:
//       "https://images.unsplash.com/photo-1612837017391-4b6b7b0b0b0b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YXJ0JTIwY29sbGVjdG9yc3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
//     date: new Date(Date.now()),
//     description: "Can you guys suggest me some art exhibitions near me?",
//   },
//   {
//     id: 2,
//     user_id: 2,
//     square_id: 1,
//     img_url:
//       "https://images.unsplash.com/photo-1612837017391-4b6b7b0b0b0b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YXJ0JTIwY29sbGVjdG9yc3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
//     date: new Date(Date.now()),
//     description: "Can you guys suggest me some art exhibitions near me?",
//   },
// ];

// export default posts;

import prisma from "../client";
import { Post } from "@prisma/client";

async function getAllPosts () {
  try {
    const allPosts = await prisma.post.findMany({
      
    });
    return allPosts;
  } catch (error) {
    throw error;
  }
};

async function createPost(formData: Post) {
  try {
    const newPost = await prisma.post.create({
      data: formData,
    });
    return newPost;
  } catch (error) {
    throw error;
  }
}


async function getPostsBySquareId(squareId: number) {
  try {
    if (isNaN(squareId)) {
      throw new Error('Invalid squareId');
    }
    const posts = await prisma.post.findMany({
      where: {
        squareId: squareId,
      },
    });
    return posts;
  } catch (error) {
    throw error;
  }
}


export { getAllPosts, createPost, getPostsBySquareId };

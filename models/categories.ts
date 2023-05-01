import prisma from "../client";
import { Item, Category } from "@prisma/client";
import User from "../interfaces/User";
import items from "../routes/items";

async function getAllCategories(): Promise<Category[] | null> {
    try {
        const categories = await prisma.category.findMany({});
        return categories;
    } catch (error) {
        throw error;
    }
}

async function getItemsByCategoryId(categoryId: number): Promise<Item[] | undefined > {
    try {
        const category = await prisma.category.findUnique({
            where: { 
                id: categoryId 
            }, 
            include: { 
                items: true, 
            } 
        })
        const itemsInCategory = category?.items;
        return itemsInCategory;
    } catch (error) {
        throw error;
    }
}

async function getCategoryItemsUsers(items: Item[]): Promise<User[] | null> {
    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: items.map((item) => item.userId)
                }
            }
        })
        return users;
    } catch (error) {
        throw error;
    }
}

export { getAllCategories, getItemsByCategoryId, getCategoryItemsUsers }


// getAllCategories().then((categories) => {console.log(categories?.map((category) => {return { name: category.name}}))});

/* Output:
[
  { name: 'Home Furniture/ Organizer' },
  { name: 'Cloth/ Accessories' },
  { name: 'Shoes' },
  { name: 'Collections ( Art / Music)' },
  { name: 'Kitchen Appliances' },
  { name: 'Car / Electronics' }
]
*/

// getItemsByCategoryId(1)
//     .then((items) => getCategoryItemsUsers(items!))
//     .then((users) => console.log(users))

/* Output:
{
  id: 1,
  name: 'Home Furniture/ Organizer',
  items: [
    {
      id: 1,
      name: 'Wall Decor for Living Room',
      description: "2 modern minimalistic paintings. I don't like the style and would like to trade it for something more flashy.",
      userId: 1,
      imgName: 'product1.jpg',
      likes: 20,
      categoryId: 1
    },
    {
      id: 2,
      name: 'Single Seat Foam Sofa, One Piece',
      description: 'Some weird sofa if you want.',
      userId: 2,
      imgName: 'product2.jpg',
      likes: 88,
      categoryId: 1
    },
    {
      id: 3,
      name: 'Artificial Fiddle Leaf Fig Plants',
      description: 'Plants that eat human hahahahaha :).',  
      userId: 3,
      imgName: 'product3.jpg',
      likes: 666,
      categoryId: 1
    },
    {
      id: 4,
      name: 'Hanobe Rustic Wooden Serving Tray',
      description: 'Useless',
      userId: 4,
      imgName: 'product4.jpg',
      likes: 666,
      categoryId: 1
    },
    {
      id: 5,
      name: 'Sofa and Supportive Bed Pillow',
      description: 'Good sleep bro.',
      userId: 5,
      imgName: 'product5.jpg',
      likes: 3,
      categoryId: 1
    },
    {
      id: 6,
      name: 'SONGMICS Carbinet Organizer shelf',
      description: 'Gimme some books in exchange.',
      userId: 6,
      imgName: 'product8.jpg',
      likes: 57,
      categoryId: 1
    },
    {
      id: 7,
      name: 'Artificial Eucalyptus Branches Fake Plants',   
    }  ]
}
*/
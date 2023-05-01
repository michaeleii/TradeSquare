import Item from './Item';

export default interface Category {
    id: number;
    name: string;
    items: Item[];
}


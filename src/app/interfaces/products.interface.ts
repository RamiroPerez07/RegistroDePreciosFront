export interface IProduct {
  _id: string;
  description: string;
  userId: string;
}

export interface INewProduct extends Omit<IProduct, '_id' | 'userId'> {
  token: string;
}
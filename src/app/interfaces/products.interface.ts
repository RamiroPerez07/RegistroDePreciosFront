export interface IProduct {
  _id: string;
  description: string;
  userId: {
    _id: string,
    username: string,
  };
  userRevisor: {
    _id: string,
    username: string,
  }
  createdAt: Date;
  updatedAt: Date;
}

export interface INewProduct extends Omit<IProduct, '_id' | 'userId' | 'userRevisor' | 'createdAt' | 'updatedAt'> {
  token: string;
}
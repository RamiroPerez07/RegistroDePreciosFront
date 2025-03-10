export interface IQuote {
  _id: string;
  proveedor: string;
  precio: number;
  iva: number;
  precioFinal?: number;
  marca?: string;
  stock: boolean;
  userId: string;
  productId: string;
  userRevisionStock: string;
  observacion?: string;
  fechaCarga: Date;
  fechaRevisionStock: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuoteWithUsername extends Omit<IQuote, 'userRevisionStock' | 'userId'> {
  userId: {
    _id: string,
    username: string,
  },
  userRevisionStock: {
    _id: string,
    username: string,
  },
}
export interface IQuote {
  _id: string;
  proveedor: string;
  precio: number;
  iva: number;
  descuento1: number;
  descuento2: number;
  plazo?: string;
  precioFinal?: number;
  marca?: string;
  stock: boolean;
  userId: string;
  productId: string;
  userRevisionStock: string;
  observacion?: string;
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

export interface INewQuote{
  proveedor: string;
  precio: number;
  descuento1: number;
  descuento2: number;
  plazo?: string;
  iva: number;
  marca?: string;
  stock: boolean;
  productId: string;
  observacion?: string;
}
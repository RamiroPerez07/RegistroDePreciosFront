import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IProduct } from '../interfaces/products.interface';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private readonly _http = inject(HttpClient);

  private readonly _getProductsUrl = "https://registro-de-precios.vercel.app/api/products/";

  private readonly _createProductsUrl = "https://registro-de-precios.vercel.app/api/products/";

  private readonly _deleteProductUrl = "https://registro-de-precios.vercel.app/api/products/"

  public products = new BehaviorSubject<IProduct[]>([]);

  public $products = this.products.asObservable();

  constructor() {}

  public selectedProduct = new BehaviorSubject<IProduct | null>(null);

  $selectedProduct = this.selectedProduct.asObservable();

  setSelectedProduct(product: IProduct | null){
    this.selectedProduct.next(product);
  }

  getProducts(token: string) : Observable<IProduct[]>{
    if(!token) return of([])
    return this._http.get<IProduct[]>(this._getProductsUrl, {
      headers: {
        "Authorization": "Bearer "+token
      }
    }).pipe(
      tap(
        (products: IProduct[]) => {

          const sortedProducts = products.sort((a, b) => {
            return a.description.localeCompare(b.description);
          });

          this.products.next(sortedProducts)
        }
      )
    )
  }

  createProduct(description:string,token: string){
    return this._http.post(this._createProductsUrl, {description: description}, {
      headers: {
        "Authorization": "Bearer "+token
      }
    })
  }

  deleteProduct(productId: string, token: string){
    return this._http.delete(this._deleteProductUrl,{
      body: {
        id: productId,
      },
      headers: {
        "Authorization": "Bearer "+token
      }
    })
  }
}

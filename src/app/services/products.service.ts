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

  public products = new BehaviorSubject<IProduct[]>([]);

  public $products = this.products.asObservable();

  constructor() {}

  getProducts(token: string) : Observable<IProduct[]>{
    if(!token) return of([])
    return this._http.get<IProduct[]>(this._getProductsUrl, {
      headers: {
        "Authorization": "Bearer "+token
      }
    }).pipe(
      tap(
        (products: IProduct[]) => {
          this.products.next(products)
        }
      )
    )
  }
}

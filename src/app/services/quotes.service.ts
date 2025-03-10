import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { INewQuote, IQuoteWithUsername } from '../interfaces/quotes.interface';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {

  private readonly _http = inject(HttpClient);

  private readonly _quotesUrl = "https://registro-de-precios.vercel.app/api/quotes/"

  private readonly _newQuoteUrl = "https://registro-de-precios.vercel.app/api/quotes/"

  public quotes = new BehaviorSubject<IQuoteWithUsername[]>([]);

  public $quotes = this.quotes.asObservable();

  constructor() { }

  getQuotesByProductId(productId: string, token: string): Observable<IQuoteWithUsername[]>{
    if (!token) return of([])
    return this._http.get<IQuoteWithUsername[]>(this._quotesUrl + productId, {
      headers: {
        "Authorization": "Bearer "+ token
      }
    }).pipe(
      map((quotes: IQuoteWithUsername[]) => {
        // Mapeo de las cotizaciones para incluir el precio final
        return quotes.map(quote => ({
          ...quote,
          precioFinal: quote.precio * (1 + quote.iva / 100) // Calculo del precio final
        }));
      }),
      tap(
        (quotes : IQuoteWithUsername[]) => {
          this.quotes.next(quotes);
        }
      )
    )
  }

  createQuote(newQuote: INewQuote, token: string){
    return this._http.post(this._newQuoteUrl, newQuote, {
      headers: {
        "Authorization": "Bearer "+ token
      }
    })
  }
}

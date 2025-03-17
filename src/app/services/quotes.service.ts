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

  private readonly _deleteQuotesUrl = "https://registro-de-precios.vercel.app/api/quotes/"

  private readonly _updateStockStatusUrl = "https://registro-de-precios.vercel.app/api/quotes/update-stock"

  private readonly _updateQuoteUrl = "https://registro-de-precios.vercel.app/api/quotes/"

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
          precioFinal: quote.precio * (1-quote.descuento1 / 100) * (1-quote.descuento2 / 100) /** (1-quote.descuento3 / 100)*/ * (1 + quote.iva / 100) // Calculo del precio final
        }));
      }),
      tap(
        (quotes : IQuoteWithUsername[]) => {
          const sortedQuotes = quotes.sort((a, b) => {
            // Ordenar por createdAt, de la más reciente a la más vieja
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime(); // De más reciente (b) a más vieja (a)
          });
          this.quotes.next(sortedQuotes);
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

  deleteQuotes(ids: string[],token: string){
    return this._http.delete(this._deleteQuotesUrl, {
      body: {ids: ids},
      headers: {
        "Authorization": "Bearer " + token
      }
    })
  }

  updateStock(id: string, stock: boolean,token: string){
    return this._http.put(this._updateStockStatusUrl, {id,stock},{
      headers: {
        "Authorization": "Bearer " + token
      }
    })
  }

  updateQuote(id: string, quote: INewQuote, token: string){
    return this._http.put(this._updateQuoteUrl, {id,...quote},{
      headers: {
        "Authorization": "Bearer " + token
      }
    })
  }
  
}

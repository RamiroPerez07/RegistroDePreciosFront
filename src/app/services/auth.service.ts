import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IUser } from '../interfaces/auth.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _urlLogin = "https://registro-de-precios.vercel.app/api/auth/login";

  user = new BehaviorSubject<IUser | null>(null)

  $user = this.user.asObservable();

  private readonly _http = inject(HttpClient);

  constructor() {
    if(typeof window === "undefined") return
    // Si el token existe en el localStorage, se inicializa el BehaviorSubject con el valor del token
    const storedUser = localStorage.getItem('price-records-user');
    let parseUser : IUser | null = null;
    if (storedUser) {
      try {
        // Intentamos parsear el string JSON a un objeto de tipo User
        parseUser = JSON.parse(storedUser) as IUser;
        if (parseUser) {
          this.user.next(parseUser);
        }
      } catch (error) {
        console.error('Error al parsear el usuario:', error);
      }
    }
  }

  isAuthenticated():boolean{
    if(typeof window === "undefined") return false;
    return !!localStorage.getItem("price-records-user");
  }

  login(email: string, password: string): Observable<IUser>{
    return this._http.post<IUser>(this._urlLogin,{email,password}).pipe(
      tap((user: IUser) => {
        localStorage.setItem("price-records-user", JSON.stringify(user));
        this.user.next(user);
      })
    )
  }

  logout(){
    localStorage.removeItem("price-records-user");
    this.user.next(null);
  }
}

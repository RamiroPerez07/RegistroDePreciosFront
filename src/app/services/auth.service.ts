import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IUser } from '../interfaces/auth.interface';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _urlLogin = "https://registro-de-precios.vercel.app/api/auth/login";

  user = new BehaviorSubject<IUser | null>(null)

  $user = this.user.asObservable();

  private readonly _http = inject(HttpClient);

  private readonly _router = inject(Router);

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

  checkTokenExpiration(): boolean {
    if(typeof window === "undefined") return false;
    // Obtener el objeto de usuario del LocalStorage
    const user = localStorage.getItem('price-records-user');
    
    // Si no hay usuario guardado en el LocalStorage, redirigir al login
    if (!user) {
      this._router.navigate(['/login']);
      return false;
    }

    try {
      // Convertir el string JSON en un objeto
      const userObject = JSON.parse(user);
      
      // Obtener el token del objeto
      const token = userObject.token;
      
      // Si no hay token en el objeto de usuario, redirigir al login
      if (!token) {
        this._router.navigate(['/login']);
        return false;
      }

      // Decodificar el token
      const decodedToken: any = jwtDecode(token);
      const expirationDate = decodedToken.exp * 1000; // Convertir a milisegundos
      const currentDate = new Date().getTime();

      // Verificar si el token ha expirado
      if (expirationDate < currentDate) {
        // El token ha expirado
        localStorage.removeItem('price-records-user'); // Eliminar el usuario (y su token)
        this._router.navigate(['/login']);
        return false;
      }

      // El token sigue siendo válido
      return true;

    } catch (error) {
      // Si hay un error al procesar el token o el objeto de usuario, redirigir al login
      this._router.navigate(['/login']);
      return false;
    }
}
}

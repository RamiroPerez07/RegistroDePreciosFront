import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { IUser } from '../../interfaces/auth.interface';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authSvc = inject(AuthService);

  toastSvc = inject(ToastrService);

  router = inject(Router);  // Inyectamos el servicio Router

  loginGroupControl = new FormGroup({
    emailControl: new FormControl("", [Validators.required]),
    passwordControl : new FormControl("", [Validators.required]),
  })

  user! : IUser | null;

  ngOnInit(): void {
    this.authSvc.checkTokenExpiration();
  }

  login(){
    if(!this.loginGroupControl.valid){
      this.loginGroupControl.markAllAsTouched();
      return
    }
    const username = this.loginGroupControl.get("emailControl")?.value as string;
    const password = this.loginGroupControl.get("passwordControl")?.value as string;
    this.authSvc.login(username, password).subscribe({
      next: (user: IUser) => {
        this.user = user;
        this.router.navigate(['']);
        this.toastSvc.success("Inicio de Sesión Exitosa","Bienvenido")
      },
      error: (error : HttpErrorResponse) => {
        if(error.status === 401){
          this.toastSvc.error("Usuario y/o contraseña incorrectos","Credenciales inválidas")
        }
        else{
          this.toastSvc.error("Falló el inicio de sesión","Error")
        }
      }
    })
  }
}

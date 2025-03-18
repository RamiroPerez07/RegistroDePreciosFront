import { Component, HostListener, inject, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../interfaces/auth.interface';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-drawer',
  standalone: true,
  imports: [MatIconModule, NgClass],
  templateUrl: './user-drawer.component.html',
  styleUrl: './user-drawer.component.css'
})
export class UserDrawerComponent {
  @Input() user : IUser | null = null;

	readonly authSvc = inject(AuthService);

	readonly routerSvc = inject(Router);

	menuOpen = false;

	toggleMenu() {
	  this.menuOpen = !this.menuOpen;  // Cambia el estado del menú (abierto o cerrado)
	}
	
	// Detecta la tecla Escape para cerrar el menú
	@HostListener('document:keydown.escape', ['$event'])
	onEscapePress(event: KeyboardEvent) {
	  this.menuOpen = false;  // Cierra el menú cuando se presiona Escape
	}

	closeUserSession(){
		this.authSvc.logout();
		this.toggleMenu();
	}
}

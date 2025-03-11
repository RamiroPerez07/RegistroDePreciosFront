import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { IUser } from './interfaces/auth.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserDrawerComponent } from './components/user-drawer/user-drawer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule, UserDrawerComponent, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'RegistroPreciosNg';

  authSvc = inject(AuthService);

  spinnerSvc = inject(SpinnerService);

  loading!: boolean;

  user! : IUser | null;

  ngOnInit(): void {
    this.authSvc.$user.subscribe({
      next: (user: IUser | null) => {
        this.user = user
      }
    })

    this.spinnerSvc.$loading.subscribe({
      next: (loading: boolean) => {
        this.loading = loading
      }
    })
  }

  @ViewChild(UserDrawerComponent) userDrawer!: UserDrawerComponent;
  
  toggleUserDrawer(){
    if(this.user){
      this.userDrawer.toggleMenu();
      return
    }
  }

}

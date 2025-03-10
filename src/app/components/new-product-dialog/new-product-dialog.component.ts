import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { INewProduct } from '../../interfaces/products.interface';
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-new-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './new-product-dialog.component.html',
  styleUrl: './new-product-dialog.component.css'
})
export class NewProductDialogComponent implements OnInit {
  productControl = new FormControl("", [Validators.required])

  readonly dialogRef = inject(MatDialogRef<NewProductDialogComponent>);

  readonly authSvc = inject(AuthService);

  public user! : IUser | null;

  ngOnInit(): void {
    this.authSvc.$user.subscribe({
      next: (user: IUser | null) => {
        this.user = user
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onConfirm(){
    let newProduct : INewProduct;
    if(this.productControl.valid && this.user){
      newProduct = {
        description : this.productControl.value as string,
        token: this.user.token,
      }
      this.dialogRef.close(newProduct)
    }
    return
  }

}

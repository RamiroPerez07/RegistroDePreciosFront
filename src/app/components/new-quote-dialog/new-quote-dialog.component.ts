import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { INewQuote } from '../../interfaces/quotes.interface';
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-new-quote-dialog',
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
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './new-quote-dialog.component.html',
  styleUrl: './new-quote-dialog.component.css'
})
export class NewQuoteDialogComponent implements OnInit {

  readonly data = inject<{
    title:string,
    quoteToEdit : {
      proveedor?: string,
      precio?: number,
      descuento1?: number,
      descuento2?: number,
      plazo?: string,
      iva?: number,
      marca?: string,
      stock?: boolean,
      observacion?: string,
    }}>(MAT_DIALOG_DATA);

  readonly dialogRef = inject(MatDialogRef<NewQuoteDialogComponent>);

  newQuoteGroupControl = new FormGroup({
      proveedorControl: new FormControl<string>("", [Validators.required]),
      precioControl : new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      descuento1Control: new FormControl<number | null>(null, [Validators.min(0)]),
      descuento2Control: new FormControl<number | null>(null, [Validators.min(0)]),
      plazoControl: new FormControl<string>(""), 
      ivaControl : new FormControl<number>(0, [Validators.required]),
      marcaControl : new FormControl<string>(""), 
      stockControl : new FormControl<boolean>(true),
      observacionControl: new FormControl<string>("")
  })

  productSvc = inject(ProductsService)

  authSvc = inject(AuthService);

  selectedProduct! : IProduct | null;

  user!: IUser | null;

  ngOnInit(): void {
    this.productSvc.$selectedProduct.subscribe({
      next: (selectedProduct: IProduct | null) => {
        this.selectedProduct = selectedProduct;
      }
    })

    this.authSvc.$user.subscribe({
      next: (user: IUser | null) => { 
        this.user = user
      } 
    })

    if(this.data.quoteToEdit){
      this.newQuoteGroupControl.get("proveedorControl")?.setValue(this.data.quoteToEdit.proveedor as string);
      this.newQuoteGroupControl.get("precioControl")?.setValue(this.data.quoteToEdit.precio as number);
      this.newQuoteGroupControl.get("descuento1Control")?.setValue(this.data.quoteToEdit.descuento1 as number);
      this.newQuoteGroupControl.get("descuento2Control")?.setValue(this.data.quoteToEdit.descuento2 as number);
      this.newQuoteGroupControl.get("plazoControl")?.setValue(this.data.quoteToEdit.plazo as string);
      this.newQuoteGroupControl.get("ivaControl")?.setValue(this.data.quoteToEdit.iva as number);
      this.newQuoteGroupControl.get("marcaControl")?.setValue(this.data.quoteToEdit.marca as string);
      this.newQuoteGroupControl.get("stockControl")?.setValue(this.data.quoteToEdit.stock as boolean);
      this.newQuoteGroupControl.get("observacionControl")?.setValue(this.data.quoteToEdit.observacion as string);
    }
  }

  onConfirm(){
    if(this.selectedProduct && this.user && this.newQuoteGroupControl.valid){
      const result: {newQuote: INewQuote, token: string} = {
      newQuote: {
        proveedor: this.newQuoteGroupControl.get('proveedorControl')?.value as string,
        precio: this.newQuoteGroupControl.get('precioControl')?.value as number,
        iva: this.newQuoteGroupControl.get('ivaControl')?.value as number,
        descuento1: this.newQuoteGroupControl.get('descuento1Control')?.value as number,
        descuento2: this.newQuoteGroupControl.get('descuento2Control')?.value as number,
        plazo: this.newQuoteGroupControl.get('plazoControl')?.value as string,
        productId: this.selectedProduct._id,
        stock: this.newQuoteGroupControl.get('stockControl')?.value as boolean,
        marca: this.newQuoteGroupControl.get('marcaControl')?.value as string,
        observacion: this.newQuoteGroupControl.get('observacionControl')?.value as string,
      },
      token: this.user.token,
    }
      this.dialogRef.close(result);
    }
    this.newQuoteGroupControl.markAllAsTouched();
  }

  onNoClick(){
    this.dialogRef.close(null);
  }

}

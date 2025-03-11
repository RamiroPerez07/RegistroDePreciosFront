import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete"
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from "@angular/material/input";
import { INewProduct, IProduct } from '../../interfaces/products.interface';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, PercentPipe } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { QuotesService } from '../../services/quotes.service';
import { INewQuote, IQuoteWithUsername } from '../../interfaces/quotes.interface';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon'
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../interfaces/auth.interface';
import { MatDialog } from '@angular/material/dialog'
import { NewProductDialogComponent } from '../new-product-dialog/new-product-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NewQuoteDialogComponent } from '../new-quote-dialog/new-quote-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [MatAutocompleteModule,MatCheckboxModule,MatButtonModule, MatIconModule, CurrencyPipe, PercentPipe, MatTooltipModule, MatFormFieldModule, NgClass, ReactiveFormsModule, FormsModule, MatTableModule, MatSortModule, AsyncPipe, MatInputModule, DatePipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select','createdAt','proveedor', 'precio', 'iva', 'precioFinal', 'marca', 'observacion', 'stock'];
  public quotes ! : IQuoteWithUsername[];
  dataSource = new MatTableDataSource(this.quotes);

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  productControl = new FormControl<string | IProduct>('');
  options!: IProduct[] 
  filteredOptions!: Observable<IProduct[]>;

  public productsSvc = inject(ProductsService);

  public quotesSvc = inject(QuotesService);

  public authSvc = inject(AuthService);

  public user! : IUser | null;

  selectedProduct! : IProduct | null

  ngOnInit() {

    this.authSvc.$user.subscribe({
      next: (user: IUser | null) => {
        this.user = user;
        if(user){
          this.getProducts(user.token)
        }
      }
    })

    this.productsSvc.$selectedProduct.subscribe({
      next: (product: IProduct | null) => {
        this.selectedProduct = product
      }
    })

  }

  getProducts(token: string){
    this.productsSvc.getProducts(token).subscribe({
      next: (products: IProduct[]) => {
        this.options = products;
        this.configureProductsListener()
      },
      error: (err : HttpErrorResponse) => {
        if(err.status === 401){
          this.toastSvc.error("Debes iniciar sesión","Error de autenticación")
          this.router.navigate(["/login"])
        }
      }
    })
  }

  configureProductsListener(){
    this.filteredOptions = this.productControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const description = typeof value === 'string' ? value : value?.description;
        return description ? this._filter(description as string) : this.options.slice();
      }),
    );
  }

  displayFn(product: IProduct): string {
    return product && product.description ? product.description : '';
  }

  private _filter(description: string): IProduct[] {
    const filterValue = description.toLowerCase();

    return this.options.filter(option => option.description.toLowerCase().includes(filterValue));
  }

  deleteSelectedProduct(event: KeyboardEvent){
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.productsSvc.setSelectedProduct(null);
      // Aquí puedes hacer algo específico cuando se presiona Suprimir
    }
  }

  getQuotes(selectedProduct: IProduct, token: string){
    this.quotesSvc.getQuotesByProductId(selectedProduct._id,token).subscribe({
      next: (quotes: IQuoteWithUsername[]) => {
        this.quotes = quotes;
        this.dataSource.data = this.quotes;
        this.selection.clear();
      },
      error: (err : HttpErrorResponse) => {
        if(err.status === 401){
          this.toastSvc.error("Debes iniciar sesión","Error de autenticación")
          this.router.navigate(["/login"])
        }
      }
    });
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent){
    const selectedProduct : IProduct = event.option.value;

    this.productsSvc.setSelectedProduct(selectedProduct);

    const token = this.user?.token

    if(token){
      this.getQuotes(selectedProduct,token)
    }

  }

  formatTooltip(element: IQuoteWithUsername) : string{
    const createdAt = element.fechaRevisionStock ? new Date(element.fechaRevisionStock) : null;
    
    // Función para formatear con dos dígitos
    const formatNumber = (num: number): string => num.toString().padStart(2, '0');
    
    const formattedDate = createdAt 
        ? `${formatNumber(createdAt.getHours())}:${formatNumber(createdAt.getMinutes())} hs ${createdAt.getDate()}/${createdAt.getMonth() + 1}/${createdAt.getFullYear()}` 
        : 'Fecha no disponible';

    const userName = element.userRevisionStock.username || 'Usuario desconocido';

    return `Actualizado: ${formattedDate} \n Usuario: ${userName}`;
  }

  readonly dialog = inject(MatDialog);

  readonly toastSvc = inject(ToastrService);

  readonly router = inject(Router);

  openNewProductDialog(){
    const dialogRef = this.dialog.open(NewProductDialogComponent
    /*  , {data: {name: this.name(), animal: this.animal()},}*/
    );

    dialogRef.afterClosed().subscribe((result: INewProduct) => {
      if(result){
        this.productsSvc.createProduct(result.description, result.token).subscribe({
          next: () => {
            this.toastSvc.success("Nuevo producto cargado con éxito","Producto cargado ok")
            this.getProducts(result.token);
          },
          error: (err : HttpErrorResponse) => {
            if(err.status === 401){
              this.toastSvc.error("Debes iniciar sesión","Error de autenticación")
              this.router.navigate(["/login"])
            }
          }
        })
      }
    })
  }

  readonly QuoteSvc = inject(QuotesService);

  openNewQuoteDialog(){
    const dialogRef = this.dialog.open(NewQuoteDialogComponent
      /*  , {data: {name: this.name(), animal: this.animal()},}*/
    );

    dialogRef.afterClosed().subscribe((result: {newQuote: INewQuote, token: string}) => {
      if(result){
        this.quotesSvc.createQuote(result.newQuote, result.token).subscribe({
          next: () => {
            this.toastSvc.success("Nuevo registro cargado con éxito","Registro cargado ok")
            if(this.selectedProduct){
              this.getQuotes(this.selectedProduct,result.token);
            }
          },
          error: (err : HttpErrorResponse) => {
            if(err.status === 401){
              this.toastSvc.error("Debes iniciar sesión","Error de autenticación")
              this.router.navigate(["/login"])
            }
          }
        })
      }
    })
  }

  selection = new SelectionModel<IQuoteWithUsername>(true, []);

  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IQuoteWithUsername): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.proveedor}-${row.createdAt}`;
  }

  deleteSelectedQuotes(){
    if (Array.isArray(this.selection.selected) && this.selection.selected.length > 0 && this.user) {
      const ids = this.selection.selected.map(quotes => quotes._id)
      this.QuoteSvc.deleteQuotes(ids,this.user.token).subscribe({
        next: () => {
          this.toastSvc.success("Eliminación exitosa","Eliminación de registros");
          if(this.user && this.selectedProduct){
            this.getQuotes(this.selectedProduct,this.user.token)
          }
        }
      })
    }
  }
}

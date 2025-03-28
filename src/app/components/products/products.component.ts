import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete"
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from "@angular/material/input";
import { INewProduct, IProduct } from '../../interfaces/products.interface';
import { map, Observable, startWith, tap } from 'rxjs';
import { AsyncPipe, CommonModule, CurrencyPipe, DatePipe, JsonPipe, NgClass, PercentPipe } from '@angular/common';
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
import { AskYNDialogComponent } from '../ask-y-n-dialog/ask-y-n-dialog.component';
import { SpinnerService } from '../../services/spinner.service';
import {MatMenuModule} from '@angular/material/menu'

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule,MatMenuModule,MatAutocompleteModule,MatCheckboxModule,MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule, NgClass, ReactiveFormsModule, FormsModule, MatTableModule, MatSortModule, MatInputModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select','createdAt','proveedor', 'precio', 'descuento1', 'descuento2'/*, 'descuento3'*/ , 'iva', 'precioFinal', 'marca', 'plazo', 'observacion', 'stock'];
  public quotes ! : IQuoteWithUsername[];
  dataSource = new MatTableDataSource(this.quotes);

  private _sort!: MatSort;

  @ViewChild(MatSort, {
    static: false
  }) set matSort(ms: MatSort) {
    this._sort = ms;
    this.setSort();
  }

  setSort(){
    this.dataSource.sort = this._sort;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this._sort;
  }

  productControl = new FormControl<string | IProduct>('');

  options!: IProduct[] 

  filteredOptions!: Observable<IProduct[]>;

  public productsSvc = inject(ProductsService);

  public quotesSvc = inject(QuotesService);

  public authSvc = inject(AuthService);

  public user! : IUser | null;

  selectedProduct! : IProduct | null

  public loading ! : boolean;

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

    this.loadingSvc.$loading.subscribe({
      next: (loading: boolean) => {
        this.loading = loading
      }
    })

  }

  getProducts(token: string){
    this.productsSvc.getProducts(token).subscribe({
      next: (products: IProduct[]) => {
        this.options = products;
        this.configureProductsListener();
        this.productsSvc.setSelectedProduct(null);
        this.productControl.setValue("");
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
        this.productsSvc.setSelectedProduct(null);
        this.quotes = [];
        this.selection.clear();
        this.dataSource.data = [];
        return description ? this._filter(description as string) : this.options.slice();
      }),
    );
  }

  displayFn(product: IProduct): string {
    return product && product.description ? product.description.toUpperCase() : '';
  }

  private _filter(description: string): IProduct[] {
    const filterValue = description.toLowerCase();

    return this.options.filter(option => option.description.toLowerCase().includes(filterValue));
  }


  getQuotes(selectedProduct: IProduct, token: string){
    this.quotesSvc.getQuotesByProductId(selectedProduct._id,token).subscribe({
      next: (quotes: IQuoteWithUsername[]) => {
        this.quotes = quotes;
        this.dataSource.data = this.quotes;
        this.selection.clear();
        this.dataSource.sort = this._sort;
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
    const dialogRef = this.dialog.open(NewProductDialogComponent,
     {data: {title: "Nuevo producto"},}
    );

    dialogRef.afterClosed().subscribe((result: INewProduct) => {
      if(result){
        this.productsSvc.createProduct(result.description, result.token).subscribe({
          next: () => {
            this.toastSvc.success("Nuevo producto cargado con éxito","Producto cargado ok")
            this.getProducts(result.token);
            this.productsSvc.setSelectedProduct(null)
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

  openEditProduct(){
    const dialogRef = this.dialog.open(NewProductDialogComponent,
      {data: {title: "Editar producto", description: this.selectedProduct?.description},}
    );

    dialogRef.afterClosed().subscribe((result: INewProduct) => {
      if(result && this.selectedProduct){
        this.productsSvc.editProduct(this.selectedProduct._id , result.description, result.token).subscribe({
          next: (product: IProduct) => {
            this.toastSvc.success("Producto editado con éxito","Producto editado ok")
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
        , {data: {title: "Nuevo registro de precio"},}
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

  openEditQuoteDialog(){

    const quoteSelected = this.selection.selected[0]

    if(!quoteSelected) return

    const dialogRef = this.dialog.open(NewQuoteDialogComponent, {
      data: {
        title: "Editar registro de precio",
        quoteToEdit: {
          proveedor: quoteSelected.proveedor,
          precio: quoteSelected.precio,
          descuento1: quoteSelected.descuento1,
          descuento2: quoteSelected.descuento2,
          plazo: quoteSelected.plazo,
          iva: quoteSelected.iva,
          marca: quoteSelected.marca,
          stock: quoteSelected.stock,
          observacion: quoteSelected.observacion,
        }
      }
    }
    );

    dialogRef.afterClosed().subscribe((result: {newQuote: INewQuote, token: string}) => {
      if(result && this.selection.selected){
        this.quotesSvc.updateQuote(this.selection.selected[0]._id, result.newQuote, result.token).subscribe({
          next: (updatedQuote) => {
            this.toastSvc.success("Registro editado con éxito","Registro editado ok")
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

  openAskYoNDeleteQuotesDialog(){
    const dialogRef = this.dialog.open(AskYNDialogComponent
      ,{data: {title: "Eliminar", question: "¿Desea eliminar los registros seleccionados?"}}
    );

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if(result){
        this.deleteSelectedQuotes();
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

  loadingSvc = inject(SpinnerService);

  updateStock(quoteId: string, stockStatus: boolean){
    if(quoteId && this.user){
      this.quotesSvc.updateStock(quoteId, !stockStatus, this.user.token).subscribe({
        next: () => {
          this.toastSvc.success("El estado se actualizó correctamente","Actualización de estado de stock");
          if(this.user && this.selectedProduct){
            this.getQuotes(this.selectedProduct,this.user.token)
          }
        }
      })
    }
  }

  openAskYoNDeleteProductDialog(){
    const dialogRef = this.dialog.open(AskYNDialogComponent
      ,{data: {title: "Eliminar", question: "¿Desea eliminar el producto seleccionado y todos sus registros de precio?"}}
    );

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if(result){
        this.deleteProductsWithQuotes();
      }
    })
  }



  deleteProductsWithQuotes(){
    if(this.selectedProduct && this.user){
      this.productsSvc.deleteProduct(this.selectedProduct._id, this.user.token).subscribe({
        next: () => {
          this.toastSvc.success("Se ha eliminado el producto y sus registros de precios","Eliminación Ok");
          if(this.user){
            this.getProducts(this.user?.token)
          }
          this.productControl.setValue(null); //Se resetea el buscador
          this.productsSvc.setSelectedProduct(null); //se resetea el producto seleccionado
        }
      })
    }
  }
}

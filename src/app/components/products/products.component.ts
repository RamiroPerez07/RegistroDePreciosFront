import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete"
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from "@angular/material/input";
import { IProduct } from '../../interfaces/products.interface';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, PercentPipe } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { QuotesService } from '../../services/quotes.service';
import { IQuoteWithUsername } from '../../interfaces/quotes.interface';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon'
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [MatAutocompleteModule,MatButtonModule, MatIconModule, CurrencyPipe, PercentPipe, MatTooltipModule, MatFormFieldModule, NgClass, ReactiveFormsModule, FormsModule, MatTableModule, MatSortModule, AsyncPipe, MatInputModule, DatePipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['createdAt','proveedor', 'precio', 'iva', 'precioFinal', 'marca', 'stock'];
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


  ngOnInit() {

    this.authSvc.$user.subscribe({
      next: (user: IUser | null) => {
        this.user = user;
        if(user){
          this.getProducts(user.token)
        }
      }
    })

  }

  getProducts(token: string){
    this.productsSvc.getProducts(token).subscribe({
      next: (products: IProduct[]) => {
        this.options = products;
        this.configureProductsListener()
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

  

  onOptionSelected(event: MatAutocompleteSelectedEvent){
    const selectedProduct : IProduct = event.option.value;

    const token = this.user?.token

    if(token){
      this.quotesSvc.getQuotesByProductId(selectedProduct._id,token).subscribe({
        next: (quotes: IQuoteWithUsername[]) => {
          this.quotes = quotes;
          this.dataSource.data = this.quotes;
        }
      });
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
}

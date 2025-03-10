import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
export class NewQuoteDialogComponent {

  readonly dialogRef = inject(MatDialogRef<NewQuoteDialogComponent>);

  newQuoteGroupControl = new FormGroup({
      proveedorControl: new FormControl<string>("", [Validators.required]),
      precioControl : new FormControl<null>(null, [Validators.required, Validators.min(0)]),
      ivaControl : new FormControl<number>(0, [Validators.required]),
      marcaControl : new FormControl<string>(""), 
      stockControl : new FormControl<boolean>(true)
    })

  onConfirm(){

  }

  onNoClick(){
    this.dialogRef.close(null);
  }

}

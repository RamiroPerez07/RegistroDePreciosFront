import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-ask-y-n-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule
  ],
  templateUrl: './ask-y-n-dialog.component.html',
  styleUrl: './ask-y-n-dialog.component.css'
})
export class AskYNDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AskYNDialogComponent>);
  readonly data = inject<{title:string, question: string}>(MAT_DIALOG_DATA);
}

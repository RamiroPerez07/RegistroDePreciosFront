import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskYNDialogComponent } from './ask-y-n-dialog.component';

describe('AskYNDialogComponent', () => {
  let component: AskYNDialogComponent;
  let fixture: ComponentFixture<AskYNDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskYNDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AskYNDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

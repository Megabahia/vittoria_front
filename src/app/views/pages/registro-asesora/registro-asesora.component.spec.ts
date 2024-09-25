import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAsesoraComponent } from './registro-asesora.component';

describe('RegistroAsesoraComponent', () => {
  let component: RegistroAsesoraComponent;
  let fixture: ComponentFixture<RegistroAsesoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroAsesoraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAsesoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

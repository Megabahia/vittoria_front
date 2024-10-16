import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAsesoresComponent } from './registro-asesores.component';

describe('RegistroAsesoraComponent', () => {
  let component: RegistroAsesoresComponent;
  let fixture: ComponentFixture<RegistroAsesoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroAsesoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAsesoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

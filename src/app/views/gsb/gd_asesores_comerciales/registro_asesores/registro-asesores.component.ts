import {Component, OnInit} from '@angular/core';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AsesoresService} from "../../../../services/admin/asesores.service";
import {Toaster} from "ngx-toast-notifications";

@Component({
  selector: 'app-registro-asesores',
  templateUrl: './registro-asesores.component.html',
})
export class GdRegistroAsesoresComponent implements OnInit {

  public asesorForm: FormGroup;

  pais = 'Ecuador';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  captcha: boolean;
  siteKey: string;
  submitted = false;
  mostrarContenidoPantalla = true;
  generos = [
    {
      nombre: 'Masculino'
    },
    {
      nombre: 'Femenino'
    },
    {
      nombre: 'Prefiero no decirlo'
    },
  ];

  constructor(
    private paramServiceAdm: ParamServiceAdm,
    private formBuilder: FormBuilder,
    private asesorService: AsesoresService,
    private toaster: Toaster,
  ) {
    this.iniciarAsesor();
  }

  ngOnInit(): void {
    this.obtenerProvincias();
  }

  get notaAsesorForm() {
    return this.asesorForm['controls'];
  }

  captchaValidado(evento): void {
    this.captcha = true;
  }

  iniciarAsesor(): void {
    this.asesorForm = this.formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      estado: ['Registrado'],
      fecha_nacimiento: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pais: [this.pais, [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      whatsapp: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      gender: ['', [Validators.required]]
    });
  }

  guardarAsesor(): void {
    this.submitted = true;
    if (this.asesorForm.invalid) {
      this.toaster.open('Completrar los campos', {type: 'danger'});
      return;
    }
    this.asesorForm.get('fecha_nacimiento').setValue(this.transforarFechaNacimiento(this.asesorForm.value.fecha_nacimiento));

    this.asesorService.insertarAsesor(this.asesorForm.value).subscribe((info) => {
      this.toaster.open('Asesor/a registrado/a', {type: 'success'});
      this.iniciarAsesor();
    }, error => this.toaster.open('El correo ya existe', {type: 'danger'}));

  }


  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.asesorForm.value.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerFechaActual(): Date {
    const fechaActual = new Date();
    return fechaActual;
  }

  transforarFechaNacimiento(fechaSeleccionada): Date {
    return new Date(fechaSeleccionada);
  }

  validarEdad(): void {
    const hoy = new Date();
    const fechaNacimiento = new Date(this.asesorForm.value.fecha_nacimiento);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    if (edad < 18) {
      this.toaster.open('Debe tener o ser mayor a 18 años', {type: 'danger'});
      this.asesorForm.get('fecha_nacimiento').setValue('');
    }
  }
}

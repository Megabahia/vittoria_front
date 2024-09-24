import {Component, OnInit} from '@angular/core';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';
import {environment} from "../../../../environments/environment";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AsesoresService} from "../../../services/admin/asesores.service";
import {Toaster} from "ngx-toast-notifications";

@Component({
  selector: 'app-registro-asesora',
  templateUrl: './registro-asesora.component.html',
  styleUrls: ['./registro-asesora.component.css']
})
export class RegistroAsesoraComponent implements OnInit {

  public asesorForm: FormGroup;

  pais = 'Ecuador';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  captcha: boolean;
  siteKey: string;
  submitted = false;
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
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }

    this.siteKey = environment.setKey;
    this.captcha = false;

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
    if (this.captcha) {
      if (this.asesorForm.invalid) {
        this.toaster.open('Registro incompleto', {type: 'danger'});
        return;
      }

      this.asesorForm.get('fecha_nacimiento').setValue(this.transforarFechaNacimiento(this.asesorForm.value.fecha_nacimiento))

      this.asesorService.insertarAsesor(this.asesorForm.value).subscribe((info) => {
        this.toaster.open('Asesora registrada', {type: 'success'});
      }, error => this.toaster.open(error, {type: 'danger'}));
    }
  }

  irInicio() {
    window.open('#/admin/management');
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
}

import {Component, OnInit} from '@angular/core';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';
import {environment} from "../../../../environments/environment";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AsesoresService} from "../../../services/admin/asesores.service";
import {Toaster} from "ngx-toast-notifications";

@Component({
  selector: 'app-registro-asesores',
  templateUrl: './registro-asesores.component.html',
  styleUrls: ['./registro-asesores.component.css']
})
export class RegistroAsesoresComponent implements OnInit {

  public asesorForm: FormGroup;
  mostrarSpinner = false;

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
        this.toaster.open('Completrar los campos', {type: 'danger'});
        return;
      }
      this.asesorForm.get('fecha_nacimiento').setValue(this.transforarFechaNacimiento(this.asesorForm.value.fecha_nacimiento));
      this.mostrarSpinner = true;

      this.asesorService.insertarAsesor(this.asesorForm.value).subscribe((info) => {
        this.toaster.open('Asesor/a registrado/a', {type: 'success'});
        this.mostrarContenidoPantalla = false;
        this.mostrarSpinner = false;

      }, error => {
        this.mostrarSpinner = false;
        this.toaster.open('El correo ya existe', {type: 'danger'});
      });
    }
  }

  //irInicio() {
   // window.open('https://contraentrega.megadescuento.com');
    //this.mostrarContenidoPantalla = true;
    //this.iniciarAsesor();
  //}

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

  openWhatsApp(event: Event): void {
    event.preventDefault();
    const numero = '0998541076';
    const modifiedNumber = (numero.startsWith('0') ? numero.substring(1) : numero);
    const internationalNumber = '593' + modifiedNumber;
    //const imageUrl = encodeURIComponent(imagen);  // URL de la imagen que deseas enviar
    const whatsappUrl = `https://web.whatsapp.com/send/?phone=${internationalNumber}`;
    window.open(whatsappUrl, '_blank');  // Abrir WhatsApp en una nueva pestaña
  }
}

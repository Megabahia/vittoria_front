import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GuiasService} from '../../../services/servientrega/guias/guias.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-guia-sticker',
  templateUrl: './guia-sticker.component.html',
  styleUrls: ['./guia-sticker.component.css']
})
export class GuiaStickerComponent implements OnInit {
  submitted = false;
  public reactiveGuideForm: FormGroup;
  public data: {
    guia: string
    mensaje: string
    archivoEncriptado: string
  };
  mostrarSpinner = false;

  constructor(
    private formBuilder: FormBuilder,
    private guiasService: GuiasService,
    private toaster: Toaster,
  ) {
    this.reactiveGuideForm = this.formBuilder.group({
      num_guia: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  get reactiveForm(): any {
    return this.reactiveGuideForm.controls;
  }

  generarGuia(): void {
    this.submitted = true;

    if (this.reactiveGuideForm.invalid) {
      return;
    }
    this.mostrarSpinner = true;
    this.guiasService.generarGuiaFormatoSticker(this.reactiveGuideForm.value.num_guia).subscribe((info) => {
      this.data = info;
      const config: {} = this.data.guia ? {type: 'success'} : {type: 'warning'};
      this.toaster.open(`${this.data.mensaje}`, config);
      this.getImage(this.data.archivoEncriptado);
      this.mostrarSpinner = false;
    }, error => {
      this.mostrarSpinner = false;
    });
  }

  getImage(fileBase64: string): void {
    const blob = this.base64ToBlob(fileBase64, 'application/pdf');
    const downloadLink = document.createElement('a');

    // Crear un enlace de descarga y agregarlo al cuerpo del documento
    document.body.appendChild(downloadLink);

    // Configurar el enlace de descarga
    const url = window.URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'GENERACION_DE_GUIA_FORMATO_STICKER.pdf';

    // Simular un clic en el enlace de descarga
    downloadLink.click();

    // Liberar el objeto URL creado
    window.URL.revokeObjectURL(url);

    // Eliminar el enlace de descarga del cuerpo del documento
    document.body.removeChild(downloadLink);
  }

  private base64ToBlob(b64Data: string, contentType: string = ''): Blob {
    contentType = contentType || '';
    const sliceSize = 512;

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }

}


import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GuiasService} from '../../../services/servientrega/guias/guias.service';

@Component({
  selector: 'app-guia-rotulos-formato-pdf',
  templateUrl: './guia-rotulos-formato-pdf.component.html',
  styleUrls: ['./guia-rotulos-formato-pdf.component.css']
})
export class GuiaRotulosFormatoPdfComponent implements OnInit {
  submitted = false;
  public reactiveGuideForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private guiasService: GuiasService,
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
    const data = [
      this.reactiveGuideForm.value.num_guia,
      'usuario',
      'password',
    ];
    console.log(data);
    alert('Se envia a la api');

    this.guiasService.generarGuiaFormatoSticker(data).subscribe(() => {
      alert('Se guardo');
    });
  }

}

import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InformacoesColaboradorService } from '../../services/informacoes-colaborador.service';
import { CorpoBusca } from '../../services/models/corpo-busca';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-busca-colaboradores',
  templateUrl: './busca-colaboradores.component.html',
  styleUrls: ['./busca-colaboradores.component.css'],
  standalone: true,
  imports: [
    CardModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputSwitchModule,
    CalendarModule,
    MessagesModule,
    ToastModule,
    RippleModule,
    InputNumberModule,
    InputTextareaModule,
  ],
})
export class BuscaColaboradoresComponent implements OnInit {
  @Output()
  enviarSolicitacao: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private messageService: MessageService) {}

  desabilitar = false;
  valorPorcentagem1 = 0;
  textoPorcentagem1 = '';
  valorPorcentagem2 = 0;
  textoPorcentagem2 = '';
  valorPorcentagem3 = 0;
  textoPorcentagem3 = '';

  formDadosSolicitacao: FormGroup;

  ngOnInit(): void {}

  desabilitarFormulario(desabilitar: boolean): void {
    this.desabilitar = desabilitar;
  }

  limparFormulario(): void {
    this.desabilitar = false;
    this.valorPorcentagem1 = 0;
  }

  notificarErro(mensagem: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: mensagem,
      life: 10000,
    });
  }

  validarEnvio(): boolean {
    if (!this.valorPorcentagem1) this.notificarErro('Selecione um colaborador');
    return !!this.valorPorcentagem1;
  }

  enviar(): void {
    if (this.validarEnvio()) this.enviarSolicitacao.emit(true);
  }
}

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
import { Alerta } from '../../services/models/alerta';

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
export class BuscaColaboradoresComponent {
  @Output()
  enviarSolicitacao: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private messageService: MessageService) {}

  desabilitar = true;

  formDadosSolicitacao: FormGroup;
  listaAlertas: Alerta[] = [];

  preencherDadosAlertaCadastrado(alertas: Alerta[]): void {
    if (alertas) {
      this.listaAlertas = alertas;

      this.desabilitarFormulario(false);
    }
  }

  desabilitarFormulario(desabilitar: boolean): void {
    this.desabilitar = desabilitar;
  }

  limparFormulario(): void {
    this.desabilitar = false;
    this.listaAlertas = [];
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
    if (this.verificarPorcentagensDuplicadas())
      this.notificarErro(
        'Existem porcentagens duplicadas nos alertas cadastrados. Por favor, verifique.'
      );
    return !this.verificarPorcentagensDuplicadas();
  }

  verificarPorcentagensDuplicadas(): boolean {
    const porcentagens = this.listaAlertas.map((a) => a.porcentagem);
    const setPorcentagens = new Set(porcentagens);
    return setPorcentagens.size !== porcentagens.length;
  }

  enviar(): void {
    if (this.validarEnvio()) this.enviarSolicitacao.emit(true);
  }

  excluirLinha(index: number): void {
    this.listaAlertas.splice(index, 1);
  }

  adicionaLinha(): void {
    this.listaAlertas.push(this.montaAlertaVazio());
  }

  montaAlertaVazio(): Alerta {
    return {
      porcentagem: 0,
      mensagem: '',
    };
  }

  montaCorpoEnvio(): Alerta[] {
    return this.listaAlertas;
  }
}

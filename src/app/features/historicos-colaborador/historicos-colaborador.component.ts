import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { InformacoesColaboradorService } from './services/informacoes-colaborador.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Persistencia } from './services/models/persistencia';
import { BuscaColaboradoresComponent } from './components/busca-colaboradores/busca-colaboradores.component';
import { format } from 'date-fns';
import { Alerta } from './services/models/alerta';

@Component({
  selector: 'app-historicos-colaborador',
  standalone: true,
  imports: [
    FormsModule,
    BuscaColaboradoresComponent,
    LoadingComponent,
    CalendarModule,
    ToastModule,
    ProgressSpinnerModule,
    RippleModule,
  ],
  providers: [MessageService],
  templateUrl: './historicos-colaborador.component.html',
  styleUrl: './historicos-colaborador.component.css',
})
export class HistoricosColaboradorComponent implements OnInit, AfterViewInit {
  @ViewChild(BuscaColaboradoresComponent, { static: true })
  buscaColaboradoresComponent: BuscaColaboradoresComponent | undefined;

  private informacoesColaboradorService = inject(InformacoesColaboradorService);

  carregandoInformacoes = signal(false);
  listaAlertas: Alerta[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.carregandoInformacoes.set(true);
    this.inicializaComponente();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.buscaAletraCadastrado();
    this.preencherDadosAlertaCadastrado();
    this.carregandoInformacoes.set(false);
  }

  inicializaComponente(): void {
    this.buscaColaboradoresComponent.limparFormulario();
  }

  preencherDadosAlertaCadastrado(): void {
    this.buscaColaboradoresComponent.preencherDadosAlertaCadastrado(
      this.listaAlertas
    );
  }

  async buscaAletraCadastrado(): Promise<void> {
    try {
      const projetos = await firstValueFrom(
        this.informacoesColaboradorService.obterAlertaCadastrado()
      );
      if (projetos.outputData.message) {
        this.notificarErro(
          'Erro ao buscar os alertas já cadastrados, ' +
            projetos.outputData.message
        );
        this.listaAlertas = projetos.outputData.alertas || [
          this.montaAlertaVazio(),
        ];
      } else {
        this.listaAlertas = projetos.outputData.alertas || [
          this.montaAlertaVazio(),
        ];
      }
    } catch (error) {
      console.error(error);
      this.notificarErro(
        'Erro ao buscar os alertas já cadastrados, tente mais tarde ou contate o admnistrador. ' +
          error
      );
      this.carregandoInformacoes.set(false);
    }
  }

  notificarErro(mensagem: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: mensagem,
      life: 10000,
    });
  }
  notificarSucesso(mensagem: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: mensagem,
      life: 10000,
    });
  }

  montaAlertaVazio(): Alerta {
    return {
      porcentagem: 0,
      mensagem: '',
    };
  }

  async enviarSolicitacao(): Promise<void> {
    this.desabilitarFormulario(true);
    this.carregandoInformacoes.set(true);
    await this.gravarEnvio();
  }

  desabilitarFormulario(desabilitar: boolean): void {
    this.buscaColaboradoresComponent.desabilitarFormulario(desabilitar);
  }

  async gravarEnvio(): Promise<void> {
    await lastValueFrom(
      this.informacoesColaboradorService.gravarEnvio(this.montaCorpoEnvio())
    ).then(
      (data) => {
        if (data.outputData.message || data.outputData.retorno != 'OK') {
          this.notificarErro(
            'Erro ao gravar a data retroativa, ' +
              (data.outputData?.message || data.outputData?.retorno)
          );
          this.carregandoInformacoes.set(false);
          this.desabilitarFormulario(false);
        } else {
          this.notificarSucesso('Gravado com sucesso!');
          this.inicializaComponente();
          this.carregandoInformacoes.set(false);
          this.desabilitarFormulario(false);
        }
      },
      () => {
        this.notificarErro(
          'Erro ao gravar a data retroativa, tente mais tarde ou contate o administrador'
        );
        this.carregandoInformacoes.set(false);
        this.desabilitarFormulario(false);
      }
    );
  }

  formatarData(data: Date): string {
    return format(data, 'dd/MM/yyyy');
  }

  montaCorpoEnvio(): Alerta[] {
    return this.buscaColaboradoresComponent.montaCorpoEnvio();
  }
}

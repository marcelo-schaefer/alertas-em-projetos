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
import { format } from 'date-fns';
import { Alerta } from './services/models/alerta';
import { CadastroAlertaComponent } from './components/cadastro-alerta/cadastro-alerta.component';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-historicos-colaborador',
  standalone: true,
  imports: [
    FormsModule,
    CadastroAlertaComponent,
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
  @ViewChild(CadastroAlertaComponent, { static: true })
  cadastroAlertaComponent: CadastroAlertaComponent | undefined;

  private informacoesColaboradorService = inject(InformacoesColaboradorService);
  private tokenService = inject(TokenService);

  carregandoInformacoes = signal(false);
  listaAlertas: Alerta[] = [];

  constructor(private messageService: MessageService) {}

  async ngOnInit(): Promise<void> {
    this.carregandoInformacoes.set(true);
    await this.checkInicializacao();
    this.inicializaComponente();
  }

  async inicializaComponente(): Promise<void> {
    this.cadastroAlertaComponent.limparFormulario();
    await this.buscaAletraCadastrado();
    this.preencherDadosAlertaCadastrado();
    this.carregandoInformacoes.set(false);
    this.desabilitarFormulario(false);
  }

  async checkInicializacao(): Promise<void> {
    while (
      !this.tokenService.token$.value?.accessToken ||
      !this.tokenService.username
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.tokenService.carregarToken();
    }
  }

  preencherDadosAlertaCadastrado(): void {
    this.cadastroAlertaComponent.preencherDadosAlertaCadastrado(
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
      } else {
        if (!Array.isArray(projetos.outputData.alertas))
          projetos.outputData.alertas = [projetos.outputData.alertas];
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
    this.cadastroAlertaComponent.desabilitarFormulario(desabilitar);
  }

  async gravarEnvio(): Promise<void> {
    await lastValueFrom(
      this.informacoesColaboradorService.gravarEnvio(this.montaCorpoEnvio())
    ).then(
      (data) => {
        if (data.outputData.message || data.outputData.retorno != 'OK') {
          this.notificarErro(
            'Erro ao gravar os alertas, ' +
              (data.outputData?.message || data.outputData?.retorno)
          );
          this.carregandoInformacoes.set(false);
          this.desabilitarFormulario(false);
        } else {
          this.notificarSucesso('Gravado com sucesso!');
          this.inicializaComponente();
        }
      },
      () => {
        this.notificarErro(
          'Erro ao gravar os alertas, tente mais tarde ou contate o administrador'
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
    return this.cadastroAlertaComponent.montaCorpoEnvio();
  }
}

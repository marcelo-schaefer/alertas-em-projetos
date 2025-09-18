import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { BehaviorSubject, firstValueFrom, from, Observable, of } from 'rxjs';
import {
  debounceTime,
  filter,
  distinctUntilChanged,
  switchMap,
  take,
} from 'rxjs/operators';
import {
  FormGroup,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InformacoesColaboradorService } from '../../services/informacoes-colaborador.service';
import {
  Colaborador,
  RetornoColaborador,
} from '../../services/models/colaborador.model';
import { CorpoBusca } from '../../services/models/corpo-busca';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

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
  ],
})
export class BuscaColaboradoresComponent implements OnInit {
  @Output()
  enviarSolicitacao: EventEmitter<boolean> = new EventEmitter<boolean>();

  private informacoesColaboradorService = inject(InformacoesColaboradorService);

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  searchChange$ = new BehaviorSubject('');
  desabilitar = false;
  isLoadingColaboradores = false;
  inicializando = false;
  isEndColaboradores = false;
  colaboradoresDesabilitados = false;
  search = '';
  top = 100;
  skip = 0;
  colaborador: Colaborador;
  colaboradorSelecionado: Colaborador;
  colaboradorAnterior: Colaborador;
  colaboradores: Colaborador[] = [];
  dataRetrotiva: Date;
  maxDate = new Date();
  papelAdm: string;

  formDadosSolicitacao: FormGroup;

  ngOnInit(): void {
    this.searchChange$
      .asObservable()
      .pipe(
        debounceTime(500),
        filter((query) => query.length >= 2 || query.length === 0),
        distinctUntilChanged(),
        switchMap((query) =>
          query
            ? from(this.searchLoadColaboradores(query))
            : from(of({ outputData: { colaboradores: this.colaboradores } }))
        )
      )
      .subscribe((colaboradores: RetornoColaborador) => {
        if (
          colaboradores.outputData.colaboradores &&
          !Array.isArray(colaboradores.outputData.colaboradores)
        )
          colaboradores.outputData.colaboradores = [
            colaboradores.outputData.colaboradores,
          ];
        this.colaboradores = colaboradores.outputData.colaboradores || [];
        this.isLoadingColaboradores = false;
      });

    this.buildForm();
  }

  preenchePapelSolicitante(papelAdm: string): void {
    this.papelAdm = papelAdm || 'N';
  }

  limparFormulario(): void {
    if (
      this.formDadosSolicitacao &&
      this.formDadosSolicitacao.get('colaboradorSelecionado')
    )
      this.formDadosSolicitacao.get('colaboradorSelecionado').setValue(null);
  }

  inicializarListaColaboradores(colaboradores: Colaborador[]): void {
    this.colaboradores = colaboradores;
    this.skip += this.top;
  }

  buildForm(): void {
    this.formDadosSolicitacao = this.fb.group({
      colaboradorSelecionado: null,
      colaboradoresArray: this.fb.array([]),
    });
  }

  selecionaColaborador(event: DropdownChangeEvent): void {
    const colaborador = event.value;
    if (colaborador) {
      if (this.colaborador === undefined) {
        this.colaborador = colaborador;
      } else {
        this.colaboradorAnterior = this.colaborador;
        this.colaborador = colaborador;
      }
    }
  }

  searchLoadColaboradores(search: string): Observable<RetornoColaborador> {
    this.isLoadingColaboradores = true;
    this.cleanSelect();
    this.search = search;
    return this.loadColaboradores();
  }

  cleanSelect(): void {
    this.colaboradores = [];
    this.top = 100;
    this.skip = 0;
    this.isEndColaboradores = false;
  }

  loadColaboradores(): Observable<RetornoColaborador> {
    if (!this.isEndColaboradores) {
      this.isLoadingColaboradores = true;
      const search: CorpoBusca = {
        nTop: this.top,
        nSkip: this.skip,
        aQuery: this.search,
        aPapelAdm: this.papelAdm,
      };
      const colaboradores =
        this.informacoesColaboradorService.obterListaColaboradores(search);

      this.skip += this.top;
      return colaboradores;
    }
    return of(new RetornoColaborador());
  }

  onSearch(event: any): void {
    this.searchChange$.next(event.target.value);
  }

  onScrollToBottom(): void {
    if (!this.isEndColaboradores) {
      this.loadColaboradores()
        .pipe(take(1))
        .subscribe((colaboradores) => {
          if (
            colaboradores &&
            colaboradores.outputData.colaboradores.length < this.top
          ) {
            this.isEndColaboradores = true;
          }

          this.colaboradores = this.colaboradores.concat(
            colaboradores.outputData.colaboradores
          );
          this.isLoadingColaboradores = false;
        });
    }
  }

  opcoesIniciais(): void {
    this.isLoadingColaboradores = true;
    const colaboradores = firstValueFrom(this.loadColaboradores());

    colaboradores.then((colaboradores) => {
      if (!Array.isArray(colaboradores.outputData.colaboradores)) {
        colaboradores.outputData.colaboradores = [
          colaboradores.outputData.colaboradores,
        ];
      }
      if (
        colaboradores &&
        colaboradores.outputData.colaboradores.length < this.top
      ) {
        this.isEndColaboradores = true;
      }

      this.colaboradores = this.colaboradores.concat(
        colaboradores.outputData.colaboradores
      );
      this.isLoadingColaboradores = false;
    });
  }

  getOptionLabel(): string {
    return `${this.colaborador?.NMatricula} - ${this.colaborador?.ANome}`;
  }

  compareColaborador(c1: Colaborador, c2: Colaborador): boolean {
    return c1 && c2
      ? c1.NMatricula === c2.NMatricula &&
          c1.NTipoColaborador === c2.NTipoColaborador &&
          c1.NEmpresa === c2.NEmpresa
      : c1 === c2;
  }

  desabilitarFormulario(desabilitar: boolean): void {
    this.desabilitar = desabilitar;
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
    if (!this.colaborador) this.notificarErro('Selecione um colaborador');
    if (!this.dataRetrotiva)
      this.notificarErro('Selecione uma data retroativa');
    return !!this.colaborador && !!this.dataRetrotiva;
  }

  enviar(): void {
    if (this.validarEnvio()) this.enviarSolicitacao.emit(true);
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Colaborador,
  RetornoColaborador,
  RetornoPapelColaborador,
} from './models/colaborador.model';
import { RetornoGravacao } from './models/retorno-gravacao';
import { Persistencia } from './models/persistencia';
import { CorpoBusca } from './models/corpo-busca';

@Injectable({
  providedIn: 'root',
})
export class InformacoesColaboradorService {
  private readonly basePayload = {
    id: 'f2200c3b-c7df-4040-9613-34f697b75889',
    inputData: {
      encryption: '3',
      server: 'https://ocweb03s1p.seniorcloud.com.br:31061/',
      module: 'rubi',
      service: 'com.senior.g5.rh.fp.apontamentoRetroativo',
      port: '',
      user: '',
      password: '',
      rootObject: '',
    },
  };

  private http = inject(HttpClient);

  public obterPapelSolicitante(
    aNomeUsuario: string
  ): Observable<RetornoPapelColaborador> {
    return this.http.post<RetornoPapelColaborador>(environment.plugin.invoke, {
      ...this.basePayload,
      inputData: {
        ...this.basePayload.inputData,
        port: 'verificaPapelSolicitante',
        aNomeUsuario,
      },
    });
  }

  public obterListaColaboradores(
    body: CorpoBusca
  ): Observable<RetornoColaborador> {
    return this.http.post<RetornoColaborador>(environment.plugin.invoke, {
      ...this.basePayload,
      inputData: {
        ...this.basePayload.inputData,
        port: 'buscaColaboradores',
        ...body,
      },
    });
  }

  public gravarEnvio(body: Persistencia): Observable<RetornoGravacao> {
    return this.http.post<RetornoGravacao>(environment.plugin.invoke, {
      ...this.basePayload,
      inputData: {
        ...this.basePayload.inputData,
        ...body,
        port: 'persistirDatas',
      },
    });
  }
}

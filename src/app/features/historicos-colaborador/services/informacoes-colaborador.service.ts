import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Colaborador,
  RetornoColaborador,
  RetornoPapelColaborador,
} from './models/colaborador.model';
import { RetornoGravacao } from './models/retorno-gravacao';
import { Persistencia } from './models/persistencia';
import { CorpoBusca } from './models/corpo-busca';
import { TokenService } from '../../../core/services/token.service';
import { Alerta, RetornoAlerta } from './models/alerta';

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
      service: 'com.senior.g5.rh.fp.alertaProjeto',
      port: '',
      user: '',
      password: '',
      rootObject: '',
    },
  };

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  public obterAlertaCadastrado(): Observable<RetornoAlerta> {
    return this.http
      .post<RetornoAlerta>(environment.plugin.invoke, {
        ...this.basePayload,
        inputData: {
          ...this.basePayload.inputData,
          port: 'buscaAlerta',
        },
      })
      .pipe(
        catchError((error) => {
          return of({
            outputData: {
              message: error.message || error.toString(),
              alertas: [{ porcentagem: 0, mensagem: '' }],
            },
          });
        })
      );
  }

  public gravarEnvio(body: Alerta[]): Observable<RetornoGravacao> {
    return this.http
      .post<RetornoGravacao>(environment.plugin.invoke, {
        ...this.basePayload,
        inputData: {
          ...this.basePayload.inputData,
          alertas: body,
          port: 'persistirAlertas',
        },
      })
      .pipe(
        catchError((error) => {
          return of({
            outputData: {
              retorno: error.message || error.toString(),
              message: error.message || error.toString(),
            },
          });
        })
      );
  }
}

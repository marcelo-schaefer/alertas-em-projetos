export interface Colaborador {
  NEmpresa: string;
  NTipoColaborador: string;
  NMatricula: string;
  ANome: string;
}

export class RetornoColaborador {
  outputData: {
    colaboradores: Colaborador[];
    ARetorno?: string;
    message?: string;
  };

  constructor() {
    this.outputData = { colaboradores: [] };
  }
}

export class RetornoPapelColaborador {
  outputData: {
    APapelAdmAgendaEquipe: string;
    ARetorno?: string;
    message?: string;
  };
}

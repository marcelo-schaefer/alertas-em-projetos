export interface Alerta {
  porcentagem: number;
  mensagem: string;
}

export interface RetornoAlerta {
  outputData: {
    alertas: Alerta[];
    message?: string;
  };
}

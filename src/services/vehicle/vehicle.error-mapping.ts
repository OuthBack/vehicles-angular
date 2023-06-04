type ErrorMapping = {
  default: string;
  statusCode: {
    [key: number]: {
      [key: string]: string;
    };
  };
};

export const errorMapping: ErrorMapping = {
  default: 'Ocorreu um erro. Tente novamente mais tarde.',
  statusCode: {
    400: {
      'Invalid query parameters. Check the page and limit parameters.':
        'Não foi possível carregar os veículos. Tente novamente mais tarde.',
      'Vehicle already exists.': 'Veículo já cadastrado.',
      'Invalid url parameter. Check plate parameter.':
        'Placa do veículo não encontrada.',
      'Vehicle not found.': 'Placa do veículo não encontrada.',
    },
    500: {
      'An error occurred in our server.':
        'Ocorrereu um erro no servidor. Tente novamente mais tarde.',
    },
  },
};

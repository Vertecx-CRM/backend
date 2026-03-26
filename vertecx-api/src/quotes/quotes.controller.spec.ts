import { QuotesController } from './quotes.controller';

describe('QuotesController', () => {
  let controller: QuotesController;
  let quotesService: {
    acceptForClient: jest.Mock;
  };

  beforeEach(() => {
    quotesService = {
      acceptForClient: jest.fn().mockResolvedValue({ quotesid: 8 }),
    };

    controller = new QuotesController(quotesService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates client acceptance to the service', async () => {
    const req = { user: { userid: 44, rolename: 'Cliente' } };

    const result = await controller.acceptClient(
      req as any,
      8,
      'Aceptada por el cliente',
    );

    expect(quotesService.acceptForClient).toHaveBeenCalledWith(
      req.user,
      8,
      'Aceptada por el cliente',
    );
    expect(result).toEqual({ quotesid: 8 });
  });
});

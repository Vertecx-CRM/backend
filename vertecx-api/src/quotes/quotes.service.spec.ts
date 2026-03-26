import { QuotesService } from './quotes.service';

const createRepoMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('QuotesService', () => {
  const originalMailUser = process.env.MAIL_USER;

  let service: QuotesService;
  let quotesRepo: ReturnType<typeof createRepoMock>;
  let mailService: {
    sendQuoteAccepted: jest.Mock;
    sendQuoteCreated: jest.Mock;
  };

  beforeEach(() => {
    process.env.MAIL_USER = 'admin@example.com';

    quotesRepo = createRepoMock();
    mailService = {
      sendQuoteAccepted: jest.fn().mockResolvedValue(undefined),
      sendQuoteCreated: jest.fn().mockResolvedValue(undefined),
    };

    service = new QuotesService(
      quotesRepo as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      { create: jest.fn() } as any,
      mailService as any,
    );
  });

  afterAll(() => {
    process.env.MAIL_USER = originalMailUser;
  });

  it('aprueba la cotizacion cuando el cliente la acepta y notifica al admin', async () => {
    const user = { rolename: 'Cliente', userid: 77 };
    const quoteBeforeAccept = {
      quotesid: 10,
      statesid: 5,
      observation: 'Cotizacion lista para continuar',
    };
    const acceptedQuote = {
      quotesid: 10,
      statesid: 3,
      clientAccepted: true,
      clientAcceptedAt: '2026-03-26T14:15:00.000Z',
      observation: 'Podemos continuar',
      observationPlain: 'Podemos continuar',
      total: 250000,
      serviceRequestId: 55,
      customer: {
        users: {
          name: 'Ana',
          lastname: 'Lopez',
          email: 'ana@example.com',
        },
      },
    };

    jest
      .spyOn(service, 'findOneForUser')
      .mockResolvedValueOnce({ quotesid: 10 } as any)
      .mockResolvedValueOnce(acceptedQuote as any);

    quotesRepo.findOne.mockResolvedValue(quoteBeforeAccept);
    quotesRepo.update.mockResolvedValue({ affected: 1 });

    const result = await service.acceptForClient(
      user,
      10,
      'Podemos continuar',
    );

    expect(quotesRepo.update).toHaveBeenCalledWith(
      { quotesid: 10 },
      expect.objectContaining({
        statesid: 3,
        observation: expect.stringContaining('Podemos continuar'),
        updatedat: expect.any(Date),
      }),
    );
    expect(quotesRepo.update.mock.calls[0][1].observation).toContain(
      '[CLIENT_ACCEPTED=true]',
    );
    expect(mailService.sendQuoteAccepted).toHaveBeenCalledWith(
      'admin@example.com',
      'equipo administrativo',
      acceptedQuote,
      'Ana Lopez',
      'Podemos continuar',
    );
    expect(result).toBe(acceptedQuote);
  });

  it('es idempotente cuando la cotizacion ya fue aceptada y aprobada', async () => {
    const user = { rolename: 'Cliente', userid: 77 };
    const alreadyAcceptedObservation = [
      'Seguimos adelante',
      '[CLIENT_ACCEPTED=true]',
      '[CLIENT_ACCEPTED_AT=2026-03-26T14:15:00.000Z]',
    ].join('\n');
    const acceptedQuote = {
      quotesid: 11,
      statesid: 3,
      clientAccepted: true,
    };

    jest
      .spyOn(service, 'findOneForUser')
      .mockResolvedValueOnce({ quotesid: 11 } as any)
      .mockResolvedValueOnce(acceptedQuote as any);

    quotesRepo.findOne.mockResolvedValue({
      quotesid: 11,
      statesid: 3,
      observation: alreadyAcceptedObservation,
    });

    const result = await service.acceptForClient(user, 11);

    expect(quotesRepo.update).not.toHaveBeenCalled();
    expect(mailService.sendQuoteAccepted).not.toHaveBeenCalled();
    expect(result).toBe(acceptedQuote);
  });
});

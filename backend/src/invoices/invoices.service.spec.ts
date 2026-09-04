import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

const dto: CreateInvoiceDto = {
  invoiceNumber: 'INV-1',
  invoiceDate: '2026-07-03',
  dueDate: '2026-06-03',
  currency: 'AUD',
  customer: { fullname: 'Paul', email: 'paul@101digital.io' },
  item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
};

describe('InvoicesService', () => {
  const prisma = {
    $transaction: jest.fn(),
    invoice: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };
  const service = new InvoicesService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects dueDate before invoiceDate', async () => {
    await expect(service.create(dto, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    try {
      await service.create(dto, 'user-1');
    } catch (error) {
      expect((error as BadRequestException).getResponse()).toEqual({
        message: ['dueDate must be on or after invoiceDate'],
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('maps duplicate invoiceNumber Prisma P2002 to 409', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '6.19.3' },
    );
    prisma.$transaction.mockRejectedValue(p2002);

    const okDto: CreateInvoiceDto = {
      ...dto,
      invoiceDate: '2026-06-03',
      dueDate: '2026-07-03',
    };

    try {
      await service.create(okDto, 'user-1');
      fail('expected ConflictException');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getStatus()).toBe(409);
      expect((error as ConflictException).getResponse()).toEqual({
        message: 'Invoice number already exists',
        error: 'Conflict',
        statusCode: 409,
      });
    }
  });

  function mockEmptyList() {
    prisma.invoice.findMany.mockResolvedValue([]);
    prisma.invoice.count.mockResolvedValue(0);
    prisma.$transaction.mockImplementation((ops: Promise<unknown>[]) =>
      Promise.all(ops),
    );
  }

  it('Draft filter excludes past-due invoices that would display as Overdue', async () => {
    mockEmptyList();
    await service.findAll({ status: 'Draft' });
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'Draft',
          dueDate: { gte: expect.any(Date) },
        },
      }),
    );
  });

  it('Pending filter excludes past-due invoices that would display as Overdue', async () => {
    mockEmptyList();
    await service.findAll({ status: 'Pending' });
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'Pending',
          dueDate: { gte: expect.any(Date) },
        },
      }),
    );
  });

  it('Paid filter does not apply a due-date cutoff', async () => {
    mockEmptyList();
    await service.findAll({ status: 'Paid' });
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'Paid' },
      }),
    );
  });

  it('defaults to newest created first when sortBy is omitted', async () => {
    mockEmptyList();
    await service.findAll({});
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('date range requires invoiceDate and dueDate to fall in range', async () => {
    mockEmptyList();
    await service.findAll({ fromDate: '2026-09-01', toDate: '2026-09-08' });
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              invoiceDate: {
                gte: expect.any(Date),
                lte: expect.any(Date),
              },
              dueDate: {
                gte: expect.any(Date),
                lte: expect.any(Date),
              },
            },
          ],
        },
      }),
    );
  });
});

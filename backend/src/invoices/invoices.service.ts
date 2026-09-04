import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { CURRENCY_SYMBOLS, deriveStatus } from '../common/date.util';
import { calculateInvoiceTotals, round2 } from '../common/money.util';
import { PrismaService } from '../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';

const LIST_SELECT = {
  invoiceId: true,
  invoiceNumber: true,
  customerFullname: true,
  invoiceDate: true,
  dueDate: true,
  totalAmount: true,
  status: true,
} as const;

function toUtcDate(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`);
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function utcToday(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

function money(value: Prisma.Decimal | number): number {
  return Number(value);
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto, createdBy: string) {
    const invoiceDate = toUtcDate(dto.invoiceDate);
    const dueDate = toUtcDate(dto.dueDate);
    if (dueDate < invoiceDate) {
      throw new BadRequestException([
        'dueDate must be on or after invoiceDate',
      ]);
    }

    const tax = dto.tax ?? 10;
    const discount = dto.discount ?? 0;
    const totals = calculateInvoiceTotals({
      quantity: dto.item.quantity,
      rate: dto.item.rate,
      taxPercent: tax,
      discount,
      totalPaid: 0,
    });
    if (discount > round2(totals.subTotal + totals.taxAmount)) {
      throw new BadRequestException([
        'discount must be less than or equal to subTotal + taxAmount',
      ]);
    }

    const currencySymbol = CURRENCY_SYMBOLS[dto.currency];

    try {
      const created = await this.prisma.$transaction((tx) =>
        tx.invoice.create({
          data: {
            invoiceNumber: dto.invoiceNumber,
            invoiceReference: dto.invoiceReference,
            invoiceDate,
            dueDate,
            currency: dto.currency,
            currencySymbol,
            description: dto.description,
            status: InvoiceStatus.Draft,
            customerFullname: dto.customer.fullname,
            customerEmail: dto.customer.email,
            customerMobile: dto.customer.mobileNumber,
            customerAddress: dto.customer.address,
            invoiceSubTotal: totals.subTotal,
            totalTax: totals.taxAmount,
            totalDiscount: discount,
            totalAmount: totals.totalAmount,
            totalPaid: 0,
            balanceAmount: totals.balanceAmount,
            createdBy,
            items: {
              create: {
                name: dto.item.name,
                quantity: dto.item.quantity,
                rate: dto.item.rate,
              },
            },
          },
          include: { items: true },
        }),
      );
      return this.toDetail(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Invoice number already exists');
      }
      throw error;
    }
  }

  async findAll(query: QueryInvoicesDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    if (query.fromDate && query.toDate && query.fromDate > query.toDate) {
      throw new BadRequestException(['fromDate must be on or before toDate']);
    }

    const where: Prisma.InvoiceWhereInput = {};
    const and: Prisma.InvoiceWhereInput[] = [];

    if (query.keyword) {
      and.push({
        OR: [
          {
            invoiceNumber: { contains: query.keyword, mode: 'insensitive' },
          },
          {
            customerFullname: { contains: query.keyword, mode: 'insensitive' },
          },
        ],
      });
    }

    if (query.status === 'Overdue') {
      where.status = { not: InvoiceStatus.Paid };
      where.dueDate = { lt: utcToday() };
    } else if (query.status === 'Paid') {
      where.status = InvoiceStatus.Paid;
    } else if (query.status) {
      // past-due Draft/Pending rows come back as Overdue, so keep them out of this filter
      where.status = query.status as InvoiceStatus;
      where.dueDate = { gte: utcToday() };
    }

    if (query.fromDate || query.toDate) {
      const range: { gte?: Date; lte?: Date } = {};
      if (query.fromDate) {
        range.gte = toUtcDate(query.fromDate);
      }
      if (query.toDate) {
        range.lte = toUtcDate(query.toDate);
      }
      // both invoiceDate and dueDate have to fall in range
      and.push({
        invoiceDate: range,
        dueDate: range,
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    const orderBy = query.sortBy
      ? [
          {
            [query.sortBy]: (query.ordering ?? 'DESC').toLowerCase() as
              | 'asc'
              | 'desc',
          },
          { createdAt: 'desc' as const },
        ]
      : { createdAt: 'desc' as const };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        select: LIST_SELECT,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: rows.map((row) => ({
        invoiceId: row.invoiceId,
        invoiceNumber: row.invoiceNumber,
        customer: { fullname: row.customerFullname },
        invoiceDate: toDateOnly(row.invoiceDate),
        dueDate: toDateOnly(row.dueDate),
        totalAmount: money(row.totalAmount),
        status: deriveStatus(row.status, row.dueDate),
      })),
      paging: { page, pageSize, total },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceId: id },
      include: { items: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return this.toDetail(invoice);
  }

  private toDetail(
    invoice: Prisma.InvoiceGetPayload<{ include: { items: true } }>,
  ) {
    return {
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceReference: invoice.invoiceReference,
      invoiceDate: toDateOnly(invoice.invoiceDate),
      dueDate: toDateOnly(invoice.dueDate),
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
      description: invoice.description,
      status: deriveStatus(invoice.status, invoice.dueDate),
      customer: {
        fullname: invoice.customerFullname,
        email: invoice.customerEmail,
        mobileNumber: invoice.customerMobile,
        address: invoice.customerAddress,
      },
      items: invoice.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        rate: money(item.rate),
      })),
      invoiceSubTotal: money(invoice.invoiceSubTotal),
      totalTax: money(invoice.totalTax),
      totalDiscount: money(invoice.totalDiscount),
      totalAmount: money(invoice.totalAmount),
      totalPaid: money(invoice.totalPaid),
      balanceAmount: money(invoice.balanceAmount),
      createdAt: invoice.createdAt.toISOString(),
      createdBy: invoice.createdBy,
    };
  }
}

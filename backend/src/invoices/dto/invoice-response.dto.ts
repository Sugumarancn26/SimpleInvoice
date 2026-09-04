import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceCustomerDto {
  @ApiProperty({ example: 'Paul' })
  fullname: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  email: string;

  @ApiPropertyOptional({ example: '947717364111' })
  mobileNumber?: string | null;

  @ApiPropertyOptional({ example: 'Singapore' })
  address?: string | null;
}

export class InvoiceListCustomerDto {
  @ApiProperty({ example: 'Paul' })
  fullname: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty({ example: 'b1c2d3e4-0000-0000-0000-000000000001' })
  id: string;

  @ApiProperty({ example: 'Honda RC150' })
  name: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1000 })
  rate: number;
}

export class InvoiceListItemDto {
  @ApiProperty({ example: '099ca7da-a290-40fa-93b9-1c43ae7bb887' })
  invoiceId: string;

  @ApiProperty({ example: 'IV1780488206995' })
  invoiceNumber: string;

  @ApiProperty({ type: InvoiceListCustomerDto })
  customer: InvoiceListCustomerDto;

  @ApiProperty({ example: '2026-06-03' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03' })
  dueDate: string;

  @ApiProperty({ example: 2180 })
  totalAmount: number;

  @ApiProperty({ example: 'Overdue' })
  status: string;
}

export class InvoicePagingDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 31 })
  total: number;
}

export class InvoiceListResponseDto {
  @ApiProperty({ type: [InvoiceListItemDto] })
  data: InvoiceListItemDto[];

  @ApiProperty({ type: InvoicePagingDto })
  paging: InvoicePagingDto;
}

export class InvoiceDetailResponseDto {
  @ApiProperty({ example: '099ca7da-a290-40fa-93b9-1c43ae7bb887' })
  invoiceId: string;

  @ApiProperty({ example: 'IV1780488206995' })
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662' })
  invoiceReference?: string | null;

  @ApiProperty({ example: '2026-06-03' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03' })
  dueDate: string;

  @ApiProperty({ example: 'AUD' })
  currency: string;

  @ApiProperty({ example: 'AU$' })
  currencySymbol: string;

  @ApiPropertyOptional({ example: 'Invoice is issued to Kanglee' })
  description?: string | null;

  @ApiProperty({ example: 'Overdue' })
  status: string;

  @ApiProperty({ type: InvoiceCustomerDto })
  customer: InvoiceCustomerDto;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty({ example: 2000 })
  invoiceSubTotal: number;

  @ApiProperty({ example: 200 })
  totalTax: number;

  @ApiProperty({ example: 20 })
  totalDiscount: number;

  @ApiProperty({ example: 2180 })
  totalAmount: number;

  @ApiProperty({ example: 1451.34 })
  totalPaid: number;

  @ApiProperty({ example: 728.66 })
  balanceAmount: number;

  @ApiProperty({ example: '2026-06-03T12:03:26.995Z' })
  createdAt: string;

  @ApiProperty({ example: 'ad1e0902-1928-4345-b513-60c86c94fc91' })
  createdBy: string;
}

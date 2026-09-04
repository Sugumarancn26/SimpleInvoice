export type InvoiceStatusFilter = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export type InvoiceSortBy = 'invoiceDate' | 'dueDate' | 'totalAmount';

export type InvoiceOrdering = 'ASC' | 'DESC';

export type InvoiceListItem = {
  invoiceId: string;
  invoiceNumber: string;
  customer: { fullname: string };
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
};

export type InvoicePaging = {
  page: number;
  pageSize: number;
  total: number;
};

export type InvoiceListResponse = {
  data: InvoiceListItem[];
  paging: InvoicePaging;
};

export type InvoiceDetail = {
  invoiceId: string;
  invoiceNumber: string;
  invoiceReference?: string | null;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description?: string | null;
  status: string;
  customer: {
    fullname: string;
    email: string;
    mobileNumber?: string | null;
    address?: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    rate: number;
  }>;
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  createdAt: string;
  createdBy: string;
};

export type CreateInvoiceRequest = {
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'AUD' | 'USD' | 'GBP';
  description?: string;
  customer: {
    fullname: string;
    email: string;
    mobileNumber?: string;
    address?: string;
  };
  item: {
    name: string;
    quantity: number;
    rate: number;
  };
  tax?: number;
  discount?: number;
};

export type InvoiceListQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: InvoiceSortBy;
  ordering?: InvoiceOrdering;
  status?: InvoiceStatusFilter;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
};

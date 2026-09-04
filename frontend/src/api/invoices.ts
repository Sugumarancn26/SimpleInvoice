import { client } from './client.ts';
import type {
  CreateInvoiceRequest,
  InvoiceDetail,
  InvoiceListQuery,
  InvoiceListResponse,
} from '../types/invoice.ts';

export const invoicesApi = {
  list(params: InvoiceListQuery) {
    return client.get<InvoiceListResponse>('/invoices', { params });
  },
  get(id: string) {
    return client.get<InvoiceDetail>(`/invoices/${id}`);
  },
  create(body: CreateInvoiceRequest) {
    return client.post<InvoiceDetail>('/invoices', body);
  },
};

import axios from 'axios';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi } from '../api/invoices.ts';
import { BackButton } from '../components/BackButton.tsx';
import { Button } from '../components/Button.tsx';
import { SectionCard } from '../components/Card.tsx';
import { DateInput, utcTodayIso } from '../components/DateInput.tsx';
import { FormField, inputClassName } from '../components/FormField.tsx';
import { Spinner } from '../components/Spinner.tsx';
import { SummaryPanel } from '../components/SummaryPanel.tsx';
import {
  Toast,
  toastVariantFromStatus,
  type ToastVariant,
} from '../components/Toast.tsx';
import type { CreateInvoiceRequest } from '../types/invoice.ts';

type FieldErrors = Partial<Record<string, string>>;

const CURRENCIES = ['AUD', 'USD', 'GBP'] as const;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function serverErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Unable to create invoice';
  }
  const message = error.response?.data?.message;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }
  return 'Unable to create invoice';
}

export function InvoiceCreate() {
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceReference, setInvoiceReference] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number] | ''>(
    'AUD',
  );
  const [description, setDescription] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [tax, setTax] = useState('10');
  const [discount, setDiscount] = useState('0');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    const qty = Number(quantity);
    const itemRate = Number(rate);
    const taxPercent = tax === '' ? 10 : Number(tax);
    const discountAmount = discount === '' ? 0 : Number(discount);
    if (
      !Number.isFinite(qty) ||
      qty <= 0 ||
      !Number.isFinite(itemRate) ||
      itemRate <= 0 ||
      !Number.isFinite(taxPercent) ||
      taxPercent < 0 ||
      !Number.isFinite(discountAmount) ||
      discountAmount < 0
    ) {
      return null;
    }
    const subTotal = round2(qty * itemRate);
    const taxAmount = round2(subTotal * (taxPercent / 100));
    const totalAmount = round2(subTotal + taxAmount - discountAmount);
    return { subTotal, taxAmount, totalAmount };
  }, [quantity, rate, tax, discount]);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!fullname.trim()) {
      errors.fullname = 'Customer name is required';
    }
    if (!email.trim()) {
      errors.email = 'Customer email is required';
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!invoiceNumber.trim()) {
      errors.invoiceNumber = 'Invoice number is required';
    }
    const today = utcTodayIso();
    if (!invoiceDate) {
      errors.invoiceDate = 'Invoice date is required';
    } else if (!isIsoDate(invoiceDate)) {
      errors.invoiceDate = 'Invoice date must be a valid date';
    } else if (invoiceDate < today) {
      errors.invoiceDate = 'Invoice date cannot be before today';
    }
    if (!dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (!isIsoDate(dueDate)) {
      errors.dueDate = 'Due date must be a valid date';
    } else if (dueDate < (invoiceDate || today)) {
      errors.dueDate = invoiceDate
        ? 'dueDate must be on or after invoiceDate'
        : 'Due date cannot be before today';
    }
    if (!currency) {
      errors.currency = 'Currency is required';
    }
    if (!itemName.trim()) {
      errors.itemName = 'Item name is required';
    }
    const qty = Number(quantity);
    if (quantity === '' || !Number.isInteger(qty) || qty <= 0) {
      errors.quantity = 'Quantity must be a positive integer';
    }
    const itemRate = Number(rate);
    if (rate === '' || !Number.isFinite(itemRate) || itemRate <= 0) {
      errors.rate = 'Rate must be a positive number';
    }
    if (tax !== '') {
      const taxPercent = Number(tax);
      if (!Number.isFinite(taxPercent) || taxPercent < 0) {
        errors.tax = 'Tax must be a non-negative number';
      }
    }
    if (discount !== '') {
      const discountAmount = Number(discount);
      if (!Number.isFinite(discountAmount) || discountAmount < 0) {
        errors.discount = 'Discount must be a non-negative number';
      } else if (preview && discountAmount > round2(preview.subTotal + preview.taxAmount)) {
        errors.discount =
          'discount must be less than or equal to subTotal + taxAmount';
      }
    }
    return errors;
  }

  function buildBody(): CreateInvoiceRequest {
    const body: CreateInvoiceRequest = {
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      dueDate,
      currency: currency as 'AUD' | 'USD' | 'GBP',
      customer: {
        fullname: fullname.trim(),
        email: email.trim(),
      },
      item: {
        name: itemName.trim(),
        quantity: Number(quantity),
        rate: Number(rate),
      },
    };
    if (invoiceReference.trim()) {
      body.invoiceReference = invoiceReference.trim();
    }
    if (description.trim()) {
      body.description = description.trim();
    }
    if (mobileNumber.trim()) {
      body.customer.mobileNumber = mobileNumber.trim();
    }
    if (address.trim()) {
      body.customer.address = address.trim();
    }
    if (tax !== '') {
      body.tax = Number(tax);
    }
    if (discount !== '') {
      body.discount = Number(discount);
    }
    return body;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setToast(null);
    if (Object.keys(nextErrors).length > 0) {
      setToast({
        message: 'Please correct the highlighted fields',
        variant: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      await invoicesApi.create(buildBody());
      navigate('/', {
        replace: true,
        state: { notice: 'Invoice created' },
      });
    } catch (err) {
      const status = axios.isAxiosError(err)
        ? err.response?.status
        : undefined;
      setToast({
        message: serverErrorMessage(err),
        variant: toastVariantFromStatus(status),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <BackButton to="/" />
      <h1 className="text-2xl font-bold text-slate-900">Create Invoice</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Fill in the details to generate a new invoice.
      </p>

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="space-y-4">
          <SectionCard title="Invoice details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Invoice number"
                htmlFor="invoiceNumber"
                error={fieldErrors.invoiceNumber}
                required
                caps
              >
                <input
                  id="invoiceNumber"
                  className={inputClassName}
                  placeholder="IV1780488206995"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                />
              </FormField>
              <FormField
                label="Invoice reference (optional)"
                htmlFor="invoiceReference"
                caps
              >
                <input
                  id="invoiceReference"
                  className={inputClassName}
                  placeholder="#5721662"
                  value={invoiceReference}
                  onChange={(event) => setInvoiceReference(event.target.value)}
                />
              </FormField>
              <FormField
                label="Invoice date"
                htmlFor="invoiceDate"
                error={fieldErrors.invoiceDate}
                required
                caps
              >
                <DateInput
                  id="invoiceDate"
                  value={invoiceDate}
                  min={utcTodayIso()}
                  onChange={(value) => {
                    setInvoiceDate(value);
                    if (dueDate && value && dueDate < value) {
                      setDueDate('');
                    }
                  }}
                />
              </FormField>
              <FormField
                label="Due date"
                htmlFor="dueDate"
                error={fieldErrors.dueDate}
                required
                caps
              >
                <DateInput
                  id="dueDate"
                  value={dueDate}
                  min={invoiceDate || utcTodayIso()}
                  onChange={setDueDate}
                />
              </FormField>
              <FormField
                label="Currency"
                htmlFor="currency"
                error={fieldErrors.currency}
                required
                caps
              >
                <select
                  id="currency"
                  className={`${inputClassName} bg-white`}
                  value={currency}
                  onChange={(event) =>
                    setCurrency(
                      event.target.value as (typeof CURRENCIES)[number],
                    )
                  }
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Description (optional)" htmlFor="description" caps>
                <input
                  id="description"
                  className={inputClassName}
                  placeholder="Service description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Customer">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Customer name"
                htmlFor="fullname"
                error={fieldErrors.fullname}
                required
                caps
              >
                <input
                  id="fullname"
                  className={inputClassName}
                  placeholder="Enter customer name"
                  value={fullname}
                  onChange={(event) => setFullname(event.target.value)}
                />
              </FormField>
              <FormField
                label="Customer email"
                htmlFor="email"
                error={fieldErrors.email}
                required
                caps
              >
                <input
                  id="email"
                  type="email"
                  className={inputClassName}
                  placeholder="Enter email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormField>
              <FormField label="Mobile (optional)" htmlFor="mobileNumber" caps>
                <input
                  id="mobileNumber"
                  className={inputClassName}
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(event) => setMobileNumber(event.target.value)}
                />
              </FormField>
              <FormField label="Address (optional)" htmlFor="address" caps>
                <input
                  id="address"
                  className={inputClassName}
                  placeholder="Enter customer address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Line item">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Item name"
                htmlFor="itemName"
                error={fieldErrors.itemName}
                required
                caps
              >
                <input
                  id="itemName"
                  className={inputClassName}
                  placeholder="Consulting hours"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                />
              </FormField>
              <FormField
                label="Quantity"
                htmlFor="quantity"
                error={fieldErrors.quantity}
                required
                caps
              >
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  className={inputClassName}
                  placeholder="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </FormField>
              <FormField
                label="Rate"
                htmlFor="rate"
                error={fieldErrors.rate}
                required
                caps
              >
                <input
                  id="rate"
                  type="number"
                  min={0}
                  step="0.01"
                  className={`${inputClassName} no-spinner`}
                  placeholder="150.00"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                />
              </FormField>
              <FormField label="Tax (%)" htmlFor="tax" error={fieldErrors.tax} caps>
                <input
                  id="tax"
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClassName}
                  placeholder="10"
                  value={tax}
                  onChange={(event) => setTax(event.target.value)}
                />
              </FormField>
              <FormField
                label="Discount"
                htmlFor="discount"
                error={fieldErrors.discount}
                caps
              >
                <input
                  id="discount"
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClassName}
                  placeholder="0"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
              </FormField>
            </div>
          </SectionCard>
        </div>

        <aside className="lg:sticky lg:top-24">
          <SummaryPanel
            currency={currency || 'AUD'}
            subTotal={preview?.subTotal ?? 0}
            taxAmount={preview?.taxAmount ?? 0}
            taxPercent={
              tax === '' || !Number.isFinite(Number(tax)) ? 10 : Number(tax)
            }
            discount={
              discount === '' || !Number.isFinite(Number(discount))
                ? 0
                : Number(discount)
            }
            total={preview?.totalAmount ?? 0}
          >
            <Button type="submit" disabled={submitting} className="w-full py-2.5">
              {submitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Saving…
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </SummaryPanel>
        </aside>
      </form>
    </main>
  );
}

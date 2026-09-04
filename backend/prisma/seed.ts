import { InvoiceStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CURRENCY_SYMBOLS } from '../src/common/date.util';
import { calculateInvoiceTotals } from '../src/common/money.util';

const prisma = new PrismaClient();

const REVIEWER_EMAIL = 'reviewer@101digital.io';
const REVIEWER_PASSWORD = 'changeme';
const REVIEWER_ID = 'ad1e0902-1928-4345-b513-60c86c94fc91';

const EXTRA_COUNT = 28;
const APPENDIX_INVOICE_MS = 1780488206995;

let extraIvOffset = 0;

function nextIvNumber(): string {
  extraIvOffset += 1;
  return `IV${APPENDIX_INVOICE_MS + extraIvOffset}`;
}

const CUSTOMERS = [
  {
    fullname: 'Alice Tan',
    email: 'alice@example.com',
    mobileNumber: '81110001',
    address: 'Singapore',
  },
  {
    fullname: 'Ben Ortiz',
    email: 'ben@example.com',
    mobileNumber: '81110002',
    address: 'Melbourne',
  },
  {
    fullname: 'Chen Wei',
    email: 'chen@example.com',
    mobileNumber: '81110003',
    address: 'Hong Kong',
  },
  {
    fullname: 'Diana Cole',
    email: 'diana@example.com',
    mobileNumber: '81110004',
    address: 'London',
  },
  {
    fullname: 'Omar Farouk',
    email: 'omar@example.com',
    mobileNumber: '81110005',
    address: 'Dubai',
  },
  {
    fullname: 'Priya Nair',
    email: 'priya@example.com',
    mobileNumber: '81110006',
    address: 'Mumbai',
  },
  {
    fullname: 'Sam Lee',
    email: 'sam@example.com',
    mobileNumber: '81110007',
    address: 'Auckland',
  },
  {
    fullname: 'Yuki Sato',
    email: 'yuki@example.com',
    mobileNumber: '81110008',
    address: 'Tokyo',
  },
];

const ITEM_NAMES = [
  'Keyboard',
  'Monitor',
  'Desk lamp',
  'Office chair',
  'Headset',
  'USB hub',
];

const DESCRIPTIONS = [
  'Office equipment supply',
  'IT hardware replacement',
  'Monthly consulting services',
  'Software licence renewal',
  'Warehouse packing materials',
  'On-site installation',
  'Q3 maintenance contract',
  'Staff training workshop',
  'Network upgrade parts',
  'Furniture delivery',
  'Annual support retainer',
  'Printer and stationery order',
];

const CURRENCIES = ['AUD', 'USD', 'GBP'] as const;
const STATUSES: InvoiceStatus[] = [
  InvoiceStatus.Draft,
  InvoiceStatus.Pending,
  InvoiceStatus.Paid,
];

type SeedCustomer = {
  fullname: string;
  address?: string;
  email: string;
  mobileNumber?: string;
};

type SeedItem = {
  id?: string;
  name: string;
  quantity: number;
  rate: number;
};

/** Appendix A invoice shape (minus out-of-model `type` / `invoiceGrossTotal`). */
type SeedInvoice = {
  createdAt?: string;
  createdBy: string;
  currency: (typeof CURRENCIES)[number];
  currencySymbol: string;
  customer: SeedCustomer;
  description?: string;
  dueDate: string;
  invoiceDate: string;
  invoiceId?: string;
  invoiceNumber: string;
  invoiceSubTotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  items: SeedItem[];
  invoiceReference?: string;
  status: InvoiceStatus;
};

function utcDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function addDays(isoDate: string, days: number): string {
  const date = utcDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function createdAtDate(value: string): Date {
  return new Date(value.endsWith('Z') ? value : `${value}Z`);
}

function toSeedInvoice(input: {
  createdAt?: string;
  createdBy?: string;
  currency: (typeof CURRENCIES)[number];
  customer: SeedCustomer;
  description?: string;
  dueDate: string;
  invoiceDate: string;
  invoiceId?: string;
  invoiceNumber: string;
  items: SeedItem[];
  invoiceReference?: string;
  status: InvoiceStatus;
  tax?: number;
  discount?: number;
  totalPaid?: number;
}): SeedInvoice {
  const item = input.items[0];
  const tax = input.tax ?? 10;
  const discount = input.discount ?? 0;
  const totals = calculateInvoiceTotals({
    quantity: item.quantity,
    rate: item.rate,
    taxPercent: tax,
    discount,
  });
  const totalPaid =
    input.status === InvoiceStatus.Paid
      ? totals.totalAmount
      : (input.totalPaid ?? 0);
  const balanceAmount = calculateInvoiceTotals({
    quantity: item.quantity,
    rate: item.rate,
    taxPercent: tax,
    discount,
    totalPaid,
  }).balanceAmount;

  return {
    createdAt: input.createdAt,
    createdBy: input.createdBy ?? REVIEWER_ID,
    currency: input.currency,
    currencySymbol: CURRENCY_SYMBOLS[input.currency],
    customer: input.customer,
    description: input.description,
    dueDate: input.dueDate,
    invoiceDate: input.invoiceDate,
    invoiceId: input.invoiceId,
    invoiceNumber: input.invoiceNumber,
    invoiceSubTotal: totals.subTotal,
    totalDiscount: discount,
    totalTax: totals.taxAmount,
    totalAmount: totals.totalAmount,
    totalPaid,
    balanceAmount,
    items: input.items,
    invoiceReference: input.invoiceReference,
    status: input.status,
  };
}

async function insertSeedInvoice(invoice: SeedInvoice) {
  await prisma.invoice.create({
    data: {
      ...(invoice.invoiceId ? { invoiceId: invoice.invoiceId } : {}),
      invoiceNumber: invoice.invoiceNumber,
      invoiceReference: invoice.invoiceReference,
      invoiceDate: utcDate(invoice.invoiceDate),
      dueDate: utcDate(invoice.dueDate),
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
      description: invoice.description,
      status: invoice.status,
      customerFullname: invoice.customer.fullname,
      customerEmail: invoice.customer.email,
      customerMobile: invoice.customer.mobileNumber,
      customerAddress: invoice.customer.address,
      invoiceSubTotal: invoice.invoiceSubTotal,
      totalTax: invoice.totalTax,
      totalDiscount: invoice.totalDiscount,
      totalAmount: invoice.totalAmount,
      totalPaid: invoice.totalPaid,
      balanceAmount: invoice.balanceAmount,
      ...(invoice.createdAt
        ? { createdAt: createdAtDate(invoice.createdAt) }
        : {}),
      createdBy: invoice.createdBy,
      items: {
        create: invoice.items.map((item) => ({
          ...(item.id ? { id: item.id } : {}),
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
        })),
      },
    },
  });
}

async function seed() {
  const passwordHash = await bcrypt.hash(REVIEWER_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: REVIEWER_EMAIL },
    update: { passwordHash, fullname: 'Reviewer' },
    create: {
      id: REVIEWER_ID,
      email: REVIEWER_EMAIL,
      passwordHash,
      fullname: 'Reviewer',
    },
  });

  await prisma.invoice.deleteMany();

  const appendixA: SeedInvoice = {
    createdAt: '2026-06-03T12:03:26.995',
    createdBy: REVIEWER_ID,
    currency: 'AUD',
    currencySymbol: 'AU$',
    customer: {
      fullname: 'Paul',
      address: 'Singapore',
      email: 'paul@101digital.io',
      mobileNumber: '947717364111',
    },
    description: 'Invoice is issued to Kanglee',
    dueDate: '2026-07-03',
    invoiceDate: '2026-06-03',
    invoiceId: '099ca7da-a290-40fa-93b9-1c43ae7bb887',
    invoiceNumber: 'IV1780488206995',
    invoiceSubTotal: 2000.0,
    totalDiscount: 20.0,
    totalTax: 200.0,
    totalAmount: 2180.0,
    totalPaid: 1451.34,
    balanceAmount: 728.66,
    items: [
      {
        id: 'b1c2d3e4-0000-0000-0000-000000000001',
        name: 'Honda RC150',
        quantity: 2,
        rate: 1000,
      },
    ],
    invoiceReference: '#5721662',
    status: InvoiceStatus.Pending,
  };

  const today = new Date().toISOString().slice(0, 10);

  const extraInvoices: SeedInvoice[] = [
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88001',
      invoiceDate: addDays(today, 1),
      dueDate: addDays(today, 21),
      currency: 'AUD',
      description: 'Draft invoice — not yet issued',
      status: InvoiceStatus.Draft,
      customer: {
        fullname: 'Maya Chen',
        email: 'maya.chen@example.com',
        mobileNumber: '91230001',
        address: 'Sydney',
      },
      items: [{ name: 'Standing desk', quantity: 1, rate: 450 }],
      tax: 10,
      discount: 0,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88002',
      invoiceDate: addDays(today, -5),
      dueDate: addDays(today, 25),
      currency: 'USD',
      description: 'Partial payment received',
      status: InvoiceStatus.Pending,
      customer: {
        fullname: 'Liam Brooks',
        email: 'liam.brooks@example.com',
        mobileNumber: '91230002',
        address: 'New York',
      },
      items: [{ name: 'Laptop stand', quantity: 3, rate: 80 }],
      tax: 10,
      discount: 5,
      totalPaid: 50,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88003',
      invoiceDate: addDays(today, -20),
      dueDate: addDays(today, -5),
      currency: 'GBP',
      description: 'Paid in full',
      status: InvoiceStatus.Paid,
      customer: {
        fullname: 'Sofia Rossi',
        email: 'sofia.rossi@example.com',
        mobileNumber: '91230003',
        address: 'Milan',
      },
      items: [{ name: 'Consulting day', quantity: 4, rate: 250 }],
      tax: 10,
      discount: 0,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88004',
      invoiceDate: addDays(today, -40),
      dueDate: addDays(today, -10),
      currency: 'AUD',
      description: 'Past due unpaid — API returns Overdue',
      status: InvoiceStatus.Pending,
      customer: {
        fullname: 'Noah Patel',
        email: 'noah.patel@example.com',
        mobileNumber: '91230004',
        address: 'Perth',
      },
      items: [{ name: 'Printer toner', quantity: 2, rate: 95 }],
      tax: 10,
      discount: 0,
      totalPaid: 0,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88005',
      invoiceDate: addDays(today, -30),
      dueDate: addDays(today, -2),
      currency: 'USD',
      description: 'Past due draft — API returns Overdue',
      status: InvoiceStatus.Draft,
      customer: {
        fullname: 'Elena Vargas',
        email: 'elena.vargas@example.com',
        mobileNumber: '91230005',
        address: 'Austin',
      },
      items: [{ name: 'Webcam', quantity: 1, rate: 120 }],
      tax: 0,
      discount: 0,
      totalPaid: 0,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88006',
      invoiceDate: addDays(today, -3),
      dueDate: addDays(today, 27),
      currency: 'GBP',
      description: 'High amount for sort checks',
      status: InvoiceStatus.Pending,
      customer: {
        fullname: 'Kenji Mori',
        email: 'kenji.mori@example.com',
        mobileNumber: '91230006',
        address: 'Osaka',
      },
      items: [{ name: 'Server rack', quantity: 10, rate: 2500 }],
      tax: 10,
      discount: 100,
      totalPaid: 500,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceDate: addDays(today, 3),
      dueDate: addDays(today, 17),
      currency: 'USD',
      description: 'Low amount for sort checks',
      status: InvoiceStatus.Draft,
      customer: {
        fullname: 'Ana Silva',
        email: 'ana.silva@example.com',
        address: 'Lisbon',
      },
      items: [{ name: 'USB cable', quantity: 1, rate: 12.5 }],
      tax: 0,
      discount: 0,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#2025-01',
      invoiceDate: '2025-11-01',
      dueDate: '2025-12-01',
      currency: 'AUD',
      description: 'Prior-year invoice for date-range filter',
      status: InvoiceStatus.Paid,
      customer: {
        fullname: 'Rajiv Kumar',
        email: 'rajiv.kumar@example.com',
        mobileNumber: '91230007',
        address: 'Delhi',
      },
      items: [{ name: 'Annual licence', quantity: 1, rate: 800 }],
      tax: 10,
      discount: 0,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88008',
      invoiceDate: addDays(today, -2),
      dueDate: addDays(today, 12),
      currency: 'AUD',
      description: 'Partial name match with Paul',
      status: InvoiceStatus.Pending,
      customer: {
        fullname: 'Paula Reed',
        email: 'paula.reed@example.com',
        mobileNumber: '91230008',
        address: 'Brisbane',
      },
      items: [{ name: 'Mouse pad', quantity: 5, rate: 18 }],
      tax: 10,
      discount: 2,
      totalPaid: 20,
    }),
    toSeedInvoice({
      invoiceNumber: nextIvNumber(),
      invoiceReference: '#88009',
      invoiceDate: '2027-02-01',
      dueDate: '2027-03-01',
      currency: 'GBP',
      description: 'Future-dated for date sort',
      status: InvoiceStatus.Draft,
      customer: {
        fullname: 'Zed Nguyen',
        email: 'zed.nguyen@example.com',
        address: 'Hanoi',
      },
      items: [{ name: 'Monitor arm', quantity: 2, rate: 140 }],
      tax: 10,
      discount: 0,
    }),
  ];

  for (let i = 0; i < EXTRA_COUNT; i += 1) {
    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const currency = CURRENCIES[i % CURRENCIES.length];
    const quantity = (i % 5) + 1;
    const rate = 50 + i * 17;
    const tax = i % 3 === 0 ? 10 : 0;
    const discount = i % 4 === 0 ? 5 : 0;

    const pastDueUnpaid = i % 5 === 0;
    const paid = i % 5 === 1;
    const status = pastDueUnpaid
      ? i % 2 === 0
        ? InvoiceStatus.Pending
        : InvoiceStatus.Draft
      : paid
        ? InvoiceStatus.Paid
        : STATUSES[i % STATUSES.length];

    const invoiceDate = pastDueUnpaid
      ? addDays(today, -40 - i)
      : paid
        ? addDays(today, -10 - i)
        : addDays(today, i - 10);
    const dueDate = pastDueUnpaid
      ? addDays(invoiceDate, 7)
      : addDays(invoiceDate, 14 + (i % 10));

    extraInvoices.push(
      toSeedInvoice({
        invoiceNumber: nextIvNumber(),
        invoiceReference: i % 2 === 0 ? `#REF-${1000 + i}` : undefined,
        invoiceDate,
        dueDate,
        currency,
        description: DESCRIPTIONS[i % DESCRIPTIONS.length],
        status,
        customer,
        items: [
          {
            name: ITEM_NAMES[i % ITEM_NAMES.length],
            quantity,
            rate,
          },
        ],
        tax,
        discount,
        totalPaid: status === InvoiceStatus.Paid ? undefined : i % 7 === 0 ? 10 : 0,
      }),
    );
  }

  for (const invoice of [appendixA, ...extraInvoices]) {
    await insertSeedInvoice(invoice);
  }
}

seed()
  .then(async () => {
    const count = await prisma.invoice.count();
    console.log(`Seed complete: ${count} invoices`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

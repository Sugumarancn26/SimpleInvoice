import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

const validBody = {
  invoiceNumber: 'INV-1',
  invoiceDate: '2026-06-03',
  dueDate: '2026-07-03',
  currency: 'AUD',
  customer: {
    fullname: 'Paul',
    email: 'paul@101digital.io',
  },
  item: {
    name: 'Honda RC150',
    quantity: 2,
    rate: 1000,
  },
};

describe('POST /invoices validation §2.3.5', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('negative quantity returns the exact 400 shape from §2.3.5', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .send({
        ...validBody,
        item: { ...validBody.item, quantity: -1 },
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      statusCode: 400,
      message: expect.any(Array),
      error: 'Bad Request',
    });
    expect(res.body.message.length).toBeGreaterThan(0);
    expect(res.body.message.every((m: unknown) => typeof m === 'string')).toBe(
      true,
    );
    expect(
      res.body.message.some((m: string) => m.toLowerCase().includes('quantity')),
    ).toBe(true);
  });
});

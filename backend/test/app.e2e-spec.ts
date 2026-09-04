import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/all-exceptions.filter';

describe('Invoice workflow (e2e) §2.3.7', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('login → POST /invoices → GET /invoices contains it', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'reviewer@101digital.io',
        password: 'changeme',
      })
      .expect(201);

    const token = login.body.token as string;
    expect(token).toBeDefined();

    const invoiceNumber = `E2E-${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceNumber,
        invoiceDate: '2026-09-03',
        dueDate: '2026-09-20',
        currency: 'AUD',
        customer: {
          fullname: 'E2E Customer',
          email: 'e2e@example.com',
        },
        item: {
          name: 'E2E Item',
          quantity: 1,
          rate: 100,
        },
      })
      .expect(201);

    expect(created.body.invoiceNumber).toBe(invoiceNumber);
    expect(created.body.status).toBe('Draft');

    const list = await request(app.getHttpServer())
      .get('/invoices')
      .query({ keyword: invoiceNumber })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.paging).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: 10,
      }),
    );
    expect(
      list.body.data.some(
        (row: { invoiceNumber: string }) => row.invoiceNumber === invoiceNumber,
      ),
    ).toBe(true);
  });
});

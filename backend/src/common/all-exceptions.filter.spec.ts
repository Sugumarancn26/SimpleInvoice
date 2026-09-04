import { Controller, Get, INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AllExceptionsFilter } from './all-exceptions.filter';

@Controller('invoices')
class InvoiceNotFoundStubController {
  @Get(':id')
  findOne() {
    throw new NotFoundException('Invoice not found');
  }
}

const spec404 = {
  statusCode: 404,
  message: 'Invoice not found',
  error: 'Not Found',
};

describe('AllExceptionsFilter §2.3.6', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InvoiceNotFoundStubController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /invoices/<uuid> matches spec 404 JSON key names and casing', async () => {
    const res = await request(app.getHttpServer()).get(
      '/invoices/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual(spec404);
    expect(Object.keys(res.body)).toEqual([
      'statusCode',
      'message',
      'error',
    ]);
    expect(JSON.stringify(res.body)).toBe(JSON.stringify(spec404));
  });
});

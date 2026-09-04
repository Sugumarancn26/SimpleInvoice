import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ErrorResponseDto } from '../common/error-response.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
  InvoiceDetailResponseDto,
  InvoiceListResponseDto,
} from './dto/invoice-response.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOkResponse({ type: InvoiceListResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  findAll(@Query() query: QueryInvoicesDto) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    example: '099ca7da-a290-40fa-93b9-1c43ae7bb887',
  })
  @ApiOkResponse({ type: InvoiceDetailResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiBody({ type: CreateInvoiceDto })
  @ApiCreatedResponse({ type: InvoiceDetailResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(
    @Body() dto: CreateInvoiceDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.invoicesService.create(dto, req.user.id);
  }
}

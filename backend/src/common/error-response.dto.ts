import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
    example: 'Invoice not found',
    description: 'A string, or an array of strings for validation errors',
  })
  message: string | string[];

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({ example: 'ad1e0902-1928-4345-b513-60c86c94fc91' })
  id: string;

  @ApiProperty({ example: 'reviewer@101digital.io' })
  email: string;

  @ApiProperty({ example: 'Reviewer' })
  fullname: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '../../../../common/dto/base-query.dto';

export class PostQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by published status',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  published?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    type: String,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
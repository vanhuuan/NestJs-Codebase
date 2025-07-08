import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Search keyword',
  })
  @IsString()
  @IsOptional()
  searchKey?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional({
    description: 'Additional filter criteria as JSON object',
    example: { status: 'active' },
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      return {};
    }
  })
  filter?: Record<string, any> = {};

  get skip(): number {
    const page = this.page ?? 1;
    const pageSize = this.pageSize ?? 10;
    return (page - 1) * pageSize;
  }
}
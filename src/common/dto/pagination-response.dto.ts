import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  readonly page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  readonly pageSize: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100
  })
  readonly totalItems: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  readonly totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  readonly hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  readonly hasPreviousPage: boolean;

  constructor(page: number, pageSize: number, totalItems: number) {
    this.page = page;
    this.pageSize = pageSize;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / pageSize);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of data items',
    isArray: true
  })
  readonly data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto
  })
  readonly meta: PaginationMetaDto;

  constructor(data: T[], page: number, pageSize: number, totalItems: number) {
    this.data = data;
    this.meta = new PaginationMetaDto(page, pageSize, totalItems);
  }
}
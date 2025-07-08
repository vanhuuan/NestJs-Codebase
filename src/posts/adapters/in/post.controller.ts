import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PostServicePort } from '../../application/ports/in/post-service.port';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { Post as PostEntity } from '../../application/domain/entities/post.entity';
import { PaginatedResponseDto } from '../../../common/dto/pagination-response.dto';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

@ApiTags('posts')
@Controller('posts')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class PostController {
  constructor(@Inject('PostServicePort') private readonly postService: PostServicePort) { }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiCreatedResponse({ description: 'Post created successfully', type: PostEntity })
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: any
  ): Promise<PostEntity> {
    return this.postService.createPost({
      ...createPostDto,
      userId: req.user.id
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination and filtering' })
  @ApiOkResponse({
    description: 'Posts retrieved successfully',
    type: PaginatedResponseDto,
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponseDto' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' }
            }
          }
        }
      ]
    }
  })
  findAllPosts(@Query() query: PostQueryDto): Promise<PaginatedResponseDto<PostEntity>> {
    return this.postService.findAllPosts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiOkResponse({ description: 'Post retrieved successfully', type: PostEntity })
  findPostById(@Param('id', ParseUUIDPipe) id: string): Promise<PostEntity> {
    return this.postService.findPostById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ description: 'Post updated successfully', type: PostEntity })
  updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiNoContentResponse({ description: 'Post deleted successfully' })
  deletePost(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.postService.deletePost(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all posts by user ID' })
  @ApiOkResponse({
    description: 'User posts retrieved successfully',
    type: PaginatedResponseDto,
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponseDto' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' }
            }
          }
        }
      ]
    }
  })
  findPostsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PostQueryDto,
  ): Promise<PaginatedResponseDto<PostEntity>> {
    return this.postService.findPostsByUserId(userId, query);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a post' })
  @ApiOkResponse({ description: 'Post published successfully', type: PostEntity })
  publishPost(@Param('id', ParseUUIDPipe) id: string): Promise<PostEntity> {
    return this.postService.publishPost(id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a post' })
  @ApiOkResponse({ description: 'Post unpublished successfully', type: PostEntity })
  unpublishPost(@Param('id', ParseUUIDPipe) id: string): Promise<PostEntity> {
    return this.postService.unpublishPost(id);
  }
}
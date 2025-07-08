import { Controller, Post, Body, UseGuards, UseFilters, Get, Request, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { RegisterDto } from '../in/dto/register.dto';
import { LoginDto } from '../in/dto/login.dto';
import { LocalAuthGuard } from '../../../common/guards/local-auth.guard';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums/roles.enum';
import { User } from '../../../users/application/domain/entities/user.entity';
import { UserServicePort } from '../../../users/application/ports/in/user-service.port';

@ApiTags('auth')
@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(
    @Inject('UserServicePort')
    private readonly userService: UserServicePort,
    private authService: AuthService
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User authenticated successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Current user retrieved successfully', type: User })
  getCurrentUser(@Request() req: any): Promise<User> {
    console.log('Current user request:', req.user);
    const userId = req.user.id;
    return this.userService.findUserById(userId);
  }
}
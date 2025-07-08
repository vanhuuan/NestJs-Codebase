import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthServicePort } from '../../domain/ports/in/auth-service.port';
import { RegisterDto } from '../../adapters/in/dto/register.dto';
import { LoginDto } from '../../adapters/in/dto/login.dto';
import { JwtPayload } from '../../domain/entities/jwt-payload.interface';
import { UserRepositoryPort } from '../../../users/application/ports/out/user-repository.port';

@Injectable()
export class AuthService implements AuthServicePort {
  constructor(
    @Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, fullName } = registerDto;
    
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
    });
    
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles || [],
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }
}
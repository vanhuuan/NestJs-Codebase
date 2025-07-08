import { RegisterDto } from '../../../adapters/in/dto/register.dto';
import { LoginDto } from '../../../adapters/in/dto/login.dto';

export interface AuthServicePort {
  register(registerDto: RegisterDto): Promise<any>;
  login(loginDto: LoginDto): Promise<{ accessToken: string }>;
  validateUser(email: string, password: string): Promise<any>;
}
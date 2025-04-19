import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ message: string, token: string }> {
    const { username, email, password, tenantId, roles } = signUpDto;

    const existingUser = await this.userModel.findOne({
      $or: [
        { username },
        { email },
      ],
    });
    
    if (existingUser) {
      throw new ConflictException("Username or email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
      tenantId,
      roles
    });

    const token = this.generateToken(user);

    return { 
      message: 'User has been registered successfully!',
      token 
    };
  }

  async login(loginDto: LoginDto): Promise<{ message: string, token: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate password  
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return { 
      message: 'User has been logged in successfully!',
      token
     };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      username: user.username,
      tenantId: user.tenantId,
      roles: user.roles,
    }

    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '3600s';
    const secret = this.configService.get<string>('jwt.secret');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }
}

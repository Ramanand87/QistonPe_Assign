import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async login(loginDto: LoginDto) {
        if (loginDto.username !== 'admin' || loginDto.password !== 'admin123') {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { username: loginDto.username, sub: '1' };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}

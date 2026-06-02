import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token && this.authService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Sessão expirada ou encerrada. Por favor, faça login novamente.');
      }
    }

    const result = await super.canActivate(context);
    return result as boolean;
  }
}

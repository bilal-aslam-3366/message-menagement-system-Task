import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw err
    }
console.log("useruseruser",user)
    if (!user) {
      let message = 'Authentication failed. Please login again.'

      if (info?.name === 'TokenExpiredError') {
        message = 'Token has expired. Please login again.'
      } else if (info?.message === 'No auth token') {
        message = 'Authentication token is missing. Please login.'
      } else if (info?.message === 'invalid token') {
        message = 'Invalid token. Please login again.'
      }

      throw new UnauthorizedException(message)
    }

    return user
  }
}

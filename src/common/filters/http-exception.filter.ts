import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException, Logger } from "@nestjs/common"
import type { Request, Response } from "express"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const errorResponse = exception.getResponse()

    const error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorResponse["message"] || exception.message || "Internal server error",
    }

    this.logger.error(`${request.method} ${request.url} ${status}`, JSON.stringify(error), "HttpExceptionFilter")

    response.status(status).json(error)
  }
}

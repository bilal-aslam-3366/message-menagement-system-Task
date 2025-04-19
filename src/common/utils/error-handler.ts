import { HttpException, HttpStatus, Logger } from "@nestjs/common"

export class ErrorHandler {
  private static readonly logger = new Logger("ErrorHandler")

  static handleError(error: any, context: string): never {
    ErrorHandler.logger.error(`Error in ${context}: ${error.message}`, error.stack)

    if (error instanceof HttpException) {
      throw error
    }

    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}

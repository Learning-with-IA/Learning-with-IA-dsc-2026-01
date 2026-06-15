import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de exceções HTTP.
 *
 * Padroniza TODAS as respostas de erro da API em um formato corporativo
 * consistente, facilitando o consumo pelo frontend e registro de logs.
 *
 * Formato de resposta:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Recurso não encontrado",
 *   "timestamp": "2026-06-15T15:30:00.000Z",
 *   "path": "/api/v1/users/10"
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Extrair mensagem — pode vir como string ou objeto { message, error, statusCode }
    const exceptionResponse = exception.getResponse();
    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, any>;
      message = resp.message || exception.message;
    } else {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

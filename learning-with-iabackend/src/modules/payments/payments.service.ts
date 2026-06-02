import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import type { IPaymentRepository } from './repositories/payment.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentsRepository: IPaymentRepository,
  ) {}

  // CREATE - POST /payments
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsRepository.salvar(createPaymentDto);
  }

  // READ ALL - GET /payments
  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.buscarTodos();
  }

  // READ BY ID - GET /payments/:id
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.buscarPorId(id);

    if (!payment) {
      throw new NotFoundException(
        `Pagamento com ID "${id}" não foi encontrado.`,
      );
    }

    return payment;
  }

  // UPDATE - PATCH /payments/:id
  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.salvar(payment);
  }

  // DELETE - DELETE /payments/:id
  async remove(id: string): Promise<{ message: string }> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remover(payment);
    return { message: `Pagamento com ID "${id}" removido com sucesso.` };
  }
}

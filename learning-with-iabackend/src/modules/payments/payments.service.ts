import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  // CREATE - POST /payments
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentsRepository.create(createPaymentDto);
    return await this.paymentsRepository.save(payment);
  }

  // READ ALL - GET /payments
  async findAll(): Promise<Payment[]> {
    return await this.paymentsRepository.find();
  }

  // READ BY ID - GET /payments/:id
  // 🎯 ENDPOINT PRINCIPAL: Busca um pagamento específico
  // ✅ Usa repository.findOne() com where clause
  // ✅ Lança NotFoundException se não encontrado (HTTP 404)
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
    });

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
    return await this.paymentsRepository.save(payment);
  }

  // DELETE - DELETE /payments/:id
  async remove(id: string): Promise<{ message: string }> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
    return { message: `Pagamento com ID "${id}" removido com sucesso.` };
  }
}

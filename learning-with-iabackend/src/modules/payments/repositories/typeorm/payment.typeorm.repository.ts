import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { IPaymentRepository } from '../payment.repository.interface';

@Injectable()
export class PaymentTypeOrmRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  async salvar(payment: Partial<Payment>): Promise<Payment> {
    const entity = this.repository.create(payment);
    return this.repository.save(entity);
  }

  async buscarTodos(): Promise<Payment[]> {
    return this.repository.find();
  }

  async buscarPorId(id: string): Promise<Payment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async remover(payment: Payment): Promise<void> {
    await this.repository.remove(payment);
  }
}

import { Payment } from '../entities/payment.entity';

export interface IPaymentRepository {
  salvar(payment: Partial<Payment>): Promise<Payment>;
  buscarTodos(): Promise<Payment[]>;
  buscarPorId(id: string): Promise<Payment | null>;
  remover(payment: Payment): Promise<void>;
}

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTypeOrmRepository } from './payment.typeorm.repository';
import { Payment } from '../../entities/payment.entity';
import { IPaymentRepository } from '../payment.repository.interface';

describe('PaymentTypeOrmRepository', () => {
  let repository: PaymentTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Payment>>;

  const mockPayment: Payment = {
    id: 'payment-id-1',
    userId: 'user-id-1',
    amount: 100.0,
    status: 'pending',
    paymentMethod: 'credit_card',
    transactionId: 'tx-123',
    description: 'Test payment',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentTypeOrmRepository,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<PaymentTypeOrmRepository>(PaymentTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<Payment>>>(getRepositoryToken(Payment));
  });

  it('deve salvar um pagamento', async () => {
    mockTypeOrmRepository.create.mockReturnValueOnce(mockPayment);
    mockTypeOrmRepository.save.mockResolvedValueOnce(mockPayment);

    const result = await repository.salvar({ amount: 100.0 });
    expect(result).toEqual(mockPayment);
    expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({ amount: 100.0 });
    expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockPayment);
  });

  it('deve buscar todos os pagamentos', async () => {
    mockTypeOrmRepository.find.mockResolvedValueOnce([mockPayment]);

    const result = await repository.buscarTodos();
    expect(result).toEqual([mockPayment]);
    expect(mockTypeOrmRepository.find).toHaveBeenCalled();
  });

  it('deve buscar por id', async () => {
    mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockPayment);

    const result = await repository.buscarPorId('payment-id-1');
    expect(result).toEqual(mockPayment);
    expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'payment-id-1' } });
  });

  it('deve remover um pagamento', async () => {
    mockTypeOrmRepository.remove.mockResolvedValueOnce(mockPayment);

    await repository.remover(mockPayment);
    expect(mockTypeOrmRepository.remove).toHaveBeenCalledWith(mockPayment);
  });

  it('deve implementar IPaymentRepository', () => {
    const impl: IPaymentRepository = repository;
    expect(impl).toBeDefined();
  });
});

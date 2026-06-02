import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { IPaymentRepository } from './repositories/payment.repository.interface';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentRepository: jest.Mocked<IPaymentRepository>;

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
    mockPaymentRepository = {
      salvar: jest.fn(),
      buscarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      remover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: 'IPaymentRepository',
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('create', () => {
    it('deve criar um novo pagamento', async () => {
      const dto = { userId: 'user-id-1', amount: 100.0, paymentMethod: 'credit_card' };
      mockPaymentRepository.salvar.mockResolvedValueOnce(mockPayment);

      const result = await service.create(dto);
      expect(result).toEqual(mockPayment);
      expect(mockPaymentRepository.salvar).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os pagamentos', async () => {
      mockPaymentRepository.buscarTodos.mockResolvedValueOnce([mockPayment]);

      const result = await service.findAll();
      expect(result).toEqual([mockPayment]);
      expect(mockPaymentRepository.buscarTodos).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um pagamento por ID', async () => {
      mockPaymentRepository.buscarPorId.mockResolvedValueOnce(mockPayment);

      const result = await service.findOne('payment-id-1');
      expect(result).toEqual(mockPayment);
      expect(mockPaymentRepository.buscarPorId).toHaveBeenCalledWith('payment-id-1');
    });

    it('deve lançar NotFoundException se o pagamento não for encontrado', async () => {
      mockPaymentRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.findOne('invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um pagamento existente', async () => {
      const dto = { status: 'completed' };
      mockPaymentRepository.buscarPorId.mockResolvedValueOnce(mockPayment);
      mockPaymentRepository.salvar.mockResolvedValueOnce({ ...mockPayment, status: 'completed' });

      const result = await service.update('payment-id-1', dto);
      expect(result.status).toBe('completed');
      expect(mockPaymentRepository.salvar).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um pagamento', async () => {
      mockPaymentRepository.buscarPorId.mockResolvedValueOnce(mockPayment);
      mockPaymentRepository.remover.mockResolvedValueOnce();

      const result = await service.remove('payment-id-1');
      expect(result).toEqual({ message: `Pagamento com ID "payment-id-1" removido com sucesso.` });
      expect(mockPaymentRepository.remover).toHaveBeenCalledWith(mockPayment);
    });
  });
});

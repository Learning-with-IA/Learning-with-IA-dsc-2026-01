import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentTypeOrmRepository } from './repositories/typeorm/payment.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: 'IPaymentRepository',
      useClass: PaymentTypeOrmRepository,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}

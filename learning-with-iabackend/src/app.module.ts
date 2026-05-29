import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CursosModule } from './modules/cursos/cursos.module';
import { User } from './modules/users/entities/user.entity';
import { Event } from './modules/events/entities/event.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Curso } from './modules/cursos/entities/curso.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: process.env.NODE_ENV === 'test' ? ':memory:' : 'database.sqlite',
      autoSave: process.env.NODE_ENV !== 'test',
      entities: [User, Event, Payment, Curso],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    EventsModule,
    PaymentsModule,
    CursosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

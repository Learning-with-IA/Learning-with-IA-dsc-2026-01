import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CursosModule } from './modules/cursos/cursos.module';
import { MatriculasModule } from './modules/matriculas/matriculas.module';
import { User } from './modules/users/entities/user.entity';
import { Event } from './modules/events/entities/event.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Curso } from './modules/cursos/entities/curso.entity';
import { CursoConteudo } from './modules/cursos/entities/curso-conteudo.entity';
import { CursoAgente } from './modules/cursos/entities/curso-agente.entity';
import { LogInteracao } from './modules/cursos/entities/log-interacao.entity';
import { Matricula } from './modules/matriculas/entities/matricula.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'learning_db',
      entities: [
        User,
        Event,
        Payment,
        Curso,
        CursoConteudo,
        CursoAgente,
        LogInteracao,
        Matricula,
      ],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    EventsModule,
    PaymentsModule,
    CursosModule,
    MatriculasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

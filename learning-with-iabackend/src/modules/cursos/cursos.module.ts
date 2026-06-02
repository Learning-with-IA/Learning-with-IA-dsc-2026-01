import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { AgenteIAService } from './services/agente-ia.service';
import { Curso } from './entities/curso.entity';
import { CursoConteudo } from './entities/curso-conteudo.entity';
import { CursoAgente } from './entities/curso-agente.entity';
import { LogInteracao } from './entities/log-interacao.entity';
import type { ICursoRepository } from './repositories/curso.repository.interface';
import type { ICursoConteudoRepository } from './repositories/curso-conteudo.repository.interface';
import type { ICursoAgenteRepository } from './repositories/curso-agente.repository.interface';
import type { ILogInteracaoRepository } from './repositories/log-interacao.repository.interface';
import { CursoTypeOrmRepository } from './repositories/typeorm/curso.typeorm.repository';
import { CursoConteudoTypeOrmRepository } from './repositories/typeorm/curso-conteudo.typeorm.repository';
import { CursoAgenteTypeOrmRepository } from './repositories/typeorm/curso-agente.typeorm.repository';
import { LogInteracaoTypeOrmRepository } from './repositories/typeorm/log-interacao.typeorm.repository';
import { MatriculasModule } from '../matriculas/matriculas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curso,
      CursoConteudo,
      CursoAgente,
      LogInteracao,
    ]),
    MatriculasModule,
  ],
  controllers: [CursosController],
  providers: [
    CursosService,
    AgenteIAService,
    {
      provide: 'ICursoRepository',
      useClass: CursoTypeOrmRepository,
    },
    {
      provide: 'ICursoConteudoRepository',
      useClass: CursoConteudoTypeOrmRepository,
    },
    {
      provide: 'ICursoAgenteRepository',
      useClass: CursoAgenteTypeOrmRepository,
    },
    {
      provide: 'ILogInteracaoRepository',
      useClass: LogInteracaoTypeOrmRepository,
    },
  ],
  exports: [CursosService, AgenteIAService],
})
export class CursosModule {}

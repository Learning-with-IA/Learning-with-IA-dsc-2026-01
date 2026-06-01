import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { AgenteIAService } from './services/agente-ia.service';
import { Curso } from './entities/curso.entity';
import { CursoConteudo } from './entities/curso-conteudo.entity';
import { CursoAgente } from './entities/curso-agente.entity';
import { LogInteracao } from './entities/log-interacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curso,
      CursoConteudo,
      CursoAgente,
      LogInteracao,
    ]),
  ],
  controllers: [CursosController],
  providers: [CursosService, AgenteIAService],
  exports: [CursosService, AgenteIAService],
})
export class CursosModule {}

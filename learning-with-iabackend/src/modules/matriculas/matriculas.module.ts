import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculasController } from './matriculas.controller';
import { MatriculasService } from './matriculas.service';
import { Matricula } from './entities/matricula.entity';
import { MatriculaTypeOrmRepository } from './repositories/typeorm/matricula.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Matricula])],
  controllers: [MatriculasController],
  providers: [
    MatriculasService,
    {
      provide: 'IMatriculaRepository',
      useClass: MatriculaTypeOrmRepository,
    },
  ],
  exports: [MatriculasService],
})
export class MatriculasModule {}

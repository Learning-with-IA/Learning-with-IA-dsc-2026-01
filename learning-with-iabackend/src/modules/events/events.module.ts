import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventTypeOrmRepository } from './repositories/typeorm/event.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: 'IEventRepository',
      useClass: EventTypeOrmRepository,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}

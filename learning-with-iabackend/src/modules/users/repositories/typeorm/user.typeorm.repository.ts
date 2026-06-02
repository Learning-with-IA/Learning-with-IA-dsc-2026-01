import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../user.repository.interface';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async salvar(user: Partial<User>): Promise<User> {
    const entity = this.repository.create(user);
    return this.repository.save(entity);
  }

  async buscarTodos(): Promise<User[]> {
    return this.repository.find();
  }

  async buscarPorId(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async buscarPorEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async remover(user: User): Promise<void> {
    await this.repository.remove(user);
  }
}

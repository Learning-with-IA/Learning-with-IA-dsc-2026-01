import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../user.repository.interface';
import { GetUsersFilterDto } from '../../dto/user.dto';

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

  async buscarComFiltros(
    filtros: GetUsersFilterDto,
  ): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10, name, email, role, isActive } = filtros;
    const query = this.repository.createQueryBuilder('user');

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}

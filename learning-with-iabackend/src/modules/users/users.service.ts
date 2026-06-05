import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, GetUsersFilterDto } from './dto/user.dto';
import type { IUserRepository } from './repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly usersRepository: IUserRepository,
  ) {}

  private removePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // CREATE - POST /users (Criar usuário administrativamente)
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userToSave = {
      ...createUserDto,
      password: hashedPassword,
    };
    const saved = await this.usersRepository.salvar(userToSave);
    return this.removePassword(saved);
  }

  // READ ALL - GET /users
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.buscarTodos();
    return users.map((u) => this.removePassword(u));
  }

  // READ PAGINATED WITH FILTERS - GET /users (Paginado com query params)
  async findPaginated(filtros: GetUsersFilterDto): Promise<{ data: Omit<User, 'password'>[]; meta: any }> {
    const { data, total } = await this.usersRepository.buscarComFiltros(filtros);
    const limit = filtros.limit || 10;
    const page = filtros.page || 1;
    return {
      data: data.map((u) => this.removePassword(u)),
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // READ BY ID - GET /users/:id
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.buscarPorId(id);

    if (!user) {
      throw new NotFoundException(
        `Usuário com ID "${id}" não foi encontrado.`,
      );
    }

    return this.removePassword(user);
  }

  // UPDATE - PATCH /users/:id
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.buscarPorId(id);
    if (!user) {
      throw new NotFoundException(
        `Usuário com ID "${id}" não foi encontrado.`,
      );
    }
    
    const updateData = { ...updateUserDto };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    Object.assign(user, updateData);
    const saved = await this.usersRepository.salvar(user);
    return this.removePassword(saved);
  }

  // UPDATE STATUS - PATCH /users/:id/status
  async updateStatus(id: string, isActive: boolean): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.buscarPorId(id);
    if (!user) {
      throw new NotFoundException(
        `Usuário com ID "${id}" não foi encontrado.`,
      );
    }
    user.isActive = isActive;
    const saved = await this.usersRepository.salvar(user);
    return this.removePassword(saved);
  }

  // DELETE - DELETE /users/:id
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.buscarPorId(id);
    if (!user) {
      throw new NotFoundException(
        `Usuário com ID "${id}" não foi encontrado.`,
      );
    }
    await this.usersRepository.remover(user);
    return { message: `Usuário com ID "${id}" removido com sucesso.` };
  }
}

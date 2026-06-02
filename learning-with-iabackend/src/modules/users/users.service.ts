import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import type { IUserRepository } from './repositories/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly usersRepository: IUserRepository,
  ) {}

  // CREATE - POST /users
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.salvar(createUserDto);
  }

  // READ ALL - GET /users
  async findAll(): Promise<User[]> {
    return this.usersRepository.buscarTodos();
  }

  // READ BY ID - GET /users/:id
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.buscarPorId(id);

    if (!user) {
      throw new NotFoundException(
        `Usuário com ID "${id}" não foi encontrado.`,
      );
    }

    return user;
  }

  // UPDATE - PATCH /users/:id
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.salvar(user);
  }

  // DELETE - DELETE /users/:id
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.usersRepository.remover(user);
    return { message: `Usuário com ID "${id}" removido com sucesso.` };
  }
}

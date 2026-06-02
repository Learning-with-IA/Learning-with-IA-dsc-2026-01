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

  // CREATE - POST /users (Criar usuário administrativamente)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userToSave = {
      ...createUserDto,
      password: hashedPassword,
    };
    return this.usersRepository.salvar(userToSave);
  }

  // READ ALL - GET /users
  async findAll(): Promise<User[]> {
    return this.usersRepository.buscarTodos();
  }

  // READ PAGINATED WITH FILTERS - GET /users (Paginado com query params)
  async findPaginated(filtros: GetUsersFilterDto) {
    const { data, total } = await this.usersRepository.buscarComFiltros(filtros);
    const limit = filtros.limit || 10;
    const page = filtros.page || 1;
    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
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
    
    // Ignorar e-mail e senha por esta rota (possuem fluxos próprios)
    const { email, password, ...updateData } = updateUserDto;
    
    Object.assign(user, updateData);
    return this.usersRepository.salvar(user);
  }

  // UPDATE STATUS - PATCH /users/:id/status
  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = isActive;
    return this.usersRepository.salvar(user);
  }

  // DELETE - DELETE /users/:id
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.usersRepository.remover(user);
    return { message: `Usuário com ID "${id}" removido com sucesso.` };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // CREATE - POST /users
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  // READ ALL - GET /users
  // Retorna uma coleção de registros
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // READ BY ID - GET /users/:id
  // 🎯 ENDPOINT PRINCIPAL: Busca um usuário específico
  // ✅ Usa repository.findOne() com where clause
  // ✅ Lança NotFoundException se não encontrado (HTTP 404)
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    // Validação: se não encontrar, lança erro 404
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
    // Primeiro valida se o usuário existe
    const user = await this.findOne(id); // Isto já lança NotFoundException se não existe

    // Depois atualiza
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  // DELETE - DELETE /users/:id
  async remove(id: string): Promise<{ message: string }> {
    // Primeiro valida se o usuário existe
    const user = await this.findOne(id); // Isto já lança NotFoundException se não existe

    // Depois deleta
    await this.usersRepository.remove(user);
    return { message: `Usuário com ID "${id}" removido com sucesso.` };
  }
}

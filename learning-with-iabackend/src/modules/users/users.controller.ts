import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ================================================
  // CREATE - POST /users
  // ================================================
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // ================================================
  // READ ALL - GET /users
  // ================================================
  // Retorna uma COLEÇÃO de registros
  // Útil para: listar, filtrar, paginar
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // ================================================
  // READ BY ID - GET /users/:id
  // ================================================
  // 🎯 ENDPOINT PRINCIPAL DO SEU PROFESSOR
  // Retorna um ITEM ÚNICO específico
  // Valida se existe → 200 OK
  // Não encontrado → 404 Not Found
  //
  // ✅ @Param('id') extrai o ID da rota
  // ✅ Controller recebe e delega ao service
  // ✅ Service busca com repository.findOne({ where: { id } })
  // ✅ Service lança NotFoundException se não encontrado
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // ================================================
  // UPDATE - PATCH /users/:id
  // ================================================
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  // ================================================
  // DELETE - DELETE /users/:id
  // ================================================
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }
}

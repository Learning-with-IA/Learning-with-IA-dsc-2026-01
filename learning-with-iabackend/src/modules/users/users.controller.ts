import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, GetUsersFilterDto } from './dto/user.dto';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ================================================
  // CREATE - POST /api/v1/users
  // ================================================
  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Criar usuário administrativamente (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso proibido.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // ================================================
  // READ PAGINATED - GET /api/v1/users
  // ================================================
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Listar usuários com filtros e paginação (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista paginada retornada com sucesso.' })
  findPaginated(@Query() query: GetUsersFilterDto) {
    return this.usersService.findPaginated(query);
  }

  // ================================================
  // READ BY ID - GET /api/v1/users/:id
  // ================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obter dados de um usuário por ID (ADMIN ou Próprio Usuário)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string, @Req() req: any): Promise<User> {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Acesso negado. Você só pode visualizar seu próprio perfil.');
    }
    return this.usersService.findOne(id);
  }

  // ================================================
  // UPDATE - PATCH /api/v1/users/:id
  // ================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados cadastrais (ADMIN ou Próprio Usuário)' })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ): Promise<User> {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Acesso negado. Você só pode editar seu próprio perfil.');
    }
    return this.usersService.update(id, updateUserDto);
  }

  // ================================================
  // UPDATE STATUS - PATCH /api/v1/users/:id/status
  // ================================================
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Ativar/Desativar usuário administrativamente (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<User> {
    return this.usersService.updateStatus(id, isActive);
  }

  // ================================================
  // DELETE - DELETE /api/v1/users/:id
  // ================================================
  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário da plataforma (ADMIN ou Próprio Usuário)' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id') id: string, @Req() req: any): Promise<{ message: string }> {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Acesso negado. Você só pode remover sua própria conta.');
    }
    return this.usersService.remove(id);
  }
}

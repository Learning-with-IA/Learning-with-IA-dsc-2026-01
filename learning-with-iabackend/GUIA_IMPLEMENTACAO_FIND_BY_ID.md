# 🎓 Guia Passo a Passo - Implementação de Busca Detalhada por ID

## 🎯 Objetivo

Implementar o endpoint **GET /:id** com TypeORM seguindo as diretrizes de seu professor:
- ✅ Controller recebe parâmetro com @Param('id')
- ✅ Service busca com repository.findOne({ where: { id } })
- ✅ Lança NotFoundException se não encontrado (HTTP 404)
- ✅ Testes estruturados em arquivo .http

---

## 📋 O que foi mudado e por quê

### 1️⃣ ALTERAÇÃO NO MODULE (users.module.ts)

#### ❌ ANTES (Em memória - simulação)
```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
```

#### ✅ DEPOIS (Com TypeORM - Produção)
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // ← Novo: Registra a Entity
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

#### 🔍 Por que mudou?
- **TypeOrmModule.forFeature([User])** registra a Entity no módulo
- Permite que o NestJS injete automaticamente o `Repository<User>`
- O serviço consegue acessar o banco de dados real
- Padrão profissional de injeção de dependência

---

### 2️⃣ ALTERAÇÃO NO SERVICE (users.service.ts)

#### ❌ ANTES (Simulação em Memória)
```typescript
const users = new Map();  // ← Global, não escala
let userCounter = 0;       // ← Contador manual

@Injectable()
export class UsersService {
  async findOne(id: string) {
    const user = users.get(id);  // ← Busca em Map
    if (!user) {
      throw new NotFoundException(`Usuário "${id}" não encontrado.`);
    }
    return user;
  }
}
```

#### ✅ DEPOIS (Com TypeORM Repository)
```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)  // ← Injeção de dependência
    private readonly usersRepository: Repository<User>,
  ) {}

  // 🎯 IMPLEMENTAÇÃO PRINCIPAL
  async findOne(id: string): Promise<User> {
    // ✅ Busca com TypeORM + where clause
    const user = await this.usersRepository.findOne({
      where: { id },  // ← Cláusula WHERE do SQL
    });

    // ✅ Validação: Lança erro se não encontrado
    if (!user) {
      throw new NotFoundException(
        `Usuário com ID "${id}" não foi encontrado.`,
      );
    }

    return user;  // ← Retorna o objeto encontrado
  }
}
```

#### 🔍 Por que mudou?

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Onde armazena** | Map em memória | PostgreSQL via TypeORM |
| **Injeção** | Nenhuma | @InjectRepository(User) |
| **Query** | users.get(id) | usersRepository.findOne() |
| **Persistência** | Perdida ao reiniciar | Salva no banco |
| **Escalabilidade** | ❌ Não escala | ✅ Escala com banco |

---

### 3️⃣ ALTERAÇÃO NO CONTROLLER (users.controller.ts)

#### ✅ O QUE PERMANECE IGUAL
O controller já estava correto! Apenas adicionamos type hints:

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🎯 ENDPOINT PRINCIPAL - Busca detalhada por ID
  @Get(':id')  // ← Rota parametrizada
  findOne(@Param('id') id: string): Promise<User> {  // ← Type hints
    return this.usersService.findOne(id);  // ← Delega ao service
  }
}
```

#### 📌 Regra Importante: Ordem das Rotas

```typescript
// ✅ CORRETO: Rotas fixas ANTES de parametrizadas
@Get('active')      // ← Rota específica
findActive() { ... }

@Get(':id')         // ← Rota parametrizada
findOne(@Param('id') id: string) { ... }

// ❌ ERRADO: Ordem invertida causaria conflito
@Get(':id')         // ← NestJS interpretaria 'active' como ID
findOne(@Param('id') id: string) { ... }

@Get('active')      // ← Nunca seria acionada
findActive() { ... }
```

---

## 🔄 Fluxo Completo de Uma Requisição

### Exemplo: GET /users/550e8400-e29b-41d4-a716-446655440000

```
1. Cliente (REST Client)
   └─→ GET /users/550e8400-e29b-41d4-a716-446655440000

2. NestJS Router
   └─→ Identifica rota @Get(':id')
   └─→ Extrai ID: "550e8400-e29b-41d4-a716-446655440000"

3. Controller
   └─→ @Param('id') recebe: "550e8400-e29b-41d4-a716-446655440000"
   └─→ Chama: this.usersService.findOne(id)

4. Service
   └─→ await usersRepository.findOne({ where: { id } })
   └─→ Executa SQL: SELECT * FROM "user" WHERE "id" = $1
   └─→ Retorna objeto encontrado OU undefined

5. Validação no Service
   ├─→ Se encontrou: RETORNA o usuário
   └─→ Se não encontrou:
       └─→ throw new NotFoundException(...)
       └─→ NestJS captura a exceção
       └─→ Converte para HTTP 404

6. Response ao Cliente
   ├─→ ✅ Encontrado: HTTP 200 + JSON do usuário
   └─→ ❌ Não encontrado: HTTP 404 + { statusCode, message, error }
```

---

## 🧪 Testando com o Arquivo .http

### Pré-requisitos
1. VS Code com extensão **REST Client** instalada (Huachao Mao)
2. NestJS rodando em `http://localhost:3000`

### TESTE 1: Registro Existente (200 OK)

Arquivo: `testes-find-by-id.http`

```http
# 1. Criar um usuário
POST {{baseUrl}}/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha_segura",
  "phone": "11999999999"
}

# 📌 Copie o ID da resposta (ex: "550e8400...")
```

```http
# 2. Buscar por ID existente
@userId = 550e8400-e29b-41d4-a716-446655440000

GET {{baseUrl}}/users/{{userId}}
```

**Resposta esperada (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "11999999999",
  "isActive": true,
  "createdAt": "2026-05-26T10:00:00.000Z",
  "updatedAt": "2026-05-26T10:00:00.000Z"
}
```

---

### TESTE 2: Registro NÃO Existente (404 Not Found)

```http
# Buscar por ID que NÃO existe
GET {{baseUrl}}/users/00000000-0000-0000-0000-000000000000
```

**Resposta esperada (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Usuário com ID \"00000000-0000-0000-0000-000000000000\" não foi encontrado.",
  "error": "Not Found"
}
```

---

## ✨ Código Chave Para Entender

### Injeção de Repositório
```typescript
// No constructor do service
@InjectRepository(User)
private readonly usersRepository: Repository<User>
```

### Busca com Where Clause
```typescript
// Busca um usuário onde ID = valor
const user = await this.usersRepository.findOne({
  where: { id }  // ← SQL: WHERE id = ?
});
```

### Lançamento de Erro 404
```typescript
if (!user) {
  // NotFoundException é capturada pelo NestJS
  // Convertida para HTTP 404 automaticamente
  throw new NotFoundException(
    `Usuário com ID "${id}" não foi encontrado.`
  );
}
```

---

## 📊 Comparação: Antes vs Depois

| Feature | Antes | Depois |
|---------|-------|--------|
| **Storage** | Map em memória | PostgreSQL |
| **Persistência** | ❌ Não persiste | ✅ Persiste |
| **Escalabilidade** | ❌ Limitada | ✅ Ilimitada |
| **Injeção Dep.** | ❌ Manual | ✅ Automática |
| **Query** | Busca linear | SQL otimizado |
| **Tipo de Retorno** | any | Tipado (User) |
| **Validação** | ✅ Tinha | ✅ Mantém |
| **HTTP 404** | ✅ Tinha | ✅ Mantém |

---

## 🎯 Checklist - Verifique Tudo

### ✅ Module
- [ ] TypeOrmModule.forFeature([Entity]) importado
- [ ] Entity registrada corretamente

### ✅ Service
- [ ] @InjectRepository(Entity) usado
- [ ] Repository<Entity> injetado
- [ ] findOne(id) usa repository.findOne({ where: { id } })
- [ ] NotFoundException lançado se não encontrado

### ✅ Controller
- [ ] @Get(':id') declarado
- [ ] @Param('id') usado
- [ ] Retorna Promise tipada
- [ ] Delega ao service (não acessa banco)

### ✅ Testes
- [ ] Arquivo .http criado
- [ ] Teste 1 com ID válido
- [ ] Teste 2 com ID inválido
- [ ] Status codes verificados

---

## 🚀 Próximos Passos

1. **Configurar Banco de Dados Real**
   ```bash
   # No main.ts
   const app = await NestFactory.create(AppModule);
   await app.listen(3000);
   ```

2. **Adicionar Validação com class-validator**
   ```bash
   pnpm add class-validator class-transformer
   ```

3. **Adicionar Documentação Swagger**
   ```bash
   pnpm add @nestjs/swagger swagger-ui-express
   ```

4. **Implementar Testes Unitários**
   ```bash
   pnpm test
   ```

---

## 📌 Resumo Final

Você implementou com sucesso:

✅ **GET /:id** com TypeORM
✅ **@Param('id')** para extrair parâmetro
✅ **repository.findOne()** para busca
✅ **NotFoundException** para HTTP 404
✅ **Testes** em arquivo .http
✅ **Padrão profissional** pronto para produção

**Congratulações! 🎉**


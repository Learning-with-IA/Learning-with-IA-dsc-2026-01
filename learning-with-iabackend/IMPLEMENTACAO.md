# 📚 Documentação - Leitura Detalhada por ID via API REST

## 🎯 Objetivo

Implementar um sistema CRUD completo com foco especial no **endpoint de leitura por ID** (`GET /:id`), seguindo o padrão REST API com validação adequada e tratamento de erros HTTP 404.

---

## 📂 Estrutura do Projeto

```
learning-with-iabackend/
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── dto/
│   │   │   │   └── user.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── events/
│   │   │   ├── dto/
│   │   │   │   └── event.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── event.entity.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   └── events.module.ts
│   │   └── payments/
│   │       ├── dto/
│   │       │   └── payment.dto.ts
│   │       ├── entities/
│   │       │   └── payment.entity.ts
│   │       ├── payments.controller.ts
│   │       ├── payments.service.ts
│   │       └── payments.module.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── api.rest (arquivo de testes)
└── package.json
```

---

## 🔄 Padrão CRUD Implementado

### Endpoints Disponíveis

#### **USERS**
| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| POST | `/users` | Criar novo usuário | 201 |
| GET | `/users` | Listar todos os usuários | 200 |
| **GET** | **`/users/:id`** | **Buscar usuário específico** | **200/404** |
| PATCH | `/users/:id` | Atualizar usuário | 200 |
| DELETE | `/users/:id` | Remover usuário | 200 |

#### **EVENTS**
| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| POST | `/events` | Criar novo evento | 201 |
| GET | `/events` | Listar todos os eventos | 200 |
| **GET** | **`/events/:id`** | **Buscar evento específico** | **200/404** |
| PATCH | `/events/:id` | Atualizar evento | 200 |
| DELETE | `/events/:id` | Remover evento | 200 |

#### **PAYMENTS**
| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| POST | `/payments` | Criar novo pagamento | 201 |
| GET | `/payments` | Listar todos os pagamentos | 200 |
| **GET** | **`/payments/:id`** | **Buscar pagamento específico** | **200/404** |
| PATCH | `/payments/:id` | Atualizar pagamento | 200 |
| DELETE | `/payments/:id` | Remover pagamento | 200 |

---

## 🎓 Conceito Principal: GET /:id

### Diferença entre GET / e GET /:id

**GET / — Listar todos**
```json
GET /users
[
  {
    "id": "1",
    "name": "João Silva"
  },
  {
    "id": "2",
    "name": "Maria Santos"
  }
]
```

**GET /:id — Buscar específico**
```json
GET /users/1
{
  "id": "1",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "11999999999",
  "createdAt": "2026-05-26T10:00:00Z"
}
```

### Fluxo Completo

```
Cliente REST → Rota com :id → Controller recebe @Param('id') → 
Service busca no banco → ✅ Encontrado? Retorna 200
                      → ❌ Não encontrado? Lança NotFoundException → 404
```

### Tratamento de Erro 404

Quando um registro não existe, a API retorna:

```json
GET /users/99999
{
  "statusCode": 404,
  "message": "Usuário com ID \"99999\" não foi encontrado.",
  "error": "Not Found"
}
```

**Por que 404?** Porque o cliente pediu por um recurso específico que não existe.

---

## 💻 Implementação Técnica

### Controller - Recebendo o Parâmetro

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}
```

O decorator `@Param('id')` extrai o ID da rota.

### Service - Buscando e Validando

```typescript
async findOne(id: string) {
  const user = users.get(id);
  if (!user) {
    throw new NotFoundException(`Usuário com ID "${id}" não foi encontrado.`);
  }
  return user;
}
```

Se não encontrar, lança `NotFoundException` → NestJS converte automaticamente para HTTP 404.

---

## 🧪 Testando com REST Client

### Pré-requisito

Instale a extensão "REST Client" no VS Code (Huachao Mao).

### Como Testar

1. **Abra o arquivo `api.rest`** na raiz do projeto
2. **Crie um usuário** clicando em "Send Request" no endpoint POST
3. **Copie o ID retornado** e substitua em `@userId`
4. **Teste o GET /:id** com o ID válido → deve retornar 200
5. **Teste com ID inexistente** → deve retornar 404

### Teste 1 - Registro Existente

```http
@userId = 1
GET http://localhost:3000/users/{{userId}}
```

**Resposta esperada:**
```json
{
  "id": "1",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2026-05-26T10:00:00Z",
  "updatedAt": "2026-05-26T10:00:00Z"
}
```

### Teste 2 - Registro Inexistente

```http
GET http://localhost:3000/users/99999
```

**Resposta esperada:**
```json
{
  "statusCode": 404,
  "message": "Usuário com ID \"99999\" não foi encontrado.",
  "error": "Not Found"
}
```

### Teste 3 - Confirmar Atualização

```http
### Consulta ANTES
GET http://localhost:3000/users/1

### Atualiza
PATCH http://localhost:3000/users/1
Content-Type: application/json

{
  "name": "João Silva - Novo Nome"
}

### Consulta DEPOIS
GET http://localhost:3000/users/1
```

---

## ⚙️ Como Executar

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Iniciar em modo desenvolvimento
```bash
pnpm start:dev
```

A API estará disponível em `http://localhost:3000`

### 3. Testar endpoints
- Abra o arquivo `api.rest`
- Clique em "Send Request" em qualquer endpoint

---

## 📋 Checklist de Implementação

✅ Endpoint GET /users/:id criado no controller
✅ Decorator @Param('id') utilizado corretamente
✅ Método findOne(id) implementado no service
✅ Validação com NotFoundException quando registro não encontrado
✅ Testes com REST Client cobrindo cenário 200 e 404
✅ Rota parametrizada declarada após rotas fixas
✅ DTOs criados para validação de entrada
✅ Entities estruturadas com timestamps
✅ Módulos exportados para reutilização

---

## 🔐 Separação de Responsabilidades

- **Controller**: Recebe parâmetros HTTP, delega ao service
- **Service**: Contém a lógica de busca, validação e tratamento de erros
- **Entity**: Define a estrutura do dados (com TypeORM pronto)
- **DTO**: Valida dados de entrada

---

## 📌 Pontos Importantes

1. **Ordem das rotas**: Rotas mais específicas (como `@Get('active')`) devem vir ANTES de rotas parametrizadas (`@Get(':id')`)

2. **Sempre retornar erro claro**: Não retorne `null` ou resposta vazia. Use `NotFoundException` para deixar explícito que o recurso não existe.

3. **Status HTTP correto**:
   - `200 OK` → Recurso encontrado
   - `404 Not Found` → Recurso não existe
   - `201 Created` → Recurso criado
   - `400 Bad Request` → Dados inválidos

---

## 🚀 Próximos Passos

1. Integrar com banco de dados real (PostgreSQL + TypeORM)
2. Adicionar validação com class-validator
3. Implementar autenticação e autorização
4. Adicionar paginação na listagem
5. Implementar filtros e busca
6. Criar testes unitários e e2e


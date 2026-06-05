# 🚀 Learning with AI - Backend

Plataforma inteligente de aprendizado que oferece suporte educacional 24/7 através de **agentes de IA calibrados com conteúdo dos cursos**.

## 🎯 Objetivo Principal

Cada curso tem um **agente de IA (LLM Notebook)** que:
- ✅ É carregado **apenas** com conteúdo do curso
- ✅ Responde perguntas dos alunos baseado em materiais didáticos
- ✅ Registra histórico de interações para análise
- ✅ Valida acesso apenas para alunos com matrícula ativa

## 🏗️ Arquitetura

```
Requisição HTTP
    ↓
Controller (valida entrada)
    ↓
Service (orquestra lógica)
    ↓
Repository (TypeORM)
    ↓
PostgreSQL
```

### 🤖 Fluxo do Agente de IA

```
1. Aluno faz pergunta → POST /cursos/:id/agente/query
2. Controller obtém agente + conteúdo do curso
3. AgenteIAService carrega conteúdo como contexto
4. LLM processa pergunta + contexto
5. Resposta é retornada + registrada em LogInteracao
6. Cliente recebe resposta + metadados
```

## 📦 Estrutura de Módulos

### `users/`
- CRUD de usuários (alunos/professores)
- Validação de dados com DTOs

### `events/`
- Gerenciamento de eventos acadêmicos
- Calendário de aulas

### `payments/`
- Histórico de pagamentos/matrículas
- Suporte para cursos gratuitos (RN03)

### `cursos/` ⭐ PRINCIPAL
```
cursos/
├── entities/
│   ├── curso.entity.ts           → Informações do curso
│   ├── curso-conteudo.entity.ts  → Materiais (texto, video, etc)
│   ├── curso-agente.entity.ts    → Configuração do agente de IA
│   └── log-interacao.entity.ts   → Rastreamento de queries
├── dto/
│   ├── curso-response.dto.ts
│   ├── curso-conteudo.dto.ts
│   └── curso-agente.dto.ts
├── services/
│   ├── agente-ia.service.ts      → 🤖 Integração com LLM
│   └── (cursos.service.ts já em raiz do módulo)
├── cursos.service.ts              → Orquestração principal
├── cursos.controller.ts           → Endpoints
└── cursos.module.ts              → Configuração
```

## 🔌 Endpoints Principais

### Autenticação (Auth)
```http
POST   /api/v1/auth/signup          → Registrar um novo estudante (STUDENT)
POST   /api/v1/auth/login           → Login e obtenção do token JWT (Retorna accessToken/access_token)
POST   /api/v1/auth/logout          → Invalidação do token JWT (Controle de sessão/Blacklist)
GET    /api/v1/auth/profile         → Obter dados do perfil autenticado
POST   /api/v1/auth/forgot-password → Solicitar redefinição de senha
POST   /api/v1/auth/reset-password  → Redefinir senha usando token temporário
```

### Gestão de Usuários (Users)
```http
POST   /api/v1/users                → Criar usuário administrativamente (Apenas ADMIN)
GET    /api/v1/users                → Listar usuários paginados com filtros (Apenas ADMIN)
GET    /api/v1/users/:id            → Obter detalhes de um usuário (ADMIN ou próprio Usuário)
PATCH  /api/v1/users/:id            → Atualizar dados cadastrais e senha (ADMIN ou próprio Usuário)
PATCH  /api/v1/users/:id/status     → Ativar/Desativar usuário logicamente (Apenas ADMIN)
DELETE /api/v1/users/:id            → Remover permanentemente um usuário (ADMIN ou próprio Usuário)
```

### Listar Cursos
```http
GET /api/v1/cursos
```

### Gerenciar Conteúdo do Curso
```http
POST   /api/v1/cursos/:cursoId/conteudo      → Adicionar material
GET    /api/v1/cursos/:cursoId/conteudo      → Listar materiais
PATCH  /api/v1/cursos/:cursoId/conteudo/:id  → Atualizar material
DELETE /api/v1/cursos/:cursoId/conteudo/:id  → Deletar material
```

### Agente de IA (Consulta ao Agente)
```http
POST   /api/v1/ia/chat                       → Interagir com o agente de IA do curso (UC07)
POST   /api/v1/cursos/:cursoId/agente/inicializar   → Criar agente do curso
GET    /api/v1/cursos/:cursoId/agente               → Obter config do agente
GET    /api/v1/cursos/:cursoId/agente/historico/:uid → Histórico
```

## 🛠️ Modelos de IA Suportados

| Modelo | Status | Integração |
|--------|--------|-----------|
| GPT-4 | 🚧 TODO | OpenAI API |
| GPT-3.5 | 🚧 TODO | OpenAI API |
| Claude | 🚧 TODO | Anthropic API |
| Gemini | ✅ Ativo | Google Generative AI API (Usado na UC07) |

---

## 🚀 Como Rodar

### Requisitos
- Node.js 20+
- Docker + Docker Compose
- pnpm

### Iniciar
```bash
# Instalar dependências
pnpm install

# Rodar com Docker
docker-compose build --no-cache
docker-compose up

# Ou localmente
pnpm start:dev
```

### Testar
```bash
# Listar cursos
curl http://localhost:3000/api/v1/cursos
```

---

## 🛠️ Como Testar com o REST Client (VS Code)

Para testar o fluxo de autenticação e autorização ponta a ponta sem o frontend:
1. Instale a extensão **REST Client** no VS Code.
2. Certifique-se de que a API e o banco de dados estejam rodando.
3. Abra o arquivo [requests/auth-flow.http](file:///c:/Users/guilh/Documents/trabalho/Learning-with-IA-dsc-2026-01/learning-with-iabackend/requests/auth-flow.http) e execute as requisições sequencialmente clicando em `Send Request` acima de cada endpoint.
4. Siga as instruções no arquivo para copiar o `accessToken` obtido e atualizar as variáveis `@userToken` e `@adminToken`.

---

## 📋 Checklist de Implementação

- ✅ Entidades TypeORM criadas
- ✅ DTOs para validação
- ✅ Service com lógica de orquestração
- ✅ Controller com endpoints
- ✅ Autenticação de usuários com JWT e segurança de senhas (hash com bcrypt)
- ✅ Guards de autorização baseados em papéis/RBAC (ADMIN, STUDENT, TEACHER)
- ✅ Endpoint GET /api/v1/auth/profile para recuperar dados do token
- ✅ Omissão automática de senhas nas respostas de usuários
- ✅ Integração com IA (Google Gemini na UC07 - Consulta ao Agente)
- ✅ RN01: Validação de Matrícula Ativa para conversar com o agente
- ✅ RN03: Todos os cursos são gratuitos (Payment)
- ✅ Testes unitários completos
- ✅ Testes E2E (de integração) completos

---

## 🔐 Regras de Negócio

**RN01**: Apenas alunos com matrícula ativa podem usar o agente
- ✅ Validado no service `CursosService` / endpoint `POST /api/v1/ia/chat`

**RN03**: Todos os cursos são gratuitos
- ✅ Implementado no módulo de pagamentos

---

## 📝 Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env` na raiz do backend:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=learning_db

# Security & JWT Configuration
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=1d

# OpenAI
OPENAI_API_KEY=sk_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini / Generative AI
GEMINI_API_KEY=sua_chave_da_gemini_aqui
```

---

## 👥 Arquitetura Organizacional

```
Aluno (User)
    ↓ matricula-se em
    Curso
        ↓ possui
        CursoConteudo (Materiais)
        ↓ alimenta
        CursoAgente (IA)
        ↓ responde queries
        LogInteracao (Histórico)
```

---

**Desenvolvido com ❤️ usando NestJS + TypeORM + PostgreSQL**

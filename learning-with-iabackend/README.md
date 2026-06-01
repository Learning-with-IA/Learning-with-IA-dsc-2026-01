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

### Listar Cursos
```http
GET /api/v1/cursos
```

### Gerenciar Conteúdo do Curso
```http
POST   /api/v1/cursos/:cursoId/conteudo       → Adicionar material
GET    /api/v1/cursos/:cursoId/conteudo       → Listar materiais
PATCH  /api/v1/cursos/:cursoId/conteudo/:id  → Atualizar material
DELETE /api/v1/cursos/:cursoId/conteudo/:id  → Deletar material
```

### Agente de IA
```http
POST   /api/v1/cursos/:cursoId/agente/inicializar    → Criar agente
GET    /api/v1/cursos/:cursoId/agente                → Obter config
POST   /api/v1/cursos/:cursoId/agente/query          → Query (❌ MOCK)
GET    /api/v1/cursos/:cursoId/agente/historico/:uid → Histórico
```

## 🛠️ Modelos de IA Suportados

| Modelo | Status | Integração |
|--------|--------|-----------|
| GPT-4 | 🚧 TODO | OpenAI API |
| GPT-3.5 | 🚧 TODO | OpenAI API |
| Claude | 🚧 TODO | Anthropic API |
| LLAMA | 🚧 TODO | HuggingFace / Local |
| Custom | 🚧 TODO | Extensível |

> ⚠️ **Atualmente**: Respostas são simuladas (mock). Integração com LLM está scaffolded em `agente-ia.service.ts`

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

# Query agente (mock)
curl -X POST http://localhost:3000/api/v1/cursos/<id>/agente/query \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "O que é programação?"}'
```

## 📋 Checklist de Implementação

- ✅ Entidades TypeORM criadas
- ✅ DTOs para validação
- ✅ Service com lógica de orquestração
- ✅ Controller com endpoints
- ✅ Scaffolding de integração com IA
- 🚧 Integração com OpenAI/Claude/LLAMA
- 🚧 Autenticação de alunos
- 🚧 Guards de autorização (RN01)
- 🚧 Rate limiting
- 🚧 Testes unitários
- 🚧 Testes E2E

## 🔐 Regras de Negócio

**RN01**: Apenas alunos com matrícula ativa podem usar o agente
- 🚧 TODO: Validar status de matrícula antes de query

**RN03**: Todos os cursos são gratuitos
- ✅ Implementado no Payment

## 📚 Próximos Passos

1. **Autenticação JWT** → Adicionar guards para validar token
2. **Integração LLM** → Implementar chamadas reais aos modelos
3. **Cache de Respostas** → Redis para respostas frequentes
4. **Validação de Contexto** → Garantir resposta dentro do escopo
5. **Testes** → Unit + E2E completos
6. **API Docs** → Swagger/OpenAPI

## 📝 Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=learning_db

# OpenAI
OPENAI_API_KEY=sk_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# LLAMA (se usar local)
LLAMA_HOST=http://localhost:8000
```

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

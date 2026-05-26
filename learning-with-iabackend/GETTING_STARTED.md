# 🚀 Getting Started - Primeiros Passos

**⏱️ Tempo estimado: 5 minutos**

---

## 1️⃣ Instalar Dependências

Abra o terminal na pasta `learning-with-iabackend`:

```bash
pnpm install
```

Aguarde completar ✅

---

## 2️⃣ Iniciar o Servidor

No mesmo terminal:

```bash
pnpm start:dev
```

**Resultado esperado:**
```
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [RoutesResolver] AppController {/}:
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [RoutesResolver] UsersController {/users}:
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [RoutesResolver] EventsController {/events}:
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [RoutesResolver] PaymentsController {/payments}:
[Nest] 12345  - 05/26/2026, 10:30:00 AM     LOG [NestApplication] Nest application successfully started
```

✅ **Servidor rodando em:** `http://localhost:3000`

---

## 3️⃣ Instalar Extension REST Client

No VS Code:
1. Abra **Extensions** (Ctrl+Shift+X)
2. Procure por **"REST Client"** (de Huachao Mao)
3. Clique em **Install**

✅ **Pronto!**

---

## 4️⃣ Abrir Arquivo de Testes

Na raiz de `learning-with-iabackend`, abra o arquivo **`api.rest`**

Você verá vários testes como este:

```http
### [CREATE USER 1]
POST {{baseUrl}}/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "11999999999"
}
```

---

## 5️⃣ Executar Seu Primeiro Teste

### Teste 1: Criar um Usuário

1. Localize a seção **`[CREATE USER 1]`** no `api.rest`
2. Clique em **"Send Request"** (aparece acima do código)
3. Veja a resposta no painel lateral

**Resposta esperada:**
```json
{
  "id": "1",
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "11999999999",
  "createdAt": "2026-05-26T10:35:42.123Z",
  "updatedAt": "2026-05-26T10:35:42.123Z",
  "isActive": true
}
```

**Copie o `id` que apareceu na resposta** (provavelmente `"1"`)

---

## 6️⃣ Testar o GET /:id (O Principal!)

### Teste 2: Buscar Usuário que Existe

1. Localize a seção **`[READ USER BY ID 1 - Registro existente]`**
2. Veja que há `@userId = 1` (o ID que você copiou)
3. Clique em **"Send Request"**

**Resposta esperada:** (200 OK)
```json
{
  "id": "1",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2026-05-26T10:35:42.123Z"
}
```

### Teste 3: Buscar Usuário que NÃO Existe

1. Localize a seção **`[READ USER BY ID 2 - Registro inexistente]`**
2. Clique em **"Send Request"**

**Resposta esperada:** (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Usuário com ID \"99999\" não foi encontrado.",
  "error": "Not Found"
}
```

---

## 7️⃣ Entender o Resultado

### ✅ Teste 2 (200 OK)
```
Status Code: 200
Mensagem: Registro ENCONTRADO
Corpo: Dados completos do usuário
```

### ❌ Teste 3 (404 Not Found)
```
Status Code: 404
Mensagem: Registro NÃO ENCONTRADO
Corpo: Erro descritivo com contexto
```

---

## 8️⃣ Próximos Testes

Dentro do `api.rest`, encontre e teste cada um:

```
✅ [CREATE USER 1]         - Criar usuário
✅ [READ ALL USERS]        - Listar todos
✅ [READ USER BY ID 1]     - Buscar específico ⭐
✅ [UPDATE USER]           - Atualizar
✅ [DELETE USER]           - Deletar

✅ [CREATE EVENT 1]        - Mesmo padrão para eventos
✅ [READ EVENT BY ID 1]    - Buscar evento ⭐

✅ [CREATE PAYMENT 1]      - Mesmo padrão para pagamentos
✅ [READ PAYMENT BY ID 1]  - Buscar pagamento ⭐
```

---

## 📊 Checklist - Você Conseguiu!

- ✅ Instalou pnpm install
- ✅ Iniciou pnpm start:dev
- ✅ Instalou REST Client
- ✅ Abriu api.rest
- ✅ Criou um usuário
- ✅ Buscou por ID (200 OK)
- ✅ Testou ID inexistente (404 Not Found)

---

## 🎓 O Que Você Acabou de Aprender

```
GET /users/1    ← Esta é a rota do seu PDF!
     ↓
Se encontrar → Retorna 200 OK + dados
     ↓
Se NÃO encontrar → Retorna 404 Not Found + erro
```

---

## 📚 Leia Depois

1. **RESUMO_EXECUTIVO.md** - Visão geral de tudo
2. **IMPLEMENTACAO.md** - Entenda cada conceito
3. **DIAGRAMAS.md** - Visualize os fluxos
4. **SKILLS_GUIDE.md** - Boas práticas (prof enviou)

---

## ❓ Dúvidas Comuns

### P: O servidor parou ou dá erro?
**R:** Digite `Ctrl+C` no terminal, depois `pnpm start:dev` novamente

### P: REST Client não está funcionando?
**R:** Reabra o arquivo `api.rest` ou reinicie VS Code

### P: Mudei o código e quer usar logo?
**R:** O modo `--watch` recompila automaticamente. Recarregue o teste.

### P: Como faço para usar com banco de dados real?
**R:** Leia a seção "Próximos Passos" em `IMPLEMENTACAO.md`

---

## 🎉 Sucesso!

Você completou todos os objetivos do seu PDF:

✅ **Endpoint GET /:id criado**
✅ **Receber parâmetros com @Param**
✅ **Buscar no service com validação**
✅ **Retornar erro 404 quando não existir**
✅ **Testar com REST Client**
✅ **Estrutura para CRUD completo**

**Parabéns! 🚀**


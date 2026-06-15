import json
import os
import sys
import urllib.request
import urllib.error

# Configurações do Repositório
REPO = "Learning-with-IA/Learning-with-IA-dsc-2026-01"

# Definição das Issues
ISSUES_PLAN = [
    # --- MÓDULO 1: AUTENTICAÇÃO E AUTORIZAÇÃO ---
    {
        "key": "epic_auth",
        "title": "[Epic] Implementação do Módulo de Autenticação e Autorização (Auth)",
        "body": """Implementação completa do ecossistema de autenticação e autorização para a plataforma de cursos gratuitos. Este módulo gerenciará o cadastro inicial de usuários, login, logout, recuperação de senha, geração e controle de sessões via JWT e autorização baseada em papéis (RBAC).

**Regra de Negócio Associada**:
- RN01: Apenas alunos com matrícula ativa podem consultar os agentes de IA.

### Critérios de Aceitação
- [ ] Usuários podem se registrar e autenticar com segurança (senhas criptografadas com bcrypt).
- [ ] Controle de sessão por meio de tokens JWT expirantes.
- [ ] Rotas protegidas exigem token JWT válido (401 Unauthorized se ausente/inválido).
- [ ] Controle de acesso por papéis (ex: `ADMIN`, `STUDENT`) implementado e validado.
- [ ] Cobertura de testes unitários e de integração superior a 80%.
- [ ] Documentação completa dos endpoints no Swagger/OpenAPI.
""",
        "is_epic": True
    },
    {
        "key": "auth_1.1",
        "parent": "epic_auth",
        "title": "[Auth] 1.1 - Registro de Usuários (Sign-up)",
        "body": """Implementação da rota e lógica de cadastro de novos usuários na plataforma. As senhas devem ser salvas de forma segura no banco de dados.

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/auth/signup` criado e funcional.
- [ ] Dados validados com DTOs (e-mail válido, senha forte com tamanho mínimo de 6 caracteres).
- [ ] Retorna erro 400 se e-mail já estiver cadastrado.
- [ ] Senha armazenada como hash bcrypt.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar arquivo `auth.service.spec.ts` com testes para:
  - [ ] Cadastro com sucesso.
  - [ ] Cadastro com e-mail duplicado (lança ConflictException).
  - [ ] Cadastro com senha fraca (lança BadRequestException).
- [ ] **[VERDE]** Implementar o serviço de registro:
  - [ ] Criptografia de senha usando `bcrypt`.
  - [ ] Chamada ao repositório `IUserRepository` para verificar duplicidade e salvar dados.
"""
    },
    {
        "key": "auth_1.2",
        "parent": "epic_auth",
        "depends_on": "auth_1.1",
        "title": "[Auth] 1.2 - Login e Geração de Token JWT (Sign-in)",
        "body": """Implementação da rota de autenticação de usuários cadastrados com validação de senha e geração de token de acesso JWT contendo informações do usuário (ID, email, roles).

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/auth/login` criado e funcional.
- [ ] Retorna token JWT válido se credenciais estiverem corretas.
- [ ] Retorna erro 401 Unauthorized se credenciais forem inválidas.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Adicionar testes em `auth.service.spec.ts` para:
  - [ ] Login com sucesso (retorna accessToken e metadados).
  - [ ] Login com senha incorreta (lança UnauthorizedException).
  - [ ] Login com e-mail inexistente (lança UnauthorizedException).
- [ ] **[VERDE]** Implementar a lógica de login:
  - [ ] Comparação da senha usando `bcrypt.compare`.
  - [ ] Geração do token JWT com payload assinado (`@nestjs/jwt`).
"""
    },
    {
        "key": "auth_1.3",
        "parent": "epic_auth",
        "depends_on": "auth_1.2",
        "title": "[Auth] 1.3 - Logout e Controle de Sessão",
        "body": """Implementação do mecanismo de encerramento de sessão (logout) do usuário, invalidando o token de acesso de forma segura.

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/auth/logout` criado.
- [ ] Tokens invalidados após logout (usando cache ou blacklist).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Adicionar testes para:
  - [ ] Logout com token válido (retorna 200 OK).
  - [ ] Tentativa de uso de token após logout (retorna 401 Unauthorized).
- [ ] **[VERDE]** Implementar controle de sessão:
  - [ ] Lógica de blacklist de tokens invalidados.
"""
    },
    {
        "key": "auth_1.4",
        "parent": "epic_auth",
        "depends_on": "auth_1.1",
        "title": "[Auth] 1.4 - Recuperação de Senha (Password Recovery)",
        "body": """Fluxo para usuários que esqueceram suas senhas. Envolve geração de token de uso único com expiração e redefinição de senha.

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/auth/forgot-password` para solicitar recuperação (gera token temporário de 15 min).
- [ ] Endpoint `POST /api/v1/auth/reset-password` para definir nova senha enviando o token.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes para:
  - [ ] Geração de token de recuperação.
  - [ ] Validação de token expirado ou inválido.
  - [ ] Redefinição bem-sucedida de senha.
- [ ] **[VERDE]** Implementar fluxo de recuperação:
  - [ ] Geração segura de hash de token.
  - [ ] Envio simulado de e-mail com token.
  - [ ] Validação e atualização de senha no repositório.
"""
    },
    {
        "key": "auth_1.5",
        "parent": "epic_auth",
        "depends_on": "auth_1.2",
        "title": "[Auth] 1.5 - Guards de Autenticação (JWT Guard)",
        "body": """Implementar um Guard do NestJS para interceptar requisições em rotas protegidas e validar a presença e assinatura do token JWT.

### Critérios de Aceitação
- [ ] Rotas decoradas com `@UseGuards(JwtAuthGuard)` recusam acesso sem token válido (401 Unauthorized).
- [ ] Payload decodificado do JWT é anexado ao objeto de request (`req.user`).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes para o Guard:
  - [ ] Bloqueio de requisição sem cabeçalho Authorization.
  - [ ] Bloqueio com token malformado ou expirado.
  - [ ] Permissão com token válido.
- [ ] **[VERDE]** Implementar `JwtAuthGuard`:
  - [ ] Estender Passport JWT Strategy no NestJS.
"""
    },
    {
        "key": "auth_1.6",
        "parent": "epic_auth",
        "depends_on": "auth_1.5",
        "title": "[Auth] 1.6 - Autorização Baseada em Papéis (RBAC - Roles Guard)",
        "body": """Implementar controle de acesso baseado em perfis/roles (ex: admin, aluno) nas rotas da API.

### Critérios de Aceitação
- [ ] Decorador `@Roles(...)` e `RolesGuard` criados.
- [ ] Usuário autenticado sem o papel requerido recebe erro 403 Forbidden.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes para o `RolesGuard`:
  - [ ] Bloqueio de rota de administrador para usuário com papel de aluno.
  - [ ] Acesso concedido se o usuário possui a role necessária.
- [ ] **[VERDE]** Implementar `RolesGuard` e decorador de metadados `@Roles`.
"""
    },
    {
        "key": "auth_1.7",
        "parent": "epic_auth",
        "depends_on": "auth_1.6",
        "title": "[Auth] 1.7 - Documentação Swagger e Testes E2E",
        "body": """Documentação Swagger para os endpoints de Auth e escrita de testes de ponta a ponta (E2E) simulando o fluxo de ponta a ponta de autenticação.

### Critérios de Aceitação
- [ ] Suíte de testes E2E em `test/auth.e2e-spec.ts` cobrindo registro -> login -> acesso protegido -> logout.
- [ ] Swagger documenta todos os endpoints de autenticação e seus schemas de DTO.

### Checklist de Tarefas
- [ ] Criar testes E2E em `test/auth.e2e-spec.ts`.
- [ ] Adicionar decorators do Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) nos controllers do módulo de autenticação.
"""
    },

    # --- MÓDULO 2: GESTÃO DE USUÁRIOS ---
    {
        "key": "epic_user",
        "title": "[Epic] Implementação do Módulo de Gestão de Usuários (User Management)",
        "body": """Implementação da gestão administrativa e de perfil dos usuários na plataforma. Abrange as operações de busca, filtragem avançada de usuários cadastrados, atualização de informações pessoais, e ativação/desativação lógica de contas.

### Critérios de Aceitação
- [ ] CRUD completo de usuários operacional e seguro.
- [ ] Listagem de usuários com paginação e suporte a filtros (nome, email, role, isActive).
- [ ] Alteração de dados cadastrais (nome, telefone) validada e protegida.
- [ ] Inativação lógica implementada (impedindo logins subsequentes de usuários desativados).
- [ ] Cobertura de testes unitários superior a 80%.
- [ ] Endpoints documentados.
""",
        "is_epic": True
    },
    {
        "key": "user_2.1",
        "parent": "epic_user",
        "title": "[User] 2.1 - CRUD de Usuários - Leitura e Deleção",
        "body": """Refatoração e validação da busca de usuário por ID e da deleção lógica ou física conforme regras de LGPD/auditoria da plataforma.

### Critérios de Aceitação
- [ ] Endpoint `GET /api/v1/users/:id` retorna dados do usuário (exceto senha).
- [ ] Endpoint `DELETE /api/v1/users/:id` remove o usuário e retorna mensagem de sucesso.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Atualizar testes em `users.service.spec.ts` para verificar:
  - [ ] Busca de usuário existente retorna dados limpos.
  - [ ] Busca de usuário inexistente lança NotFoundException.
  - [ ] Deleção de usuário remove o registro.
- [ ] **[VERDE]** Ajustar lógica nos métodos `findOne` e `remove` do `UsersService` para usar `IUserRepository`.
"""
    },
    {
        "key": "user_2.2",
        "parent": "epic_user",
        "depends_on": "user_2.1",
        "title": "[User] 2.2 - Listagem Paginada de Usuários com Filtros",
        "body": """Aprimorar a listagem de usuários para retornar resultados paginados e permitir filtros para auxiliar a administração do sistema.

### Critérios de Aceitação
- [ ] Endpoint `GET /api/v1/users` suporta query params `page`, `limit`, `name`, `email`, `role`, `isActive`.
- [ ] Resultados retornados com metadados de paginação (total, páginas, página atual).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Adicionar testes em `users.service.spec.ts` para:
  - [ ] Retorno paginado básico (ex: limit=10 retorna 10 itens).
  - [ ] Filtragem por nome parcial e email.
  - [ ] Filtragem por status de atividade (`isActive`).
- [ ] **[VERDE]** Implementar lógica no repositório `IUserRepository` e no `UsersService` para gerar consultas parametrizadas.
"""
    },
    {
        "key": "user_2.3",
        "parent": "epic_user",
        "depends_on": "user_2.1",
        "title": "[User] 2.3 - Atualização de Dados Cadastrais (Update profile)",
        "body": """Permitir que usuários e administradores atualizem dados do perfil cadastrado, aplicando regras de validação.

### Critérios de Aceitação
- [ ] Endpoint `PATCH /api/v1/users/:id` funcional.
- [ ] Valida formato do telefone se informado.
- [ ] Impede alteração de campos críticos como `email` e `password` através desta rota (devem possuir fluxos próprios).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Adicionar testes em `users.service.spec.ts` para:
  - [ ] Atualização de nome e telefone válidos.
  - [ ] Ignorar tentativas de alteração de senha/e-mail no payload.
- [ ] **[VERDE]** Implementar a lógica de mapeamento e validação de DTO no método `update`.
"""
    },
    {
        "key": "user_2.4",
        "parent": "epic_user",
        "depends_on": "user_2.1",
        "title": "[User] 2.4 - Ativação/Desativação de Usuários (Soft Delete)",
        "body": """Implementação de controle lógico de ativação de conta. Usuários desativados devem ser mantidos na base para integridade referencial histórica, mas impedidos de interagir com o sistema.

### Critérios de Aceitação
- [ ] Endpoint `PATCH /api/v1/users/:id/status` para ativar ou desativar usuário.
- [ ] Usuários com `isActive: false` são bloqueados na autenticação de login (Subissue 1.2).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Adicionar testes para:
  - [ ] Alteração de status `isActive` para false.
  - [ ] Tentativa de login de usuário inativo falha (401 Unauthorized).
- [ ] **[VERDE]** Implementar a alteração do campo `isActive` no banco e adicionar validação no fluxo de login do `AuthService`.
"""
    },
    {
        "key": "user_2.5",
        "parent": "epic_user",
        "depends_on": "user_2.4",
        "title": "[User] 2.5 - Documentação Swagger e Testes E2E",
        "body": """Garantir cobertura com testes E2E do ciclo completo de gerenciamento de usuários e documentar os novos parâmetros de listagem e filtros.

### Critérios de Aceitação
- [ ] Testes E2E cobrindo busca, atualização, paginação com filtros e remoção de usuários.
- [ ] Swagger documentando todos os parâmetros e esquemas.

### Checklist de Tarefas
- [ ] Criar testes E2E em `test/users.e2e-spec.ts`.
- [ ] Adicionar decorators do Swagger nos endpoints do controller de gerenciamento de usuários.
"""
    }
]

def create_issue(token, title, body):
    url = f"https://api.github.com/repos/{REPO}/issues"
    data = json.dumps({"title": title, "body": body}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "Antigravity-IDE-Agent"
        }
    )
    try:
        with urllib.request.urlopen(req) as res:
            response = json.loads(res.read().decode("utf-8"))
            return response["number"], response["html_url"]
    except urllib.error.HTTPError as e:
        print(f"Erro HTTP {e.code}: {e.read().decode('utf-8')}")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao conectar com API do GitHub: {e}")
        sys.exit(1)

def main():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        token = input("Digite seu Personal Access Token (PAT) do GitHub: ").strip()
    if not token:
        print("Token não fornecido. Abortando.")
        sys.exit(1)

    created_issues = {}  # key -> issue_number
    print("\nIniciando a criação de issues no GitHub...\n")

    for issue in ISSUES_PLAN:
        title = issue["title"]
        body = issue["body"]

        # Adicionar referências de dependências/pais no body
        if "parent" in issue:
            parent_key = issue["parent"]
            parent_num = created_issues.get(parent_key)
            if parent_num:
                body = f"**Epic Relacionada**: #{parent_num}\n\n" + body

        if "depends_on" in issue:
            dep_key = issue["depends_on"]
            dep_num = created_issues.get(dep_key)
            if dep_num:
                body = f"**Depende de**: #{dep_num}\n" + body

        print(f"Criando: {title}...")
        num, html_url = create_issue(token, title, body)
        created_issues[issue["key"]] = num
        print(f"Sucesso! Issue #{num} criada: {html_url}\n")

    print("Todas as issues foram criadas com sucesso no GitHub!")

if __name__ == "__main__":
    main()

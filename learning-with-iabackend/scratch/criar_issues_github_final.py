import json
import os
import sys
import urllib.request
import urllib.error

# Configurações do Repositório
REPO = "Learning-with-IA/Learning-with-IA-dsc-2026-01"

# Definição das Issues
ISSUES_PLAN = [
    # --- UC03: AUTENTICAÇÃO E AUTORIZAÇÃO ---
    {
        "key": "epic_auth",
        "title": "UC03 - Módulo de Autenticação e Autorização",
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
        "title": "UC03 - Fluxo de Registro, Login e Sessão (Sign-up, Sign-in, Sign-out)",
        "body": """Implementação do fluxo básico de ciclo de vida de autenticação, englobando o cadastro inicial do usuário (com criptografia de senha), o login (validação de credenciais e geração de token JWT expirável) e o encerramento seguro da sessão (logout com invalidação de token).

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/auth/signup` criado para registrar usuários (validação de dados por DTO, senha em hash bcrypt, impede e-mails duplicados).
- [ ] Endpoint `POST /api/v1/auth/login` para obtenção de token JWT assinado.
- [ ] Endpoint `POST /api/v1/auth/logout` para revogar/invalidar o token atual usando mecanismo de blacklist.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar suíte de testes unitários em `auth.service.spec.ts` cobrindo registro (sucesso, duplicidade, validação), login (sucesso, erro de senha, e-mail inexistente) e logout (invalidação de tokens).
- [ ] **[VERDE]** Implementar métodos correspondentes no `AuthService` utilizando `bcrypt`, `JwtService` e interagindo com `IUserRepository`.
- [ ] **[VERMELHO]** Criar testes de validação dos DTOs de login e registro.
- [ ] **[VERDE]** Definir `SignUpDto` e `LoginDto` com decorators do `class-validator` e `class-transformer`.
""",
    },
    {
        "key": "auth_1.2",
        "parent": "epic_auth",
        "depends_on": "auth_1.1",
        "title": "UC03 - Recuperação de Senha",
        "body": """Fluxo para que usuários que esqueceram suas senhas possam solicitar a redefinição de forma segura utilizando tokens temporários enviados por e-mail (mockado).

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/auth/forgot-password` que gera um token de uso único com expiração de 15 minutos e simula o envio do e-mail.
- [ ] Endpoint `POST /api/v1/auth/reset-password` que recebe o token e a nova senha, valida a validade/expiração e altera a senha no banco de dados.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes unitários para a geração, validação e aplicação do token de recuperação de senha (sucesso, erro de token expirado ou malformado).
- [ ] **[VERDE]** Implementar métodos `forgotPassword` e `resetPassword` no `AuthService` com persistência segura do token temporário no banco de dados e atualização com hash bcrypt.
""",
    },
    {
        "key": "auth_1.3",
        "parent": "epic_auth",
        "depends_on": "auth_1.1",
        "title": "UC03 - Middleware de Autenticação (Guards) e Controle de Acesso Baseado em Perfis (RBAC)",
        "body": """Criação de interceptadores (Guards) de rotas do NestJS para garantir o acesso restrito a endpoints protegidos e o controle de acesso baseado em papéis/roles de usuário (ex: ADMIN, STUDENT).

### Critérios de Aceitação
- [ ] `JwtAuthGuard` implementado e protegendo rotas que exijam autenticação, injetando o payload validado no objeto `request.user`.
- [ ] `RolesGuard` e decorador de metadados `@Roles(...)` criados e restringindo acesso de perfis (retorna 403 Forbidden se o usuário não possuir a permissão necessária).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes unitários para o `JwtAuthGuard` (bloqueio sem token, token inválido, permissão com token correto) e `RolesGuard` (bloqueio de aluno em rota administrativa).
- [ ] **[VERDE]** Implementar a estratégia `JwtStrategy` (estendendo PassportStrategy) e os interceptadores `JwtAuthGuard` e `RolesGuard`.
""",
    },
    {
        "key": "auth_1.4",
        "parent": "epic_auth",
        "depends_on": "auth_1.3",
        "title": "UC03 - Testes E2E e Documentação da API (Swagger)",
        "body": """Garantia da cobertura de testes integrados e geração da documentação pública OpenAPI para todos os endpoints do módulo de autenticação.

### Critérios de Aceitação
- [ ] Arquivo `test/auth.e2e-spec.ts` criado e cobrindo o fluxo completo: registro -> login -> chamada autenticada -> logout -> rejeição subsequente.
- [ ] Documentação completa dos endpoints, DTOs e códigos de retorno HTTP no Swagger.

### Checklist de Tarefas
- [ ] Criar testes integrados em `test/auth.e2e-spec.ts`.
- [ ] Adicionar decorators do Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`) nos controllers do módulo de autenticação.
""",
    },

    # --- UC05: GESTÃO DE USUÁRIOS ---
    {
        "key": "epic_user",
        "title": "UC05 - Módulo de Gestão de Usuários",
        "body": """Implementação da gestão administrativa e de perfil dos usuários na plataforma. Abrange as operações de criação administrativa, busca, filtragem avançada de usuários cadastrados, atualização de informações pessoais, e ativação/desativação lógica de contas.

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
        "title": "UC05 - CRUD de Usuários e Validações de Negócio (Create, Read, Update, Delete)",
        "body": """Implementação das operações individuais de CRUD de usuário: criação por administrador (com definição de papéis), recuperação detalhada por ID (ocultando informações sensíveis como a senha), atualização cadastral sanitizada e exclusão física/lógica de registros.

### Critérios de Aceitação
- [ ] Endpoint `POST /api/v1/users` restrito a administradores para criação direta de usuários com role específica.
- [ ] Endpoint `GET /api/v1/users/:id` retornando dados sanitizados (exclui a senha do JSON de retorno).
- [ ] Endpoint `PATCH /api/v1/users/:id` permitindo atualização de dados (nome, telefone), impedindo atualização de e-mail e senha por esta rota.
- [ ] Endpoint `DELETE /api/v1/users/:id` que remove o usuário do sistema.
- [ ] Validação de propriedade: usuário comum só interage com o próprio perfil; administradores gerenciam qualquer um.

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes em `users.service.spec.ts` cobrindo a criação (sucesso, e-mail duplicado), recuperação de ID (sucesso, não encontrado), atualização (dados válidos, tentativa de alterar e-mail/senha) e deleção.
- [ ] **[VERDE]** Implementar métodos correspondentes no `UsersService` integrados ao repositório `IUserRepository`.
- [ ] **[VERMELHO]** Criar testes unitários para a regra de propriedade e restrição de perfil nos endpoints GET, PATCH e DELETE.
- [ ] **[VERDE]** Injetar validações de propriedade e Guards no `UsersController`.
""",
    },
    {
        "key": "user_2.2",
        "parent": "epic_user",
        "depends_on": "user_2.1",
        "title": "UC05 - Listagem Paginada de Usuários com Busca e Filtros",
        "body": """Aprimorar a listagem de usuários do sistema, permitindo que administradores realizem buscas avançadas com filtros customizados e limites paginados.

### Critérios de Aceitação
- [ ] Endpoint `GET /api/v1/users` suportando query params `page`, `limit`, `name` (parcial), `email` (parcial), `role` e `isActive`.
- [ ] Retorno padronizado contendo a lista e metadados de paginação (total, páginas, página atual).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes unitários em `users.service.spec.ts` validando o comportamento de múltiplos filtros e paginação correta.
- [ ] **[VERDE]** Implementar a lógica parametrizada de buscas usando o QueryBuilder do TypeORM no repositório de usuários.
- [ ] **[VERMELHO]** Criar testes de validação dos query params de busca.
- [ ] **[VERDE]** Definir `GetUsersFilterDto` com regras de validação para os filtros da requisição.
""",
    },
    {
        "key": "user_2.3",
        "parent": "epic_user",
        "depends_on": "user_2.1",
        "title": "UC05 - Controle de Ativação e Desativação Lógica de Usuários",
        "body": """Implementação do controle lógico de inativação de contas (Soft Delete). Usuários inativos devem permanecer na base de dados para conformidade referencial e auditoria, porém ficam impedidos de autenticar.

### Critérios de Aceitação
- [ ] Endpoint `PATCH /api/v1/users/:id/status` para alternar o campo `isActive` (restrito a administradores).
- [ ] Tentativas de login por usuários desativados (`isActive: false`) retornam erro de credenciais inválidas / inativas (401 Unauthorized).

### Checklist de Tarefas (TDD)
- [ ] **[VERMELHO]** Criar testes unitários para a alteração de status ativo/inativo e testes no fluxo de login para contas inativas.
- [ ] **[VERDE]** Adicionar o método de ativação/desativação no `UsersService` e interceptar o login no `AuthService` para verificar a propriedade `isActive`.
""",
    },
    {
        "key": "user_2.4",
        "parent": "epic_user",
        "depends_on": "user_2.3",
        "title": "UC05 - Testes E2E e Documentação da API (Swagger)",
        "body": """Garantir a qualidade do fluxo integrado de gestão de usuários através de testes E2E e publicar a respectiva documentação no Swagger/OpenAPI.

### Critérios de Aceitação
- [ ] Arquivo `test/users.e2e-spec.ts` com testes cobrindo o fluxo: criação por admin -> listagem parametrizada -> atualização cadastral -> inativação -> deleção.
- [ ] Swagger configurado documentando todos os parâmetros e retornos.

### Checklist de Tarefas
- [ ] Criar testes E2E em `test/users.e2e-spec.ts`.
- [ ] Adicionar decorators do Swagger (`@ApiTags`, `@ApiQuery`, `@ApiResponse`) no `UsersController`.
""",
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
        print("GITHUB_TOKEN não está definida no ambiente.")
        sys.exit(1)

    created_issues = {}  # key -> issue_number
    print("\nIniciando a criação de novas issues simplificadas no GitHub...\n")

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

    print("Todas as novas issues simplificadas foram criadas com sucesso no GitHub!")

if __name__ == "__main__":
    main()

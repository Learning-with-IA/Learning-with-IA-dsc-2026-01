# 📋 Guia de Preparação e Entrega da Atividade

Este documento foi criado para ajudar você a gravar os vídeos exigidos pelo professor Everton Coimbra de Araújo na atividade sobre **Autenticação, Autorização e Segurança de Senhas**.

Como o código backend, os testes (unitários/E2E), e as issues já foram 100% implementados e validados, a sua entrega consiste em demonstrar o funcionamento prático da API através de capturas de tela/vídeos.

---

## 🛠️ Passo 1: Preparar o Ambiente

Antes de iniciar as gravações, certifique-se de que a API e o banco de dados estejam rodando:

1. **Subir o Banco de Dados:**
   Se estiver usando Docker, execute no terminal:
   ```bash
   docker-compose up -d
   ```
2. **Iniciar o Servidor da API:**
   Navegue até a pasta `learning-with-iabackend` e inicie o NestJS no modo de desenvolvimento:
   ```bash
   pnpm start:dev
   ```
   *A API estará acessível em `http://localhost:3000`.*
3. **Instalar a Extensão de Gravação:**
   Use ferramentas como OBS Studio, Loom, ou a ferramenta de captura do próprio Windows (`Win + Alt + R`) para gravar a sua tela.

---

## 📹 Passo 2: Gravar o Vídeo de Login (Sucesso e Fracasso)

**Objetivo:** Mostrar que a API valida credenciais e responde de forma segura.

1. Abra o arquivo `requests/auth-flow.http` no VS Code.
2. Inicie a gravação da tela.
3. **Fluxo de Fracasso (Senha Incorreta):**
   - Execute a requisição `POST /api/v1/auth/login` com uma senha incorreta.
   - Mostre o retorno **401 Unauthorized** com a mensagem `"Credenciais inválidas."`.
4. **Fluxo de Fracasso (E-mail Inexistente):**
   - Execute a requisição `POST /api/v1/auth/login` com um e-mail que não existe no banco.
   - Destaque que a API retorna o mesmo erro **401** genérico, impedindo a enumeração de e-mails de usuários.
5. **Fluxo de Sucesso:**
   - Execute a requisição `POST /api/v1/auth/login` com dados corretos de um usuário válido (ex: `marina.alves@example.com` ou `admin@example.com`).
   - Mostre o retorno **200 OK** contendo a estrutura com `access_token` e o objeto `user` (mostre que o campo `password` **não** é exibido no JSON de resposta).
6. Pare a gravação e salve o vídeo como `login-sucesso-fracasso`.

---

## 📹 Passo 3: Gravar o Vídeo da Rota Protegida (Sucesso e Fracasso)

**Objetivo:** Demonstrar o funcionamento dos Guards de autenticação e proteção baseada em token JWT.

1. Inicie a gravação da tela.
2. **Fluxo de Fracasso (Sem Token):**
   - Execute a requisição `GET /api/v1/auth/profile` sem enviar o cabeçalho de autorização.
   - Mostre o retorno **401 Unauthorized**.
3. **Fluxo de Fracasso (Token Inválido):**
   - Execute a requisição `GET /api/v1/auth/profile` enviando um token de teste inválido (ex: `Authorization: Bearer token_invalidado`).
   - Mostre o retorno **401 Unauthorized**.
4. **Fluxo de Fracasso (Formato de Header Incorreto):**
   - Execute a requisição `GET /api/v1/auth/profile` enviando o token diretamente sem a palavra `Bearer` antes dele.
   - Mostre o retorno **401 Unauthorized**.
5. **Fluxo de Sucesso (Token Válido):**
   - Copie o token JWT (`accessToken`) gerado no login de sucesso anterior.
   - Cole o token na variável `@userToken` do arquivo `.http`.
   - Execute a requisição `GET /api/v1/auth/profile` enviando o token correto no header `Authorization: Bearer {{userToken}}`.
   - Mostre o retorno **200 OK** com os dados detalhados do perfil do usuário logado.
6. **(Extra/Diferencial) Fluxo de Autorização por Perfil (RBAC):**
   - Execute `GET /api/v1/users` (que lista os usuários da plataforma) usando o token de estudante (`userToken`).
   - Mostre que a API retorna **403 Forbidden Resource** (bloqueio correto de nível de acesso).
   - Execute o mesmo endpoint utilizando o token do administrador (`adminToken`) e mostre o retorno **200 OK** listando os usuários do sistema sem expor as senhas.
7. Pare a gravação e salve o vídeo como `rota-protegida-sucesso-fracasso`.

---

## 🌟 Passo 4: Gravar o Vídeo Bônus (Apresentação e Dificuldades)

**Objetivo:** Apresentar a arquitetura adotada, o que foi aprendido e os desafios superados para ganhar nota bônus.

Prepare uma breve fala (1 a 2 minutos) abordando os seguintes pontos:

1. **O que foi aprendido:**
   - **Criptografia de via única:** Utilização do `bcrypt` para gerar hash de senhas de forma segura, tanto no registro de novos usuários quanto na redefinição/atualização de dados cadastrais.
   - **Autenticação Stateless:** Uso de tokens JWT e verificação através de `Passport` e `JwtStrategy` no NestJS.
   - **Blacklist de Tokens:** Como o logout foi implementado de forma segura em memória, invalidando o token após o encerramento da sessão ativa.
   - **Controle de Acesso Baseado em Perfis (RBAC):** Uso de guards (`JwtAuthGuard`, `RolesGuard`) e decorators customizados para assegurar que apenas usuários administradores gerenciem outros perfis.
2. **Dificuldades Encontradas e Como Foram Resolvidas:**
   - **Mutação de Mock em Testes Unitários:** *Explique que, durante os testes da suíte do `UsersService`, um teste modificava o objeto compartilhado `mockUser` na memória por referência. Isso fazia com que testes subsequentes, como o de ativação lógica de status (`updateStatus`), quebrassem porque recebiam dados alterados dos testes anteriores de atualização (`update`).*
   - **Resolução:** *A dificuldade foi superada re-declarando o `mockUser` de forma dinâmica e re-instanciando um objeto limpo a cada ciclo de execução no hook `beforeEach(async () => { ... })` do Jest, garantindo testes independentes e isolados.*

---

## 📤 Como Entregar a Atividade

Comprima ou hospede os vídeos gerados no Google Drive, YouTube (como não listado) ou Loom, e envie os links/arquivos na plataforma indicada pelo professor (ClassHero ou e-mail corporativo) juntamente com o link do seu repositório GitHub, que já contém todos os Pull Requests aprovados e issues encerradas.

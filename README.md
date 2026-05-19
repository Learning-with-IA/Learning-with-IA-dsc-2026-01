Learning with AI
🚀 Sobre o Projeto

O Learning with AI é uma plataforma inteligente de aprendizado desenvolvida para resolver o problema da morosidade no suporte acadêmico e a falta de personalização no atendimento ao aluno . O sistema utiliza agentes de IA calibrados com conteúdo proprietário da instituição para garantir suporte pedagógico 24/7.
🧠 O "Coração" do Sistema: UC07

O núcleo técnico deste projeto reside na Consulta ao Agente de IA (UC07) . Através dele, o aluno interage com um assistente que possui contexto acadêmico e histórico de conversas .

    Validação de Acesso (RN01): O sistema garante que apenas alunos com matrícula ativa e confirmada acessem a IA .

    IA Calibrada: Respostas baseadas estritamente em materiais didáticos validados pelos professores .

🏗️ Arquitetura e Camadas

O backend segue o padrão de arquitetura em camadas para garantir separação de responsabilidades e facilidade de manutenção :

    Controller: Recebe requisições HTTP e valida dados com Pydantic .

    Service: Orquestra as regras de negócio e validações (ex: RN01 e RN03) .

    Repository: Abstrai o acesso aos dados e consultas específicas .

    ORM (SQLAlchemy): Mapeia as entidades de domínio para o banco relacional .

    Database (PostgreSQL): Persistência robusta com integridade referencial .

🛠️ Tecnologias Utilizadas

    Linguagem: Python 3.11.

    Framework: FastAPI (REST Endpoints) .

    Banco de Dados: PostgreSQL 15 + Extensão pgvector para processamento de IA .

    Infraestrutura: Docker (Containerização e isolamento de rede) .

📂 Estrutura de Dados Principal

O sistema baseia-se em cinco entidades fundamentais para sustentar o domínio educacional :

    Aluno: Dados cadastrais e status acadêmico.

    Curso: Catálogo de materiais e política de preço fixo (RN03).

    Matricula: Vínculo entre aluno e curso com controle de vigência.

    Conteudo: Materiais proprietários para treinamento da IA.

    LogInteracao: Rastreabilidade completa das consultas realizadas à IA.

⚙️ Como Executar (Visão de Implantação)

O projeto está preparado para rodar em containers isolados via Docker :

    API Container: Executa o servidor ASGI (Uvicorn) com a aplicação FastAPI .

    DB Container: Instância do PostgreSQL configurada com backups e índices de otimização .

    Network: Comunicação via rede interna segura (bridge) .

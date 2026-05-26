# 📊 Diagramas de Arquitetura e Fluxo

## 🔄 Fluxo Completo GET /:id

```mermaid
sequenceDiagram
    participant Cliente as 🖥️ Cliente REST
    participant Controller as 🎯 Controller
    participant Service as ⚙️ Service
    participant DB as 💾 "Repository/DB"
    participant Error as ⚠️ Exception Handler

    Cliente->>Controller: GET /users/1
    activate Controller
    Note over Controller: @Get(':id')<br/>@Param('id') recebe "1"
    Controller->>Service: findOne("1")
    deactivate Controller

    activate Service
    Service->>DB: buscar usuário 1
    DB->>Service: usuário encontrado ✅
    Note over Service: if(!user)<br/>throw NotFoundException
    Service->>Controller: return usuario
    deactivate Service

    activate Controller
    Controller->>Cliente: HTTP 200 + dados
    deactivate Controller
    
    Note over Cliente: {<br/>"id": "1",<br/>"name": "João"<br/>}

    Cliente->>Controller: GET /users/9999
    activate Controller
    Controller->>Service: findOne("9999")
    deactivate Controller

    activate Service
    Service->>DB: buscar usuário 9999
    DB->>Service: usuário NÃO encontrado ❌
    Service->>Error: throw NotFoundException
    deactivate Service

    activate Error
    Error->>Cliente: HTTP 404 + mensagem
    deactivate Error

    Note over Cliente: {<br/>"statusCode": 404,<br/>"message": "não encontrado"<br/>}
```

---

## 📁 Estrutura de Pastas - Padrão Modular

```mermaid
graph TD
    A["📦 learning-with-iabackend"] -->|importa| B["🏗️ src/app.module.ts"]
    
    B -->|imports| U["👥 UsersModule"]
    B -->|imports| E["📅 EventsModule"]
    B -->|imports| P["💳 PaymentsModule"]
    
    U -->|exports| UC["🎯 UsersController"]
    U -->|exports| US["⚙️ UsersService"]
    
    UC -->|usa| US
    US -->|acessa| UD["💾 User Entity"]
    US -->|recebe| UDT["📝 User DTO"]
    
    E -->|exports| EC["🎯 EventsController"]
    E -->|exports| ES["⚙️ EventsService"]
    
    P -->|exports| PC["🎯 PaymentsController"]
    P -->|exports| PS["⚙️ PaymentsService"]
    
    style B fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style UC fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style US fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style UD fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
```

---

## 🔀 Decisão no Service: Encontrar vs Não Encontrar

```mermaid
flowchart TD
    A["⬇️ Requisição: GET /users/ID"]
    B["🔍 Service: Busca no banco"]
    C{Usuário<br/>encontrado?}
    D["✅ Retorna 200 OK<br/>+ objeto completo"]
    E["❌ Lança NotFoundException"]
    F["🔴 NestJS converte<br/>para HTTP 404"]
    G["📤 Response 404<br/>+ mensagem erro"]
    
    A --> B
    B --> C
    C -->|SIM| D
    C -->|NÃO| E
    E --> F
    F --> G
    D --> H["📤 Response 200<br/>+ dados do usuário"]
    
    style D fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style E fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style G fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
```

---

## 🎯 Mapeamento HTTP Methods para CRUD

```mermaid
graph LR
    CRUD["🔄 CRUD Operations"]
    
    CRUD --> CREATE["➕ CREATE"]
    CRUD --> READ["📖 READ"]
    CRUD --> UPDATE["✏️ UPDATE"]
    CRUD --> DELETE["🗑️ DELETE"]
    
    CREATE --> POST["POST /users"]
    POST --> S1["201 Created"]
    
    READ --> GETALL["GET /users"]
    READ --> GETID["GET /users/:id"]
    GETALL --> S2["200 OK Array"]
    GETID --> S3["200 OK Object"]
    GETID --> S4["404 Not Found"]
    
    UPDATE --> PATCH["PATCH /users/:id"]
    PATCH --> S5["200 OK Updated"]
    
    DELETE --> DEL["DELETE /users/:id"]
    DEL --> S6["200 OK Deleted"]
    
    style GETID fill:#FFD700,stroke:#FF8C00,stroke-width:3px,color:#000
    style S3 fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style S4 fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
```

---

## 📊 Comparação: GET / vs GET /:id

```mermaid
graph TB
    subgraph GET_ALL ["GET /users - Listar Todos"]
        A["🔍 Busca COLEÇÃO"]
        B["Retorna ARRAY"]
        C["Útil para: Listar, Filtrar, Paginar"]
        D["Status: 200"]
    end
    
    subgraph GET_ONE ["GET /users/:id - Buscar Específico"]
        E["🔍 Busca ITEM ÚNICO"]
        F["Retorna OBJETO"]
        G["Útil para: Detalhe, Editar, Deletar"]
        H["Status: 200 ou 404"]
    end
    
    GET_ALL --> I["[{id:1,...},{id:2,...}]"]
    GET_ONE --> J["{id:1,...}"]
    
    style GET_ALL fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style GET_ONE fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style I fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style J fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

## 🏗️ Camadas da Arquitetura

```mermaid
graph TB
    subgraph Presentation ["🎨 Presentation Layer"]
        REST["REST Client / Postman / Frontend"]
    end
    
    subgraph API ["🌐 HTTP Layer"]
        HTTP["HTTP Request/Response<br/>GET, POST, PATCH, DELETE"]
    end
    
    subgraph Application ["🎯 Application Layer"]
        Controller["Controller<br/>@Get, @Post, @Param"]
    end
    
    subgraph Business ["⚙️ Business Logic Layer"]
        Service["Service<br/>findOne, create, update<br/>Validação e Erros"]
    end
    
    subgraph Data ["💾 Data Access Layer"]
        Repository["Repository<br/>findOne, save, delete<br/>Acesso ao banco"]
    end
    
    subgraph Database ["🗄️ Database Layer"]
        DB["PostgreSQL / MongoDB<br/>Dados persistidos"]
    end
    
    REST --> HTTP
    HTTP --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB
    
    style REST fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style Controller fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style Service fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style Repository fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style DB fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

## 🔄 Fluxo Completo de uma Requisição

```mermaid
graph LR
    A["1️⃣ Cliente<br/>GET /users/1"] --> B["2️⃣ HTTP<br/>Recebe rota"]
    B --> C["3️⃣ Router<br/>Mapeia para<br/>controller"]
    C --> D["4️⃣ Controller<br/>@Param<br/>extrai ID"]
    D --> E["5️⃣ Service<br/>Busca dados<br/>Valida"]
    E --> F{Encontrou?}
    F -->|SIM| G["6️⃣ Retorna<br/>Objeto"]
    F -->|NÃO| H["6️⃣ Lança<br/>NotFoundException"]
    G --> I["7️⃣ HTTP 200<br/>+ JSON"]
    H --> J["7️⃣ HTTP 404<br/>+ Erro"]
    I --> K["8️⃣ Cliente<br/>Recebe resposta"]
    J --> K
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style G fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style H fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style I fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style J fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style K fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
```

---

## 📝 Estrutura de Um Módulo Completo

```mermaid
graph TB
    Module["👥 UsersModule<br/>@Module()"]
    
    Module --> Controller["UsersController<br/>@Controller('users')"]
    Module --> Service["UsersService<br/>@Injectable()"]
    
    Controller --> M1["@Get()<br/>findAll()"]
    Controller --> M2["@Get(':id')<br/>findOne(id)"]
    Controller --> M3["@Post()<br/>create(dto)"]
    
    Service --> S1["findAll()<br/>retorna array"]
    Service --> S2["findOne(id)<br/>🎯 COM VALIDAÇÃO"]
    Service --> S3["create(dto)<br/>salva novo"]
    
    M2 --> S2
    S2 --> V{Existe?}
    V -->|NÃO| E["throw<br/>NotFoundException"]
    V -->|SIM| R["return<br/>objeto"]
    
    E --> H["404<br/>Not Found"]
    R --> H2["200<br/>OK"]
    
    style M2 fill:#FFD700,stroke:#FF8C00,stroke-width:3px,color:#000
    style S2 fill:#FFD700,stroke:#FF8C00,stroke-width:3px,color:#000
    style H fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style H2 fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

**📌 Nota:** Todos esses fluxos e diagramas ajudam a entender como seu código funciona. O conceito principal é:

```
GET /:id → Busca ITEM ESPECÍFICO → 200 (encontrado) ou 404 (não encontrado)
```


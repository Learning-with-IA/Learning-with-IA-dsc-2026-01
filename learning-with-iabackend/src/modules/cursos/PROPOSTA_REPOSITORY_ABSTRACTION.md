# Proposta de Abstração do Repositório - Módulo de Cursos

## 📋 Análise Atual

Seu módulo utiliza diretamente os `Repository<T>` do TypeORM injetados através do `@InjectRepository`:

```typescript
// ATUAL - Acoplamento direto ao TypeORM
@InjectRepository(Curso)
private readonly cursosRepository: Repository<Curso>
```

O serviço chama métodos TypeORM diretamente em múltiplos pontos:
- `find()`, `findOne()`, `create()`, `save()`, `delete()`
- Em 4 repositórios diferentes (Curso, CursoConteudo, CursoAgente, LogInteracao)

## 🎯 Proposta de Implementação

### **PASSO 1: Criar Interfaces de Repositório**

**Arquivo:** `repositories/curso.repository.interface.ts`

```typescript
export interface ICursoRepository {
  listarCursosAtivos(): Promise<Curso[]>;
  obterCursoById(id: string): Promise<Curso | null>;
  salvarCurso(curso: Partial<Curso>): Promise<Curso>;
  deletarCurso(id: string): Promise<boolean>;
}
```

**Por que:** 
- ✅ Desacopla a lógica de negócio do banco de dados
- ✅ Permite trocar TypeORM por outro ORM sem alterar o serviço
- ✅ Facilita testes com mocks sem dependência do TypeORM
- ✅ Define contrato claro entre serviço e persistência

---

### **PASSO 2: Criar Implementação TypeORM**

**Arquivo:** `repositories/typeorm/curso.typeorm.repository.ts`

```typescript
@Injectable()
export class CursoTypeOrmRepository implements ICursoRepository {
  constructor(
    @InjectRepository(Curso)
    private readonly repository: Repository<Curso>,
  ) {}

  async listarCursosAtivos(): Promise<Curso[]> {
    return this.repository.find({
      where: { status: CursoStatus.ATIVO },
    });
  }

  async obterCursoById(id: string): Promise<Curso | null> {
    return this.repository.findOne({ where: { id } });
  }

  async salvarCurso(curso: Partial<Curso>): Promise<Curso> {
    const entity = this.repository.create(curso);
    return this.repository.save(entity);
  }

  async deletarCurso(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
```

**Por que:**
- ✅ Centraliza toda lógica de persistência em um único lugar
- ✅ Encapsula queries complexas do TypeORM
- ✅ Facilita manutenção e evolução futura
- ✅ Permite múltiplas implementações (Mock, In-Memory, outro BD)

---

### **PASSO 3: Criar Interfaces para Outras Entidades**

**Arquivos:** 
- `repositories/curso-conteudo.repository.interface.ts`
- `repositories/curso-agente.repository.interface.ts`
- `repositories/log-interacao.repository.interface.ts`

**Por que:**
- ✅ Consistência em todo o módulo
- ✅ Cada repositório fica responsável por sua entidade
- ✅ Escalabilidade - padrão replicável para outros módulos

---

### **PASSO 4: Atualizar o Serviço**

**Mudanças em:** `cursos.service.ts`

```typescript
// ANTES
constructor(
  @InjectRepository(Curso)
  private readonly cursosRepository: Repository<Curso>,
)

// DEPOIS
constructor(
  private readonly cursosRepository: ICursoRepository,
  private readonly conteudoRepository: ICursoConteudoRepository,
  // ...
)
```

**Por que:**
- ✅ Serviço depende de abstrações, não de implementações concretas
- ✅ Segue princípio SOLID (Dependency Inversion)
- ✅ Facilita testes sem mock de `Repository<T>`

---

### **PASSO 5: Atualizar o Módulo (Module Provider)**

**Mudanças em:** `cursos.module.ts`

```typescript
// NOVO
providers: [
  CursosService,
  {
    provide: ICursoRepository,
    useClass: CursoTypeOrmRepository,
  },
  {
    provide: ICursoConteudoRepository,
    useClass: CursoConteudoTypeOrmRepository,
  },
  // ... outros repositórios
],
```

**Por que:**
- ✅ Injeção de dependência declarativa
- ✅ Permite trocar implementação sem alterar código
- ✅ Facilita injeção de alternativas para testes (useValue, useFactory)

---

### **PASSO 6: Atualizar Testes do Serviço**

**Mudanças em:** `cursos.service.spec.ts`

```typescript
// ANTES - Mock do Repository<Curso> do TypeORM
{
  provide: getRepositoryToken(Curso),
  useValue: { find: jest.fn() }
}

// DEPOIS - Mock da interface
{
  provide: ICursoRepository,
  useValue: {
    listarCursosAtivos: jest.fn(),
    obterCursoById: jest.fn(),
    // ...
  }
}
```

**Por que:**
- ✅ Testes não precisam conhecer TypeORM
- ✅ Mock simples e focado na interface
- ✅ Testes mais rápidos (sem instanciar DataSource)
- ✅ Cenários de teste mais realistas

---

### **PASSO 7: Criar Testes para Repositórios**

**Novos arquivos:**
- `repositories/typeorm/curso.typeorm.repository.spec.ts`
- `repositories/typeorm/curso-conteudo.typeorm.repository.spec.ts`
- etc.

```typescript
describe('CursoTypeOrmRepository', () => {
  let repository: CursoTypeOrmRepository;
  let typeOrmRepo: Repository<Curso>;

  beforeEach(async () => {
    typeOrmRepo = createMock<Repository<Curso>>();
    repository = new CursoTypeOrmRepository(typeOrmRepo);
  });

  it('deve listar cursos ativos', async () => {
    jest.spyOn(typeOrmRepo, 'find').mockResolvedValueOnce([...]);
    const result = await repository.listarCursosAtivos();
    expect(result).toEqual([...]);
  });
});
```

**Por que:**
- ✅ Separa testes da lógica de persistência vs lógica de negócio
- ✅ Testes de repositório verificam integração com TypeORM
- ✅ Testes de serviço verificam apenas regras de negócio

---

## 📁 Estrutura de Arquivos Resultante

```
cursos/
├── repositories/
│   ├── curso.repository.interface.ts
│   ├── curso-conteudo.repository.interface.ts
│   ├── curso-agente.repository.interface.ts
│   ├── log-interacao.repository.interface.ts
│   └── typeorm/
│       ├── curso.typeorm.repository.ts
│       ├── curso.typeorm.repository.spec.ts
│       ├── curso-conteudo.typeorm.repository.ts
│       ├── curso-conteudo.typeorm.repository.spec.ts
│       ├── curso-agente.typeorm.repository.ts
│       ├── curso-agente.typeorm.repository.spec.ts
│       ├── log-interacao.typeorm.repository.ts
│       └── log-interacao.typeorm.repository.spec.ts
├── cursos.service.ts         (ATUALIZADO)
├── cursos.service.spec.ts    (ATUALIZADO)
├── cursos.module.ts          (ATUALIZADO)
├── cursos.controller.ts
├── entities/
├── dto/
└── services/
```

---

## ✅ Benefícios da Proposta

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Acoplamento** | Serviço ↔ TypeORM (forte) | Serviço ↔ Interface (fraco) |
| **Testabilidade** | Mock complexo de `Repository<T>` | Mock simples da interface |
| **Manutenibilidade** | Lógica de BD espalhada no serviço | Centralizada no repositório |
| **Flexibilidade** | Trocar BD requer alterar múltiplos pontos | Apenas a implementação |
| **Reutilização** | Interfaces do serviço? | Interfaces reutilizáveis em outros modules |

---

## ⚠️ Considerações Importantes

1. **Abstração não é obrigatória para tudo**: Use métodos simples (find, save) sem criar abstrações complexas
2. **Queries complexas**: Mova queries específicas para método na interface (ex: `buscarPorFiltro()`)
3. **Transações**: Considere adicionar suporte a transações na interface
4. **Pagination**: Interfacedefina tipo comum para resposta paginada

---

## 🚀 Próximos Passos (após aprovação)

1. Criar arquivos de interface
2. Criar implementações TypeORM
3. Atualizar cursos.service.ts
4. Atualizar cursos.module.ts (providers)
5. Refatorar testes do serviço
6. Criar testes dos repositórios
7. Validar que tudo funciona igual

---

## 📝 Exemplo de Chamada Antes vs Depois

### ANTES
```typescript
async listarCursosAtivos(): Promise<Curso[]> {
  return this.cursosRepository.find({
    where: { status: CursoStatus.ATIVO },
  });
}
```

### DEPOIS
```typescript
async listarCursosAtivos(): Promise<Curso[]> {
  return this.cursosRepository.listarCursosAtivos();
}
```

**Diferença:** Antes o serviço conhecia TypeORM; depois apenas chama método abstrato.


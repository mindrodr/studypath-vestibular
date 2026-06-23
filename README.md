# StudyPath — Plataforma SaaS de Gerenciamento de Estudos para Vestibular

> Projeto Integrador — Curso de Tecnologia em Análise e Desenvolvimento de Sistemas  
> Grupo: **Cristian Silva Rodrigues (RA: 924115784)** · **Kayky Henrique da Silva (RA: 924112141)**

---

## Sobre o Projeto

O **StudyPath** é uma plataforma SaaS que ajuda estudantes do Ensino Médio a se prepararem para vestibulares (ENEM, FUVEST, UNICAMP) de forma inteligente e personalizada.

**Funcionalidades principais:**
- Cronograma de estudos gerado automaticamente com base no perfil do aluno
- Banco de questões filtrado por banca, matéria e dificuldade
- Revisão com flashcards e algoritmo de repetição espaçada (SM-2)
- Dashboard de desempenho com gráficos por matéria
- Mapa de progresso do edital
- Recomendações de estudo e explicações via IA (GPT-4o)
- Notificações e lembretes personalizados

---

## Integrantes

| Nome | RA | GitHub |
|------|----|--------|
| Cristian Silva Rodrigues | 924115784 | [@mindrodr](https://github.com/mindrodr) |
| Kayky Henrique da Silva  | 924112141 | — |

---

## Links do Projeto

| Recurso | Link |
|---------|------|
| Protótipo Figma | [Abrir no Figma](https://www.figma.com/proto/PuPz8UZcRYo1LF3ZIv0qGm/StudyPath?node-id=0-1&t=jAqitq9TIiY2q19a-1) |
| Quadro Kanban | [GitHub Projects](https://github.com/mindrodr/studypath-vestibular/projects/1) |
| Documentação API | [OpenAPI / Swagger](./docs/api/openapi.yaml) |
| Script SQL | [studypath_schema.sql](./docs/database/studypath_schema.sql) |
| Diagramas C4 | [/docs/architecture](./docs/architecture/) |

---

##  Estrutura do Repositório

```
studypath-vestibular/
├── README.md
├── docs/
│   ├── architecture/          # Diagramas C4 em Mermaid
│   │   ├── c1-context.md
│   │   ├── c2-container.md
│   │   └── c3-component.md
│   ├── api/                   # Documentação OpenAPI
│   │   └── openapi.yaml
│   ├── database/              # Scripts SQL e modelagem NoSQL
│   │   ├── studypath_schema.sql
│   │   └── nosql-schemas.md
│   └── ux/                    # Wireframes e protótipos
│       └── wireframes.md
├── src/
│   ├── auth-service/          # Serviço de autenticação (Node.js + JWT)
│   │   ├── patterns/          # Padrões GoF aplicados
│   │   └── ...
│   ├── study-service/         # Serviço principal de estudos (Node.js)
│   │   ├── patterns/
│   │   └── ...
│   ├── analytics-service/     # Analytics (Python + FastAPI)
│   └── notification-service/  # Notificações (Node.js + Bull MQ)
└── frontend/                  # Web App (React + Vite)
    └── prototypes/            # Protótipos HTML das telas
```

---

## Arquitetura

### Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend Web | React + Vite + TypeScript |
| Mobile | React Native |
| API Gateway | Kong / AWS API Gateway |
| Auth Service | Node.js + JWT + OAuth 2.0 |
| Study Service | Node.js + Express + Prisma |
| Analytics Service | Python + FastAPI |
| Notification Service | Node.js + Bull MQ |
| Banco Relacional | MySQL 8.0 (AWS RDS) |
| Cache / Filas | Redis 7.0 (AWS ElastiCache) |
| Banco de Documentos | MongoDB Atlas |
| IA | OpenAI GPT-4o / GPT-4o-mini |
| Infraestrutura | AWS (EC2, RDS, ElastiCache, S3) |

### Diagrama C4 — Context (resumo)

```mermaid
graph TB
    A[Estudante Vestibulando] -->|Acessa via web/app| C[StudyPath SaaS]
    B[Escola / Cursinho]     -->|Gerencia alunos| C
    C -->|Autentica| D[Google OAuth 2.0]
    C -->|E-mails| E[SendGrid]
    C -->|Pagamentos| F[Stripe]
    C -->|Hospedado em| G[AWS Cloud]
```

---

## Padrões de Projeto (GoF) Aplicados

| Padrão | Categoria | Onde é usado |
|--------|-----------|-------------|
| Factory Method | Criacional | Sistema de notificações multi-canal |
| Strategy | Comportamental | Algoritmo de repetição espaçada (SM-2 / Leitner) |
| Observer | Comportamental | Eventos ao concluir sessão de estudo |
| Decorator | Estrutural | Controle de acesso por plano nos endpoints |

Veja o código em [`src/study-service/patterns/`](./src/study-service/patterns/)

---

## IA no StudyPath

| Funcionalidade | Modelo | Endpoint |
|----------------|--------|---------|
| Recomendação de estudo personalizada | GPT-4o-mini | `POST /ai/recommend` |
| Explicação de questões erradas | GPT-4o | `POST /ai/explain` |
| Geração automática de flashcards | GPT-4o-mini | `POST /ai/flashcards/generate` |

---

## Banco de Dados

### MySQL — Tabelas principais
`users` · `plans` · `subscriptions` · `schedules` · `schedule_sessions` · `questions` · `user_answers` · `topics_progress`

### MongoDB
Coleção `flashcards` com algoritmo SM-2 integrado.

### Redis
Hash de sessão · Sorted Set de streaks · List de filas · Rate limiting

---

## Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/mindrodr/studypath-vestibular.git
cd studypath-vestibular

# 2. Suba os bancos com Docker
docker-compose up -d mysql redis mongodb

# 3. Execute o script SQL
mysql -u root -p studypath < docs/database/studypath_schema.sql

# 4. Instale dependências do Study Service
cd src/study-service
npm install
cp .env.example .env   # configure as variáveis de ambiente

# 5. Rode o serviço
npm run dev

# 6. Acesse a documentação da API
# http://localhost:3000/api/docs
```

### Variáveis de Ambiente necessárias

```env
DATABASE_URL=mysql://root:password@localhost:3306/studypath
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/studypath
JWT_SECRET=sua-chave-secreta
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG....
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Status do Projeto

| Bloco | Conteúdo | Status |
|-------|----------|--------|
| Bloco 1 | Concepção — Problema, BMC, Requisitos, User Stories | Concluído |
| Bloco 2 | Design & UX — Personas, Wireframes, Figma, Usabilidade | Concluído |
| Bloco 3 | Arquitetura — C4, SQL, NoSQL, Diagrams as Code | Concluído |
| Bloco 4 | Desenvolvimento — GoF, APIs, IA, Checkpoint 2 | Concluído |
| Bloco 5 | Testes, Deploy e Apresentação Final | Concluído |

---

## Licença

Este projeto foi desenvolvido para fins acadêmicos — Projeto Integrador 2026.

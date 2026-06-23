# C4 — Nível Container (C2): StudyPath

## Diagrama

```mermaid
graph LR
    subgraph Clientes
        WEB[Web App\nReact + Vite]
        MOB[Mobile App\nReact Native]
    end

    subgraph StudyPath [StudyPath - Containers]
        GW[API Gateway\nKong / AWS]
        AUTH[Auth Service\nNode.js + JWT]
        STUDY[Study Service\nNode.js + Express]
        ANAL[Analytics Service\nPython + FastAPI]
        NOTIF[Notification Service\nNode.js + Bull MQ]
    end

    subgraph Dados
        MYSQL[(MySQL 8.0\nAWS RDS)]
        MONGO[(MongoDB Atlas)]
        REDIS[(Redis 7.0\nElastiCache)]
    end

    subgraph Externos
        OAI[OpenAI API]
        SG[SendGrid]
        ST[Stripe]
    end

    WEB  -->|HTTPS REST| GW
    MOB  -->|HTTPS REST| GW
    GW   --> AUTH
    GW   --> STUDY
    GW   --> ANAL
    GW   --> NOTIF
    AUTH  -->|SQL| MYSQL
    STUDY -->|SQL| MYSQL
    STUDY -->|Cache / Filas| REDIS
    STUDY -->|Documents| MONGO
    NOTIF -->|Filas| REDIS
    ANAL  -->|Documents| MONGO
    STUDY -->|IA| OAI
    NOTIF -->|E-mail| SG
    AUTH  -->|Pagamentos| ST
```

## Containers e Tecnologias

| Container | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| Web App | React + Vite + TypeScript | Ecossistema maduro, build rápido, componentização eficiente |
| Mobile App | React Native | Código compartilhado com Web, deploy iOS e Android, suporte offline |
| API Gateway | Kong / AWS API GW | Rate limiting, JWT centralizado, roteamento para microsserviços |
| Auth Service | Node.js + JWT | Alta performance para I/O, JWT stateless, OAuth 2.0 nativo |
| Study Service | Node.js + Express + Prisma | Assincronismo, ideal para operações de leitura/escrita frequentes |
| Analytics Service | Python + FastAPI | Python líder em análise de dados; FastAPI com tipagem via Pydantic |
| Notification Service | Node.js + Bull MQ | Bull MQ usa Redis para filas confiáveis com retry automático |
| MySQL 8.0 | AWS RDS | ACID compliance para dados críticos; backups e failover automático |
| Redis 7.0 | AWS ElastiCache | Cache de baixíssima latência para sessões, streaks e rate limiting |
| MongoDB Atlas | Atlas Cloud | Esquema flexível para flashcards heterogêneos e logs analíticos |

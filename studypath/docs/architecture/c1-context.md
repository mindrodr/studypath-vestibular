# C4 — Nível Context (C1): StudyPath

## Diagrama

```mermaid
graph TB
    subgraph Usuarios
        A[Estudante Vestibulando]
        B[Escola / Cursinho]
    end

    subgraph StudyPath_SaaS [StudyPath - Plataforma SaaS]
        C[StudyPath System]
    end

    subgraph Externos [Sistemas Externos]
        D[Google OAuth 2.0]
        E[SendGrid - Email]
        F[Stripe - Pagamentos]
        G[AWS Cloud]
        H[FCM / APNs - Push]
    end

    A -->|Acessa via web/app - faz login, estuda, visualiza progresso| C
    B -->|Gerencia alunos e visualiza relatórios institucionais| C
    C -->|Autentica usuários via OAuth 2.0| D
    C -->|Envia e-mails transacionais e notificações| E
    C -->|Processa assinaturas Premium e Institucional| F
    C -->|Hospedado e escalado na nuvem| G
    C -->|Envia push notifications mobile| H
```

## Elementos

| Elemento | Tipo | Descrição |
|----------|------|-----------|
| Estudante Vestibulando | Pessoa | Usuário principal. Acessa via app mobile ou web para estudar, praticar questões e acompanhar progresso. |
| Escola / Cursinho | Pessoa/Org | Administrador institucional. Cadastra alunos em lote e monitora desempenho da turma. |
| StudyPath [SaaS] | Sistema | Sistema principal. Gerencia cronogramas, questões, flashcards, desempenho e assinaturas. |
| Google OAuth 2.0 | Externo | Provedor de identidade para login social seguro. |
| SendGrid | Externo | Serviço de e-mail transacional para notificações e lembretes. |
| Stripe | Externo | Gateway de pagamento para planos Premium e Institucional. |
| AWS Cloud | Infra | Hospeda todos os serviços, bancos de dados e armazenamento. |
| FCM / APNs | Externo | Firebase Cloud Messaging e Apple Push Notification Service. |

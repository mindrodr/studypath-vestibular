# Modelagem NoSQL — StudyPath

## MongoDB — Coleção: `flashcards`

```json
{
  "_id": "ObjectId()",
  "user_id": "uuid-do-usuario",
  "subject": "Biologia",
  "topic": "Fotossíntese",
  "front": "O que é fotossíntese?",
  "back": "Processo pelo qual plantas convertem luz solar, CO₂ e água em glicose e O₂ usando clorofila.",
  "tags": ["biologia", "botanica", "enem"],
  "media_url": null,
  "latex": null,
  "sm2": {
    "interval_days": 7,
    "repetitions": 3,
    "ease_factor": 2.5,
    "next_review": "2026-06-30T00:00:00Z",
    "last_reviewed": "2026-06-23T14:30:00Z",
    "last_grade": 4
  },
  "review_history": [
    {
      "reviewed_at": "2026-06-16T10:00:00Z",
      "grade": 3,
      "interval_before": 3,
      "interval_after": 7
    }
  ],
  "created_at": "2026-06-10T09:00:00Z",
  "updated_at": "2026-06-23T14:30:00Z"
}
```

### Índices

```js
// Busca de cards por usuário e data de revisão (mais importante)
db.flashcards.createIndex({ "user_id": 1, "sm2.next_review": 1 })

// Busca por matéria e tópico
db.flashcards.createIndex({ "user_id": 1, "subject": 1, "topic": 1 })

// TTL: expira cards inativos após 1 ano
db.flashcards.createIndex({ "updated_at": 1 }, { expireAfterSeconds: 31536000 })
```

---

## Redis — Estruturas

### 1. Cache de Sessão (Hash + TTL)

```redis
# Chave: session:{user_id}:{jti}
# TTL: 604800s (7 dias)

HSET session:uuid-lucas:jti-abc123
    user_id    "uuid-lucas"
    name       "Lucas Mendes"
    email      "lucas@email.com"
    role       "student"
    plan       "premium"

EXPIRE session:uuid-lucas:jti-abc123 604800
```

### 2. Streak de Estudo (Sorted Set + Hash)

```redis
# Ranking global de streaks
ZADD streaks:global 7  "uuid-lucas"
ZADD streaks:global 15 "uuid-ana"

# Hash individual (expira em 48h sem estudar)
HSET streak:uuid-lucas
    days       7
    last_study "2026-06-23"
    started_at "2026-06-17"

EXPIRE streak:uuid-lucas 172800
```

### 3. Fila de Notificações (List FIFO)

```redis
RPUSH queue:notifications '{
  "type": "study_reminder",
  "user_id": "uuid-lucas",
  "email": "lucas@email.com",
  "data": { "subject": "Matematica", "hours": 2, "streak": 7 }
}'

# Consumidor (Notification Service)
BLPOP queue:notifications 0
```

### 4. Rate Limiting (String + TTL)

```redis
# Max 60 requisições por minuto por usuário
SET    ratelimit:uuid-lucas:questions 1 EX 60
INCR   ratelimit:uuid-lucas:questions
# Se retornar > 60 -> bloquear com 429 Too Many Requests
```

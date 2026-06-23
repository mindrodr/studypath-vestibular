// ============================================================
// StudyPath — Padrões de Projeto GoF
// Arquivo: src/study-service/patterns/gof-patterns.ts
// ============================================================

// ── 1. FACTORY METHOD (Criacional) ──────────────────────────

interface Notification {
  send(to: string, message: string): Promise<void>;
}

interface NotificationFactory {
  create(): Notification;
}

class EmailNotification implements Notification {
  async send(to: string, message: string) {
    console.log(`[Email] Para: ${to} | Mensagem: ${message}`);
    // await sendgrid.send({ to, subject: 'StudyPath', text: message });
  }
}

class PushNotification implements Notification {
  async send(to: string, message: string) {
    console.log(`[Push] Token: ${to} | Mensagem: ${message}`);
    // await fcm.send({ token: to, notification: { body: message } });
  }
}

class EmailFactory implements NotificationFactory {
  create(): Notification { return new EmailNotification(); }
}

class PushFactory implements NotificationFactory {
  create(): Notification { return new PushNotification(); }
}

const notificationFactories: Record<string, NotificationFactory> = {
  email: new EmailFactory(),
  push:  new PushFactory(),
};

async function notify(type: string, to: string, msg: string) {
  const factory = notificationFactories[type];
  if (!factory) throw new Error(`Tipo de notificação desconhecido: ${type}`);
  await factory.create().send(to, msg);
}


// ── 2. STRATEGY (Comportamental) ────────────────────────────

interface ReviewResult {
  grade: number;        // 0-5
  repetitions: number;
  easeFactor: number;
}

interface SpacedRepetitionStrategy {
  calculateNextInterval(result: ReviewResult): number; // retorna dias
}

class SM2Strategy implements SpacedRepetitionStrategy {
  calculateNextInterval({ grade, repetitions, easeFactor }: ReviewResult): number {
    if (grade < 3) return 1;
    const ef = Math.max(1.3, easeFactor + 0.1 - (5 - grade) * 0.08);
    if (repetitions === 0) return 1;
    if (repetitions === 1) return 6;
    return Math.round(6 * Math.pow(ef, repetitions - 1));
  }
}

class LeitnerStrategy implements SpacedRepetitionStrategy {
  private readonly boxes = [1, 3, 7, 14, 30];
  calculateNextInterval({ grade, repetitions }: ReviewResult): number {
    const box = grade >= 4
      ? Math.min(repetitions + 1, this.boxes.length - 1)
      : 0;
    return this.boxes[box];
  }
}

class FlashcardService {
  constructor(private strategy: SpacedRepetitionStrategy) {}

  async reviewCard(cardId: string, grade: number) {
    // const card = await FlashcardRepository.findById(cardId);
    const mockCard = { sm2: { repetitions: 2, easeFactor: 2.5 } };
    const days = this.strategy.calculateNextInterval({
      grade,
      repetitions: mockCard.sm2.repetitions,
      easeFactor:  mockCard.sm2.easeFactor,
    });
    console.log(`[Flashcard] Card ${cardId} | Próxima revisão em ${days} dia(s)`);
    // await FlashcardRepository.updateNextReview(cardId, days);
    return { next_interval_days: days };
  }
}

// Uso — pode trocar SM2Strategy por LeitnerStrategy sem mudar FlashcardService
const flashcardService = new FlashcardService(new SM2Strategy());


// ── 3. OBSERVER (Comportamental) ────────────────────────────

import { EventEmitter } from 'events';
const studyBus = new EventEmitter();

// Observer 1: atualiza streak no Redis
studyBus.on('session.completed', async ({ userId, date }: { userId: string; date: Date }) => {
  console.log(`[StreakObserver] Atualizando streak do usuário ${userId}`);
  // const streak = await RedisPublisher.getStreak(userId);
  // await RedisPublisher.setStreak(userId, streak.days + 1, date);
});

// Observer 2: publica evento no Analytics Service
studyBus.on('session.completed', async ({ userId, sessionId, minutes }: any) => {
  console.log(`[AnalyticsObserver] Publicando evento para ${userId}: ${minutes} minutos`);
  // await AnalyticsClient.track({ event: 'study_session_completed', userId, sessionId });
});

// Observer 3: envia notificação de parabéns em marcos de streak
studyBus.on('session.completed', async ({ userId, streak }: any) => {
  if (streak > 0 && streak % 7 === 0) {
    console.log(`[NotificationObserver] Parabéns! ${streak} dias de streak para ${userId}`);
    // await notify('push', userId, `Parabéns! ${streak} dias seguidos!`);
  }
});

// Função que emite o evento (Study Service)
async function completeSession(sessionId: string, userId: string) {
  console.log(`[ScheduleService] Concluindo sessão ${sessionId}`);
  // const session = await ScheduleRepository.complete(sessionId);
  studyBus.emit('session.completed', {
    userId,
    sessionId,
    minutes: 60,       // session.durationMinutes
    date: new Date(),
    streak: 7,         // streak atual do usuário
  });
}


// ── 4. DECORATOR (Estrutural) ────────────────────────────────
// Implementado como Guard no NestJS

/*
// decorators/requires-plan.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const RequiresPlan = (plan: 'premium' | 'institutional') =>
  SetMetadata('required_plan', plan);

// guards/plan.guard.ts
@Injectable()
class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<string>(
      'required_plan', ctx.getHandler()
    );
    if (!requiredPlan) return true;

    const { user } = ctx.switchToHttp().getRequest();
    const hierarchy: Record<string, number> = {
      free: 0, premium: 1, institutional: 2,
    };

    if (hierarchy[user.plan] < hierarchy[requiredPlan]) {
      throw new ForbiddenException(
        `Esta funcionalidade requer o plano ${requiredPlan}.`
      );
    }
    return true;
  }
}

// controllers/question.controller.ts
@Controller('questions')
@UseGuards(AuthGuard, PlanGuard)
class QuestionController {
  @Get('simulate')
  @RequiresPlan('premium')
  async runSimulation(@Query() dto: SimulationDto) {
    return this.questionService.generateSimulation(dto);
  }
}
*/


// ── DEMO ─────────────────────────────────────────────────────
async function demo() {
  console.log('\n=== Factory Method ===');
  await notify('email', 'lucas@email.com', 'Hora de estudar Matemática!');
  await notify('push',  'token-device-abc', 'Você tem 3 cards para revisar hoje.');

  console.log('\n=== Strategy (SM-2) ===');
  await flashcardService.reviewCard('card-001', 4); // lembrei bem

  console.log('\n=== Strategy (Leitner) ===');
  const leitnerService = new FlashcardService(new LeitnerStrategy());
  await leitnerService.reviewCard('card-002', 5); // perfeito

  console.log('\n=== Observer ===');
  await completeSession('session-001', 'uuid-lucas');
}

demo().catch(console.error);

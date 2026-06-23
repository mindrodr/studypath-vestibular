# Wireframes — StudyPath

> Protótipo de Alta Fidelidade: [Abrir no Figma](https://www.figma.com/proto/PuPz8UZcRYo1LF3ZIv0qGm/StudyPath?node-id=0-1&t=jAqitq9TIiY2q19a-1)

## Telas Desenvolvidas

| ID | Tela | Descrição |
|----|------|-----------|
| T01 | Splash / Onboarding | Apresentação da marca e proposta de valor |
| T02 | Cadastro / Login | Formulário com validação em tempo real |
| T03 | Quiz de Diagnóstico | 3 etapas com animação de progresso |
| T04 | Dashboard Principal | Cronograma semanal e progresso do dia |
| T05 | Sessão de Estudo (Timer) | Timer Pomodoro integrado ao cronograma |
| T06 | Banco de Questões | Interface de prática com feedback imediato |
| T07 | Revisão com Flashcards | Cards animados com algoritmo SM-2 |
| T08 | Dashboard de Desempenho | Gráficos interativos por matéria |
| T09 | Mapa de Progresso do Edital | Checkboxes por disciplina e tópico |
| T10 | Perfil e Configurações | Gestão de assinatura, notificações e metas |

## Sistema de Design

| Elemento | Valor |
|----------|-------|
| Cor Primária | `#1A237E` |
| Cor Secundária | `#3949AB` |
| Fundo | `#E8EAF6` |
| Sucesso | `#2E7D32` |
| Erro | `#B71C1C` |
| Aviso | `#E65100` |
| Tipografia | Inter (títulos) + Roboto (corpo) |
| Ícones | Material Design Icons (24px) |
| Grid | 8pt system, margens 16px |
| Border Radius | 8px (cards), 12px (botões) |

## Fluxo Navegável

```
Splash → Login/Cadastro → Quiz Diagnóstico → Dashboard
                                                  ↓
                         ┌────────────────────────┤
                         ↓                        ↓
                    Sessão de Estudo         Banco de Questões
                         ↓                        ↓
                    Flashcards              Resultado + Explicação
                         ↓
                   Dashboard de Desempenho
                         ↓
                   Mapa do Edital
```

## Personas

### Lucas Mendes (17 anos)
- Escola pública, trabalha meio período
- Objetivo: ENEM com nota > 700
- Dores: sem direção para começar, esquece conteúdos

### Ana Carolina Ferreira (16 anos)
- Escola particular, cursinho no contraturno
- Objetivo: FUVEST — Medicina USP
- Dores: muitas ferramentas, pouca integração, quer analytics detalhado

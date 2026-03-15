# 🚀 Funnel Friend Suite — CRM SDR com IA Generativa

O **Funnel Friend Suite** é uma plataforma de CRM de alta performance voltada para equipes de Pré-Vendas (SDR/BDR). Ele combina o poder da **Inteligência Artificial Generativa** com uma arquitetura **Multi-tenant** robusta para acelerar a conversão de leads e organizar processos de vendas complexos.

## 📌 Links do Projeto
- **Aplicação Publicada:** [https://funnel-friend-suite.vercel.app/](https://funnel-friend-suite.vercel.app/)
- **Vídeo de Demonstração:** `[LINK_DO_VIDEO_AQUI]`

## 🌟 Funcionalidades de Destaque (Diferenciais)

Além dos requisitos básicos, este sistema implementa:

1. **Arquitetura Multi-Workspace Avançada**: Um usuário pode criar, gerenciar e transitar entre múltiplos workspaces. Os dados são 100% isolados via **Supabase RLS**.
2. **Gestão de Equipes & Convites via Edge Functions**: Fluxo completo de convite de membros por e-mail, processado nativamente via **Supabase Edge Functions (Deno)**, permitindo colaboração real em tempo real.
3. **Personalização Total do Funil**: Interface administrativa para trocar nomes e **paletas de cores dinâmicas** das etapas do funil, com reflexo imediato no Kanban e Dashboard.
4. **Geração Automática (Trigger-based AI)**: Automação que dispara a criação de mensagens personalizadas assim que um lead atinge etapas críticas, economizando tempo precioso do SDR.
5. **Mobile-First Experience**: Visualização de equipe e leads otimizada para dispositivos móveis com componentes adaptativos e skeletons de carregamento.

---

## ✅ Requisitos do Case

| Categoria | Funcionalidade | Status |
| :--- | :--- | :---: |
| **Arquitetura** | Multi-tenancy com isolamento total (RLS) | ✅ |
| **Arquitetura** | Controle de Acesso (Admin vs Membro) | ✅ |
| **IA** | Geração de 3 variações de mensagens (Gemini API) | ✅ |
| **IA** | Automação por Etapa Gatilho (Diferencial) | ✅ |
| **Leads** | Kanban com Drag & Drop e Persistência | ✅ |
| **Leads** | Campos Personalizados por Workspace | ✅ |
| **Leads** | Validação de campos obrigatórios por etapa | ✅ |
| **Gestão** | Convite de membros via e-mail (Edge Functions) | ✅ |
| **Analytics** | Dashboard com métricas acumulativas e logs | ✅ |

---

## 🛠️ Tecnologias Utilizadas

- **Core:** React 18, TypeScript, Vite.
- **UI/UX:** Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion (animações).
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (Auth, DB, Storage).
- **Serverless:** [Supabase Edge Functions](https://supabase.com/edge-functions) (TypeScript/Deno).
- **Inteligência Artificial:** [Google Gemini 2.5 Flash Lite](https://ai.google.dev/).
- **Gerenciamento de Estado:** TanStack Query (React Query) para sincronização de dados.

---

## 📐 Decisões Técnicas & Arquitetura

### 1. Multi-tenancy e Isolamento
Utilizamos o conceito de **Organization Context**. O usuário logado possui um `context` que dita qual workspace está ativo. Todas as queries ao banco são protegidas pelo **Row Level Security (RLS)** do PostgreSQL, garantindo que mesmo se a chave anon for exposta, os dados de outros workspaces permaneçam inacessíveis.

### 2. Convites e Colaboração (Edge Functions)
Para garantir segurança e performance, a lógica de convite de membros foi movida para o backend. Utilizamos **Edge Functions** para:
- Validar se o usuário já existe.
- Criar vínculos seguros de convite.
- Enviar notificações (simulado/logado).
- Processar o "Aceite" garantindo a consistência do banco.

### 3. Engine de IA (Gemini API)
A integração com o Gemini foi feita de forma estruturada. Passamos não apenas os dados fixos do lead, mas também o **Contexto da Campanha** e o **Prompt Customizado** definido pelo usuário, o que permite que a IA responda como um "vendedor específico" daquela empresa (Persona Branding).

---

## 🚀 Como Executar Localmente

```bash
# Clone e instalação
git clone https://github.com/seu-usuario/funnel-friend-suite.git
npm install

# Configuração (arquivo .env.local)
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_GEMINI_API_KEY=sua_chave_gemini

# Desenvolvimento
npm run dev
```

---
Desenvolvido por **Ivo Fernandes** para a Prova Técnica Vibe Coding.

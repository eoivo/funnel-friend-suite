# 🚀 Funnel Friend Suite — CRM SDR com IA Generativa

O **Funnel Friend Suite** é uma plataforma de CRM de alta performance voltada para equipes de Pré-Vendas (SDR/BDR). Ele combina o poder da **Inteligência Artificial Generativa** com uma arquitetura **Multi-tenant** robusta para acelerar a conversão de leads e organizar processos de vendas complexos.

## 📌 Links do Projeto
- **Aplicação Publicada:** [https://funnel-friend-suite.vercel.app/](https://funnel-friend-suite.vercel.app/)

## 🌟 Funcionalidades de Destaque (Diferenciais)

Além dos requisitos básicos, este sistema implementa:

1. **Arquitetura Multi-Workspace Avançada**: Um usuário pode criar, gerenciar e transitar entre múltiplos workspaces. Os dados são 100% isolados via **Supabase RLS**.
2. **Gestão de Equipes & Convites via Edge Functions**: Fluxo completo de convite de membros por e-mail, processado nativamente via **Supabase Edge Functions (Deno)**.
3. **Personalização Total do Funil**: Interface para trocar nomes e **paletas de cores dinâmicas** das etapas do funil, com reflexo imediato no Kanban e Dashboard.
4. **Geração Automática (Trigger-based AI)**: Automação que dispara a criação de mensagens personalizadas assim que um lead atinge etapas críticas (Gatilho de Etapa).
5. **Data Quality Gate**: Validação dinâmica de campos obrigatórios por etapa do funil, garantindo que a IA receba dados de alta qualidade para as abordagens.

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
| **Analytics** | Dashboard com métricas em tempo real e logs | ✅ |

---

## 🛠️ Tecnologias Utilizadas

- **Core:** React 18, TypeScript, Vite.
- **UI/UX:** Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion.
- **Backend-as-a-Service:** [Supabase](https://supabase.com/).
- **Serverless:** [Supabase Edge Functions](https://supabase.com/edge-functions).
- **Inteligência Artificial:** [Google Gemini 2.5 Flash Lite](https://ai.google.dev/).
- **Gerenciamento de Estado:** TanStack Query.

---

## 📐 Decisões Técnicas & Arquitetura

### 1. Estrutura do Banco de Dados
A base foi construída em PostgreSQL focada em escalabilidade. As principais entidades são:
- **Workspaces**: A unidade raiz do isolamento.
- **Members**: Define a relação entre usuários e workspaces com papéis (admin/membro).
- **Leads & Custom Fields**: Sistema flexível que permite ao usuário criar campos extras sem alterar o esquema do banco.
- **Campaigns**: Define o contexto de abordagem e os triggers de automação.
- **Activity Logs**: Auditoria de cada ação relevante realizada no sistema.

### 2. Multi-tenancy e Isolamento (RLS)
Utilizamos **Row Level Security (RLS)**. Cada tabela possui políticas que verificam se o `auth.uid()` do usuário pertence ao `workspace_id` do registro. Isso garante que os dados permaneçam totalmente isolados a nível de banco de dados.

### 3. Integração com IA (Orquestração do Gemini)
A integração foi orquestrada no serviço `aiService.ts`. Injetamos um **Contexto Triplo** no prompt (Dados do Lead + Instruções da Campanha + Tom de Voz da Marca). O uso do modelo **2.5 Flash Lite** foi estratégico pela latência ultra-baixa e excelente janela de contexto para pré-vendas.

---

## 🧠 Desafios & Soluções

1. **Migração Vibe Coding**: Iniciei o protótipo no Lovable para ganhar velocidade na UI, mas rapidamente migrei para o ambiente local para implementar lógicas complexas de Auth, Edge Functions e persistência avançada de dados.
2. **Qualidade dos Dados vs IA**: Identificamos que a IA gerava mensagens ruins se o lead estivesse incompleto. Solucionamos isso criando o **Gatilho de Validação**: o lead só "viaja" para a etapa de IA se os dados obrigatórios estiverem preenchidos, protegendo a qualidade da automação.

---

## 🚀 Como Executar Localmente

```bash
# Clone e instalação
git clone https://github.com/eoivo/funnel-friend-suite.git
npm install

# Configuração (arquivo .env.local)
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_GEMINI_API_KEY=sua_chave_gemini

# Desenvolvimento
npm run dev
```

---
Desenvolvido por **Ivo Fernandes** para o Desafio Técnico SDR CRM.

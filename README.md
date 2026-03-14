# 🚀 SDR Flow — Mini CRM com Gerador de Mensagens IA

SDR Flow é um Mini CRM especializado para equipes de Pré-Vendas (SDR), focado em organizar leads e automatizar a geração de abordagens personalizadas utilizando Inteligência Artificial de última geração.

![SDR Flow Dashboard](https://cloud-3.lovable.app/projects/859866b0-e521-407c-b5d2-9f3821615e03/dashboard_mock.png)

## 📌 Links do Projeto
- **Aplicação Publicada:** [https://funnel-friend-suite.vercel.app/](https://funnel-friend-suite.vercel.app/)
- **Vídeo de Demonstração:** `[LINK_DO_VIDEO_AQUI]`

## ✨ Funcionalidades Principais

### ✅ Requisitos Obrigatórios
- **Autenticação e Workspaces:** Gerenciamento de acessos via Supabase Auth com isolamento total de dados por Workspace.
- **Gestão de Leads:** Cadastro completo com campos padrão (Nome, Email, Empresa, etc.) e suporte a **Campos Personalizados** por Workspace.
- **Kanban de Vendas:** Visualização dinâmica do funil com suporte a **Drag and Drop** e persistência em tempo real.
- **Gerador de Mensagens IA:** Integração com **Google Gemini 2.5 Flash Lite** para criar 3 variações de mensagens personalizadas baseadas no contexto da campanha e dados do lead.
- **Regras de Funil:** Validação de campos obrigatórios antes da movimentação do lead para garantir qualidade nos dados da IA.
- **Dashboard de Performance:** Visualização de métricas do funil, total de leads e log de atividades recentes.

### 🔥 Diferenciais Implementados
- **Automação por Etapa Gatilho:** Geração automática de mensagens em background assim que o lead entra em uma etapa específica.
- **Histórico de Atividades:** Registro detalhado de movimentações, criações e interações da IA.
- **Segurança Avançada (RLS):** Implementação de Row Level Security no Supabase para garantir que usuários só acessem dados de seu próprio workspace.
- **Arquitetura 2026:** Pronto para as versões mais recentes das APIs do Gemini e Supabase.

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui.
- **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS).
- **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/) (Modelo: 2.5 Flash Lite).
- **Gerenciamento de Estado:** React Query (TanStack Query) para cache e sincronização.
- **Produtividade IA:** Desenvolvido em regime de **Vibe Coding** utilizando Cursor AI e Google Antigravity.

## 📐 Decisões Técnicas

### 1. Estrutura do Banco de Dados
O schema foi desenhado para suportar **Multi-tenancy** desde o dia 1. Cada lead, campanha ou configuração está vinculado a um `workspace_id`, e as políticas de RLS garantem que nenhum dado seja "vazado" entre equipes.

### 2. Integração com LLM (Gemini 2.5)
Optamos pelo **Gemini 2.5 Flash Lite** pelo seu equilíbrio perfeito entre latência ultrabaixa e capacidade de raciocínio contextual. O sistema utiliza prompts estruturados para garantir que a IA mantenha o tom de voz da campanha.

### 3. Automação de Gatilho
Implementamos uma camada de automação no frontend que dispara chamadas assíncronas para a IA sempre que um lead atinge estágios críticos (como "Lead Mapeado"), eliminando o trabalho manual de "clicar em gerar" para cada lead.

## 🚀 Como Executar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/funnel-friend-suite.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o arquivo `.env.local`:**
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   VITE_GEMINI_API_KEY=sua_chave_do_gemini
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---
Desenvolvido com ❤️ por [Seu Nome/Ivo] para a Prova Técnica.

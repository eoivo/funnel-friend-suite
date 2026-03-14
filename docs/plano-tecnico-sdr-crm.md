# 🗂️ Plano de Desenvolvimento — Prova Técnica SDR CRM
> Stack: Lovable/v0 → Export → Google Aistudio / Cursor AI + Supabase MCP

---

## Visão Geral da Estratégia

```
[FASE 1] Lovable ou v0.dev
  └── Scaffolding visual completo (mock, sem backend)
  └── Todas as telas e componentes UI
  └── Export do código React

[FASE 2] Setup Supabase
  └── Schema do banco de dados
  └── Auth, RLS, Edge Functions

[FASE 3] Google Antigravity / Cursor AI + MCP Supabase
  └── Conectar frontend ao Supabase real
  └── Integração com LLM (Anthropic/OpenAI)
  └── Lógica de negócio, triggers, automações

[FASE 4] Deploy + README + Vídeo
```

---

## FASE 1 — Vibe Coding (Lovable / v0.dev)

> 🎯 Objetivo: Gerar todo o scaffold visual com mock data. Aproveitar os créditos ao máximo com prompts cirúrgicos e bem estruturados.

### 📌 Dica de escolha de plataforma

| Plataforma | Melhor para | Limite gratuito |
|---|---|---|
| **Lovable** | Apps completos com roteamento, auth UI, Kanban | ~5 projetos / mês |
| **v0.dev** | Componentes isolados (cards, modais, tabelas) | créditos por geração |

**Recomendação:** Use **Lovable** para o projeto base completo. Use **v0.dev** para componentes específicos (ex: Kanban board, modal de geração de mensagem) se os créditos do Lovable acabarem.

---

### 🚀 PROMPT INICIAL — Lovable (Projeto Completo)

Cole esse prompt no início do projeto no Lovable:

```
Build a full-stack SDR CRM web application called "SDR Flow" using React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Application Overview
A Mini CRM for Sales Development Representatives (SDRs) with AI-powered message generation, lead management, and sales funnel visualization.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router for navigation
- Mock data (no backend yet — we'll connect Supabase later)
- React Query for data fetching patterns (with mock data for now)

## Pages & Routes
1. /login — Login page
2. /register — Register/signup page
3. /dashboard — Main dashboard with metrics
4. /leads — Kanban board view of leads by funnel stage
5. /leads/:id — Lead detail page
6. /campaigns — Campaigns list page
7. /campaigns/new — Create new campaign
8. /campaigns/:id — Campaign detail/edit
9. /settings — Workspace settings (custom fields, funnel stages, required fields config)

## Core Features to Build (with mock data)

### Auth pages (login/register)
- Clean forms, show workspace creation on first register
- Use mock auth state stored in context

### Dashboard
- Total leads count
- Leads count per funnel stage (bar chart or stat cards)
- Recent activity feed (mock)
- Quick action buttons: "Add Lead", "New Campaign"

### Leads Kanban (/leads)
- Columns for each funnel stage: Base, Lead Mapeado, Tentando Contato, Conexão Iniciada, Desqualificado, Qualificado, Reunião Agendada
- Lead cards showing: name, company, stage badge, assigned user avatar
- Drag and drop between columns (use @dnd-kit/core)
- "Add Lead" button opens a slide-over/modal form
- Filter bar: search by name/company, filter by responsible

### Lead Detail (/leads/:id)
- Full lead info: name, email, phone, company, role, origin, notes
- Custom fields section (mock 2-3 custom fields like "Segment", "Annual Revenue")
- Assigned responsible user
- Funnel stage selector with validation (show error if required fields missing)
- AI Message Generator panel on the right side:
  - Dropdown to select a campaign
  - "Generate Messages" button
  - Shows 3 message variations in cards with "Copy" and "Send" buttons
  - Sending moves lead to "Tentando Contato" stage
- Activity history timeline at the bottom (mock entries)

### Campaigns (/campaigns)
- List of campaigns with name, trigger stage, created date, status badge
- "New Campaign" button

### New/Edit Campaign (/campaigns/new)
- Fields: Campaign Name, Context (textarea), Generation Prompt (textarea), Trigger Stage (dropdown select)
- Save/Cancel buttons

### Settings (/settings)
- Custom Fields section: list of custom fields, add/remove (name + type: text/number/select)
- Funnel Stages section: list stages, mark required fields per stage
- Required Fields per Stage: for each stage, checkbox list of which standard + custom fields are required

## Design System
- Clean, professional SaaS look
- Primary color: slate/zinc dark theme with accent in emerald green
- Sidebar navigation (collapsible on mobile)
- Use shadcn/ui: Card, Button, Badge, Input, Textarea, Select, Sheet, Dialog, Tabs, Avatar, Progress
- Responsive layout

## Mock Data
Create a `/src/mock/` folder with:
- mockLeads.ts — 10-15 sample leads spread across stages
- mockCampaigns.ts — 3 sample campaigns
- mockUsers.ts — 2-3 workspace members
- mockCustomFields.ts — 2-3 custom fields

Generate complete, functional mock data that makes the UI look real and populated.
```

---

### 🔧 PROMPTS DE REFINAMENTO (depois do prompt inicial)

Use esses após a geração base, um de cada vez:

**Prompt — Kanban Drag and Drop:**
```
Implement drag and drop on the Leads Kanban board using @dnd-kit/core and @dnd-kit/sortable. When a card is dropped on a new column, update the lead's stage in the mock data context. Show a toast notification confirming the move. If the destination stage has required fields that are empty on this lead, show an error dialog listing the missing fields and cancel the move.
```

**Prompt — AI Message Generator Panel:**
```
On the Lead Detail page, build the AI Message Generator panel as a right sidebar section. It should:
1. Show a "Select Campaign" dropdown
2. A "Generate Messages" primary button (shows loading spinner while "generating")
3. After clicking generate, show 3 mock message cards with realistic SDR outreach text (use the lead name and company in the messages to look personalized)
4. Each card has a "Copy" icon button and a "Send" button
5. Clicking "Send" shows a confirm dialog, then moves the lead to "Tentando Contato" stage and shows a success toast
6. A "Regenerate" button to simulate getting new variations
Make it look polished with smooth animations between states.
```

**Prompt — Settings Page (Custom Fields + Required Fields):**
```
Build the Settings page with two tabs:
Tab 1 "Custom Fields": 
- List of custom fields (name, type badge: text/number/select)
- "Add Field" opens an inline form row or small dialog
- Delete button per field with confirmation

Tab 2 "Funnel Rules":
- For each funnel stage, show a card with the stage name
- Inside each card, a checklist of all standard fields (name, email, phone, company, role, origin, notes) plus any custom fields
- Checked fields = required to enter that stage
- Save button at the bottom
Use mock state management — changes persist in component state during the session.
```

---

### ✅ Checklist de telas antes do export

Antes de exportar o código do Lovable, verifique:

- [ ] Login e Register funcionando com mock auth
- [ ] Dashboard com métricas mockadas e gráfico
- [ ] Kanban com drag-and-drop entre colunas
- [ ] Lead Detail com todos os campos + painel de IA
- [ ] Campaigns list + form de criação
- [ ] Settings com custom fields e funnel rules
- [ ] Sidebar de navegação responsiva
- [ ] Toast notifications funcionando
- [ ] Sem erros de TypeScript óbvios

---

## FASE 2 — Setup do Supabase

> 🎯 Objetivo: Criar toda a estrutura do banco de dados antes de conectar o frontend.

### Schema do Banco de Dados

Execute esse SQL no **SQL Editor do Supabase** (em ordem):

```sql
-- ===========================
-- WORKSPACES & USERS
-- ===========================

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member', -- 'admin' | 'member'
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- ===========================
-- FUNNEL STAGES
-- ===========================

create table funnel_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  position integer not null,
  color text default '#64748b',
  created_at timestamptz default now()
);

-- Required fields per stage (field_key = standard field name or custom field id)
create table stage_required_fields (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid references funnel_stages(id) on delete cascade,
  field_key text not null, -- e.g. 'name', 'email', or custom field uuid
  unique(stage_id, field_key)
);

-- ===========================
-- CUSTOM FIELDS
-- ===========================

create table custom_fields (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  field_type text not null default 'text', -- 'text' | 'number' | 'select'
  options jsonb, -- for select type: ["Option A", "Option B"]
  created_at timestamptz default now()
);

-- ===========================
-- LEADS
-- ===========================

create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  stage_id uuid references funnel_stages(id),
  assigned_to uuid references auth.users(id),
  name text not null,
  email text,
  phone text,
  company text,
  role text,
  origin text,
  notes text,
  custom_data jsonb default '{}', -- { "custom_field_uuid": "value" }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===========================
-- CAMPAIGNS
-- ===========================

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  context text, -- campaign/offer description
  generation_prompt text, -- instructions for LLM
  trigger_stage_id uuid references funnel_stages(id), -- nullable
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ===========================
-- GENERATED MESSAGES
-- ===========================

create table generated_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  messages jsonb not null, -- array of 3 message strings
  was_sent boolean default false,
  sent_at timestamptz,
  sent_message_index integer, -- which of the 3 was sent
  generated_at timestamptz default now()
);

-- ===========================
-- ACTIVITY LOG
-- ===========================

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null, -- 'stage_changed' | 'message_sent' | 'lead_created' | 'field_updated'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ===========================
-- TRIGGER: updated_at on leads
-- ===========================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- ===========================
-- DEFAULT FUNNEL STAGES (insert via function after workspace creation)
-- ===========================
-- Will be created via Edge Function on workspace setup
```

### Seed de Stages Padrão (Edge Function vai chamar isso)

```sql
-- Helper function to seed default stages for a new workspace
create or replace function seed_default_stages(p_workspace_id uuid)
returns void as $$
begin
  insert into funnel_stages (workspace_id, name, position, color) values
    (p_workspace_id, 'Base', 1, '#94a3b8'),
    (p_workspace_id, 'Lead Mapeado', 2, '#60a5fa'),
    (p_workspace_id, 'Tentando Contato', 3, '#f59e0b'),
    (p_workspace_id, 'Conexão Iniciada', 4, '#a78bfa'),
    (p_workspace_id, 'Desqualificado', 5, '#f87171'),
    (p_workspace_id, 'Qualificado', 6, '#34d399'),
    (p_workspace_id, 'Reunião Agendada', 7, '#10b981');
end;
$$ language plpgsql;
```

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table funnel_stages enable row level security;
alter table leads enable row level security;
alter table campaigns enable row level security;
alter table generated_messages enable row level security;
alter table activity_logs enable row level security;
alter table custom_fields enable row level security;

-- Helper function: check if user belongs to workspace
create or replace function is_workspace_member(p_workspace_id uuid)
returns boolean as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = p_workspace_id
    and user_id = auth.uid()
  );
$$ language sql security definer;

-- RLS Policies (workspace isolation)
create policy "workspace members only" on workspaces
  for all using (is_workspace_member(id));

create policy "workspace members only" on funnel_stages
  for all using (is_workspace_member(workspace_id));

create policy "workspace members only" on leads
  for all using (is_workspace_member(workspace_id));

create policy "workspace members only" on campaigns
  for all using (is_workspace_member(workspace_id));

create policy "workspace members only" on generated_messages
  for all using (
    exists (select 1 from leads l where l.id = lead_id and is_workspace_member(l.workspace_id))
  );

create policy "workspace members only" on activity_logs
  for all using (is_workspace_member(workspace_id));

create policy "workspace members only" on custom_fields
  for all using (is_workspace_member(workspace_id));
```

---

## FASE 3 — Conexão + Lógica de Negócio (Cursor/Aistudio + MCP)

> 🎯 Objetivo: Substituir todo o mock data pelo Supabase real, implementar Edge Functions e integração com LLM.

### Setup MCP Supabase no Cursor / Aistudio

No `cursor_settings.json` ou equivalente:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "SEU_TOKEN_AQUI"]
    }
  }
}
```

> No **Google Aistudio**: adicionar o token de acesso do Supabase nas configurações de MCP (conforme documentação da plataforma).

---

### Edge Functions a Criar

#### 1. `create-workspace` — Cria workspace + membro + stages padrão

```typescript
// supabase/functions/create-workspace/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const { name } = await req.json()
  const authHeader = req.headers.get('Authorization')!
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  
  const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
  
  const { data: workspace } = await supabase
    .from('workspaces')
    .insert({ name, slug })
    .select().single()
  
  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user!.id,
    role: 'admin'
  })
  
  await supabase.rpc('seed_default_stages', { p_workspace_id: workspace.id })
  
  return new Response(JSON.stringify({ workspace }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### 2. `generate-messages` — Chama LLM e retorna mensagens

```typescript
// supabase/functions/generate-messages/index.ts
Deno.serve(async (req) => {
  const { lead_id, campaign_id } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Fetch lead + campaign data
  const [{ data: lead }, { data: campaign }] = await Promise.all([
    supabase.from('leads').select('*, funnel_stages(name)').eq('id', lead_id).single(),
    supabase.from('campaigns').select('*').eq('id', campaign_id).single()
  ])
  
  // Fetch custom fields for context
  const { data: customFields } = await supabase
    .from('custom_fields')
    .select('*')
    .eq('workspace_id', lead.workspace_id)
  
  // Build custom fields context
  const customFieldsContext = customFields?.map(cf => 
    `${cf.name}: ${lead.custom_data?.[cf.id] || 'N/A'}`
  ).join('\n') || ''
  
  const systemPrompt = `You are an SDR message generator. Generate exactly 3 distinct outreach message variations.
Return ONLY a JSON array with 3 strings. No markdown, no explanation.
Example: ["Message 1 text", "Message 2 text", "Message 3 text"]`

  const userPrompt = `
CAMPAIGN CONTEXT:
${campaign.context}

GENERATION INSTRUCTIONS:
${campaign.generation_prompt}

LEAD DATA:
Name: ${lead.name}
Email: ${lead.email || 'N/A'}
Phone: ${lead.phone || 'N/A'}
Company: ${lead.company || 'N/A'}
Role: ${lead.role || 'N/A'}
Origin: ${lead.origin || 'N/A'}
Current Stage: ${lead.funnel_stages?.name || 'N/A'}
Notes: ${lead.notes || 'N/A'}
${customFieldsContext}

Generate 3 personalized outreach messages for this lead.`

  // Call Anthropic API (or swap for OpenAI)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  })
  
  const aiData = await response.json()
  const messages = JSON.parse(aiData.content[0].text)
  
  // Save to DB
  const { data: saved } = await supabase
    .from('generated_messages')
    .insert({ lead_id, campaign_id, messages })
    .select().single()
  
  return new Response(JSON.stringify({ messages, id: saved.id }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### 3. `move-lead-stage` — Valida campos obrigatórios e move o lead

```typescript
// supabase/functions/move-lead-stage/index.ts
Deno.serve(async (req) => {
  const { lead_id, target_stage_id } = await req.json()
  const authHeader = req.headers.get('Authorization')!
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  
  // Get required fields for target stage
  const { data: requiredFields } = await supabase
    .from('stage_required_fields')
    .select('field_key')
    .eq('stage_id', target_stage_id)
  
  // Get lead data
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', lead_id)
    .single()
  
  // Validate required fields
  const standardFields: Record<string, any> = {
    name: lead.name, email: lead.email, phone: lead.phone,
    company: lead.company, role: lead.role, origin: lead.origin, notes: lead.notes
  }
  
  const missingFields: string[] = []
  for (const { field_key } of requiredFields || []) {
    const value = standardFields[field_key] ?? lead.custom_data?.[field_key]
    if (!value || value === '') missingFields.push(field_key)
  }
  
  if (missingFields.length > 0) {
    return new Response(JSON.stringify({ 
      error: 'missing_required_fields', 
      fields: missingFields 
    }), { status: 422, headers: { 'Content-Type': 'application/json' } })
  }
  
  // Move lead
  const { data: previousStage } = await supabase
    .from('leads').select('stage_id').eq('id', lead_id).single()
  
  await supabase.from('leads')
    .update({ stage_id: target_stage_id })
    .eq('id', lead_id)
  
  // Log activity
  await supabase.from('activity_logs').insert({
    workspace_id: lead.workspace_id,
    lead_id,
    user_id: user!.id,
    action: 'stage_changed',
    metadata: { from_stage: previousStage?.stage_id, to_stage: target_stage_id }
  })
  
  // Check trigger campaigns for auto-generation
  const { data: triggerCampaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('trigger_stage_id', target_stage_id)
    .eq('workspace_id', lead.workspace_id)
    .eq('is_active', true)
  
  // Fire-and-forget auto-generation for trigger campaigns
  for (const campaign of triggerCampaigns || []) {
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ lead_id, campaign_id: campaign.id })
    }) // intentionally not awaited
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 📌 Prompt para usar no Cursor/Aistudio após o export

Use esse prompt no Cursor com MCP Supabase ativo:

```
I have a React + TypeScript CRM app exported from Lovable. I need to replace all mock data with real Supabase integration.

The Supabase project has these tables: workspaces, workspace_members, funnel_stages, stage_required_fields, custom_fields, leads, campaigns, generated_messages, activity_logs.

Please:
1. Install @supabase/supabase-js and create /src/lib/supabase.ts with the client setup using env vars VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
2. Create /src/hooks/useAuth.ts — wraps Supabase auth, handles login/register/logout, stores current workspace in context
3. Create /src/hooks/useLeads.ts — fetches leads by workspace, with optimistic updates for stage changes
4. Create /src/hooks/useCampaigns.ts — CRUD for campaigns
5. Create /src/hooks/useMessages.ts — calls the generate-messages edge function and caches results
6. Replace all mock data imports in components with these hooks
7. Ensure all API calls include the Authorization header with the Supabase session token

Use React Query (tanstack/react-query) for data fetching and caching. Keep the existing UI components unchanged.
```

---

## FASE 4 — Deploy + Entregáveis

### Deploy do Frontend

**Opção 1 — Vercel (recomendado):**
```bash
npm install -g vercel
vercel --prod
# Configurar env vars no painel: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

**Opção 2 — Netlify:**
```bash
npm run build
# Arrastar pasta dist/ para netlify.com/drop
```

### Variáveis de Ambiente

```env
# .env.local (nunca comitar)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...

# Supabase Edge Functions Secrets (via supabase CLI ou dashboard)
ANTHROPIC_API_KEY=sk-ant-xxxx
# ou
OPENAI_API_KEY=sk-xxxx
```

### README — Estrutura Mínima

```markdown
# SDR Flow — Mini CRM com IA

## 🚀 Deploy
[Link da aplicação](https://seuapp.vercel.app)

## 📹 Vídeo demonstração
[Link do vídeo](https://youtube.com/...)

## Tecnologias
- Frontend: React + TypeScript + Tailwind + shadcn/ui (gerado com Lovable)
- Backend: Supabase Edge Functions (Deno/TypeScript)
- Banco: Supabase PostgreSQL com RLS
- Auth: Supabase Auth
- IA: Anthropic Claude Haiku (via API)
- Deploy: Vercel

## Decisões Técnicas
...

## Funcionalidades Implementadas
### Obrigatórias
- [x] Auth + Workspaces
- [x] Gestão de Leads + campos customizados
- [x] Kanban com drag-and-drop
- [x] Funil de pré-vendas (7 etapas)
- [x] Campanhas + geração de mensagens com IA (3 variações)
- [x] Validação de campos obrigatórios por etapa
- [x] Dashboard com métricas
### Diferenciais
- [x] Geração automática por etapa gatilho
- [x] RLS no Supabase
- [x] Histórico de atividades
- [ ] Multi-workspace (parcial)
```

---

## ⏱️ Timeline Sugerida

| Dia | Atividade |
|-----|-----------|
| Dia 1 — manhã | Prompt inicial no Lovable, iterar telas |
| Dia 1 — tarde | Refinar Kanban, Lead Detail, Campaigns no Lovable |
| Dia 2 — manhã | Export + Setup Supabase (schema, RLS, Edge Functions) |
| Dia 2 — tarde | Conectar frontend via Cursor + MCP Supabase |
| Dia 3 — manhã | Integração LLM (generate-messages Edge Function) |
| Dia 3 — tarde | Testes, bug fixes, deploy |
| Dia 4 | README + gravação do vídeo |

---

## 🧠 Dicas Finais

- **Priorize o fluxo principal**: cadastro → criar lead → gerar mensagem. Se só isso funcionar 100%, já é forte.
- **Etapa gatilho é diferencial**: implemente depois que o fluxo manual estiver funcionando.
- **Commits frequentes**: `git commit -m "feat: kanban drag-and-drop funcionando"` — o avaliador vai ver o histórico.
- **Teste como usuário**: crie um workspace, adicione leads, rode as campanhas antes de gravar.
- **Créditos do Lovable**: se acabar, exporte o que tiver e continue no Cursor. O importante é o produto final.

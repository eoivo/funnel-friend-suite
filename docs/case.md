# Prova Técnica — Desenvolvedor Vibe Coding Full Stack

## Sobre este desafio

Este desafio tem como objetivo avaliar suas habilidades em **desenvolvimento full stack utilizando ferramentas de desenvolvimento assistido por IA (Vibe Coding)**.

Queremos entender como você:

* Estrutura soluções
* Toma decisões técnicas
* Utiliza ferramentas modernas de desenvolvimento

> **Importante:**
> Não existe uma única solução correta. Valorizamos sua capacidade de propor uma arquitetura adequada, fazer escolhas técnicas justificadas e entregar um produto funcional.

---

# O Desafio: SDR CRM com Gerador de Mensagens IA

Você deve desenvolver um **Mini CRM voltado para equipes de Pré-Vendas (SDR)** com funcionalidades de **geração de mensagens personalizadas utilizando Inteligência Artificial**.

---

# Contexto de Negócio

Equipes de **SDR (Sales Development Representatives)** precisam gerenciar leads e realizar abordagens personalizadas em escala.

O sistema deve permitir:

* Organizar leads em um **funil de pré-vendas**
* Criar **campanhas de abordagem com contextos específicos**
  (ex: Black Friday, lançamento de produto)
* Gerar **mensagens personalizadas usando IA**, considerando os dados de cada lead

---

# Requisitos Funcionais

## 1. Autenticação e Workspaces

* Sistema de **cadastro e login de usuários**
* Cada usuário deve poder **criar um workspace** (representa uma empresa/equipe)
* Os dados (**leads, campanhas, configurações**) devem ser **isolados por workspace**
* Implementar **controle de acesso básico** para que usuários só vejam dados do seu workspace

---

## 2. Gestão de Leads

### Cadastro de leads com campos padrão

* Nome
* Email
* Telefone
* Empresa
* Cargo
* Origem do lead
* Observações

### Campos personalizados

O usuário deve poder criar **campos adicionais para o workspace**, por exemplo:

* Segmento
* Faturamento Anual
* Quantidade de Funcionários

Esses campos devem estar disponíveis para **todos os leads do workspace**.

### Responsável pelo lead

Deve ser possível **atribuir um usuário do workspace como responsável pelo lead**.

* O vínculo é **opcional**
* O lead **pode ou não ter responsável**

### Visualização dos leads

* Visualização em **formato Kanban**
* Organizados por **etapas do funil**
* Possibilidade de **mover leads entre etapas**

  * Drag and drop ou outra interação
* Visualização e **edição dos detalhes do lead**

---

# 3. Funil de Pré-Vendas

O sistema deve ter um **funil com etapas que representam o processo de pré-vendas**.

### Etapas sugeridas

* **Base** — Lead recém cadastrado, sem tratamento
* **Lead Mapeado** — Informações do lead preenchidas/enriquecidas
* **Tentando Contato** — Em processo de abordagem
* **Conexão Iniciada** — Primeiro contato realizado
* **Desqualificado** — Lead não tem fit ou não tem interesse
* **Qualificado** — Lead com potencial confirmado
* **Reunião Agendada** — Próximo passo definido com o lead

> O candidato pode propor **variações se fizer sentido para a solução**.

---

# 4. Campanhas e Geração de Mensagens com IA

Este é o **módulo principal de integração com LLM**.

---

# 4.1 Criação de Campanhas

O usuário deve poder criar campanhas de abordagem com os seguintes campos:

### Nome da campanha

Identificação da campanha.

Exemplos:

* Black Friday 2024
* Lançamento Produto X

---

### Contexto

Informações de base para geração das mensagens:

* Descrição da campanha/oferta
* Informações sobre o produto ou serviço
* Informações sobre a empresa (se necessário)
* Período ou condições da oferta
* Outras informações relevantes para a IA gerar mensagens adequadas

---

### Prompt de geração

Instruções específicas para a IA gerar as mensagens.

Pode incluir:

* Definição da **persona/personagem que está escrevendo**
* **Tom de voz** desejado (formal, informal, consultivo, etc.)
* **Formato e tamanho da mensagem**
* **Exemplos de mensagens**
* Referência aos **campos do lead**

  * Campos padrão
  * Campos personalizados
* Outras instruções de estilo e abordagem

---

### Etapa gatilho (diferencial)

Configuração que permite **automatizar a geração de mensagens**.

Detalhado na seção **4.3**.

---

# 4.2 Geração de Mensagens

Ao acessar um lead, o usuário deve poder:

* Selecionar uma **campanha ativa**
* **Gerar sugestões de mensagens personalizadas**

  * Recomendado: **2 a 3 variações**

As mensagens devem considerar:

* Contexto da campanha
* Prompt da campanha
* Dados do lead

  * Campos padrão
  * Campos personalizados

### Ações disponíveis

* Visualizar opções geradas
* **Regenerar mensagens**
* Copiar mensagem
* **Enviar mensagem (simulado)**

### Ação de envio

Ao clicar em **Enviar**:

* O sistema deve **mover automaticamente o lead para a etapa "Tentando Contato"**
* Registrar que **uma abordagem foi iniciada**

---

# 4.3 Geração Automática por Etapa Gatilho (Diferencial)

Recurso avançado para **automatizar geração de mensagens**.

### Funcionamento

Na campanha, o usuário pode definir uma **etapa gatilho do funil**.

Quando configurado:

* Sempre que um lead for **movido para a etapa gatilho**, ou
* Sempre que um lead for **criado diretamente nessa etapa**

O sistema deve:

* Gerar automaticamente **sugestões de mensagens**
* Utilizando **contexto e prompt da campanha**

---

### Exemplo

1. Usuário cria campanha **"Black Friday 2024"**
2. Define a etapa gatilho como **Lead Mapeado**
3. Quando um lead é movido para essa etapa:

   * As informações do lead já estão completas
4. O sistema **gera mensagens automaticamente em background**

Quando o usuário acessar o lead:

* As mensagens **já estarão disponíveis**

---

### Comportamento esperado

* Geração pode ocorrer **de forma assíncrona**
* As mensagens ficam **salvas no lead**
* Usuário pode **visualizar ou regenerar**

### Observação

Pode haver **mais de uma campanha com mesma etapa gatilho**.

Possíveis abordagens:

* Gerar mensagens para **todas campanhas**
* Ou permitir **apenas uma campanha por etapa**

---

# 5. Regras de Transição entre Etapas

O sistema deve permitir **configurar campos obrigatórios para cada etapa**.

### Funcionamento

1. Usuário define **campos obrigatórios por etapa**
2. Ao mover um lead para a etapa:
3. O sistema verifica se os campos estão preenchidos

Se algum campo estiver vazio:

* O sistema **bloqueia a movimentação**
* Exibe quais **campos precisam ser preenchidos**

---

### Exemplo

Para a etapa **Lead Mapeado**:

Campos obrigatórios:

* Nome
* Empresa
* Telefone
* Cargo

Se o campo **Cargo** estiver vazio:

* O sistema impede a movimentação
* Mostra o erro ao usuário

---

### Por que isso é importante?

Garante **qualidade de dados antes da geração de mensagens com IA**.

Assim, quando uma campanha usar gatilho nessa etapa, o sistema terá:

* Dados suficientes
* Para gerar **mensagens personalizadas de qualidade**

> A validação deve considerar **campos padrão e personalizados**.

---

# 6. Dashboard

Visão geral do workspace com métricas básicas:

* Quantidade de **leads por etapa**
* **Total de leads cadastrados**
* Outras métricas consideradas relevantes

---

# Requisitos Técnicos Obrigatórios

| Camada             | Requisito                                                            |
| ------------------ | -------------------------------------------------------------------- |
| **Frontend**       | Plataforma de Vibe Coding (Lovable, Bolt.new, v0, Replit ou similar) |
| **Backend**        | Supabase Edge Functions (TypeScript/JavaScript)                      |
| **Banco de Dados** | Supabase (PostgreSQL)                                                |
| **Autenticação**   | Supabase Auth                                                        |
| **Integração IA**  | API de LLM (OpenAI, Google AI, Anthropic ou outra)                   |
| **Versionamento**  | Git + GitHub                                                         |

---

# Boas Práticas

* Código organizado e legível
* Commits com mensagens descritivas
* Tratamento básico de erros
* Variáveis de ambiente para **API Keys**

---

# Requisitos Diferenciais (Não obrigatórios)

Itens que contam **pontos extras**:

* Geração automática por **etapa gatilho**
* **Edição do funil**
* **Multi-workspace**
* **Convite de usuários** com papéis (admin/membro)
* **Histórico de atividades**
* **Histórico de mensagens enviadas**
* **Filtros e busca de leads**
* **Métricas avançadas**

  * Taxa de conversão
  * Leads por período
  * Mensagens por campanha
* **Row Level Security (RLS)** bem implementado no Supabase

---

# Entregáveis

## 1. Repositório GitHub

Deve conter:

* Código fonte completo
* Histórico de commits demonstrando evolução do projeto

---

# 2. Documentação

O **README** deve conter:

### Descrição do projeto

Breve explicação do sistema desenvolvido.

### Tecnologias utilizadas

Lista de:

* Frameworks
* Bibliotecas
* Serviços

### Decisões técnicas

Explicar:

* Estrutura do banco de dados
* Integração com LLM
* Implementação de **multi-tenancy**
* Desafios encontrados e soluções

### Funcionalidades implementadas

Checklist com:

* Requisitos obrigatórios
* Diferenciais implementados

---

# 3. Aplicação Publicada

Deve incluir:

* Link de **deploy**
* Avaliador deve conseguir **criar conta e testar**

Certifique-se de que a aplicação ficará **disponível durante a avaliação**.

---

# 4. Apresentação em Vídeo (Obrigatório)

Vídeo de **até 10 minutos** demonstrando:

* Visão geral da aplicação
* Fluxo principal:

  * Cadastro
  * Criar lead
  * Gerar mensagem com IA
* Decisões técnicas
* Diferenciais implementados

Plataformas aceitas:

* **Google Drive**
* **YouTube (público)**

O link deve estar:

* No **README**
* Ou enviado junto com a entrega

---

# Dicas e Recomendações

### Priorize o MVP

Implemente primeiro **todos os requisitos obrigatórios**.

---

### Documente suas decisões

Queremos entender **seu raciocínio**, não apenas o código funcionando.

---

### Não reinvente a roda

Use **bibliotecas e componentes prontos** quando fizer sentido.

---

### Teste a aplicação

Antes de entregar, teste os fluxos como um **usuário real**.

---

### Git

* Faça **commits frequentes**
* Use **mensagens claras**

Queremos ver **a evolução do projeto**.

---

🚀 **Boa sorte! Estamos ansiosos para ver sua solução.**

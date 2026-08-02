# Coffee Logbook

PRD — Controle de Consumo de Café

1. Objetivo do Produto

Aplicação web para o usuário registrar e visualizar seu consumo de café ao longo do tempo, cadastrando cada dose com quantidade, torra, espécie e método de preparo.

2. Stack Técnica

Backend/Dados: Supabase (Postgres). Sem autenticação nesta fase — dados podem ser tratados como single-tenant (sem user_id nas tabelas por enquanto).

UI: shadcn/ui. Tema padrão (neutral) até que tokens de estilização customizados sejam fornecidos.

Gráficos: componente de chart do shadcn (base Recharts).

Fora de escopo nesta fase: autenticação, permissões, multi-usuário, conexão/deploy de infraestrutura.

3. Modelo de Dados (Supabase / Postgres)

3.1 Enums

create type quantidade_dose as enum ('pequena', 'media', 'grande');
create type torra_cafe as enum ('clara', 'media', 'escura');
create type especie_cafe as enum ('arabica', 'robusta', 'outros');
create type metodo_preparo as enum (
  'coado', 'moka', 'prensa_francesa', 'espresso',
  'aeropress', 'hario_v60', 'chemex', 'sifao', 'turco'
);


3.2 Tabela doses

create table doses (
  id uuid primary key default gen_random_uuid(),
  quantidade quantidade_dose not null,
  quantidade_ml numeric not null,          -- ver mapeamento em 3.3
  torra torra_cafe not null,
  especie especie_cafe not null,
  especie_customizada text,                -- obrigatório apenas se especie = 'outros'
  preparo metodo_preparo not null,
  data_hora timestamptz not null default now(),
  criado_em timestamptz not null default now(),

  constraint especie_customizada_obrigatoria check (
    especie <> 'outros'
    or (especie_customizada is not null and length(trim(especie_customizada)) > 0)
  ),
  constraint especie_customizada_tamanho check (
    especie_customizada is null or length(especie_customizada) <= 50
  )
);

create index idx_doses_data_hora on doses (data_hora desc);


3.3 Mapeamento quantidade → mL (constante de aplicação, gravado no registro)

Usado para permitir agregações no gráfico por volume, além de contagem de doses.

Quantidade Volume (mL) pequena 30 media 80 grande 150

O valor é calculado no frontend/backend no momento do salvamento e gravado em quantidade_ml (não é derivado dinamicamente, para preservar o histórico caso o mapeamento mude no futuro).

3.4 Melhoria opcional (não obrigatória nesta fase)

Tabela especies_customizadas_historico (id, nome, criado_em) para sugerir/autocompletar valores já digitados pelo usuário em "outros", evitando duplicidade de grafia (ex.: "Catuaí" vs "catuai"). Pode ser implementada depois; não bloqueia o MVP.

4. Funcionalidades

4.1 Dashboard (Home)

Gráfico de consumo

Gráfico de barras: eixo X = dia, eixo Y = contagem de doses no dia.

Seletor de período: 7 dias / 30 dias / 90 dias (padrão: 7 dias).

Query: select date(data_hora) as dia, count(*) as total, sum(quantidade_ml) as volume_total from doses where data_hora >= now() - interval 'N days' group by dia order by dia.

Estado vazio: se não houver registros no período, exibir mensagem "Nenhum registro neste período" no lugar do gráfico (não é erro).

Tabela dos últimos 5 registros

Query: select * from doses order by data_hora desc limit 5.

Colunas: Data/Hora (formatada no fuso local do navegador), Quantidade, Torra, Espécie (exibir especie_customizada quando especie = 'outros'), Preparo.

Ação por linha: Editar e Excluir (reabre modal preenchido / exclui com confirmação).

Ao excluir ou editar um registro, tabela e gráfico devem ser revalidados automaticamente.

4.2 Cadastro de Nova Dose

Gatilho: botão "Registrar dose" (visível na Home) abre um Dialog (modal).

Campos do formulário (todos via ToggleGroup/botões do shadcn, seleção única por campo):

Campo Opções Quantidade pequena, média, grande Torra clara, média, escura Espécie arábica, robusta, outros (abre Input de texto ao lado/abaixo) Preparo coado, moka, prensa francesa, espresso, aeropress, Hario V60, Chemex, sifão, turco Data/Hora preenchido com o momento atual por padrão; editável opcionalmente

Envio

Botão "Salvar" fica desabilitado até que os 4 campos obrigatórios (quantidade, torra, espécie, preparo) estejam preenchidos.

Se especie = outros, o campo de texto customizado se torna obrigatório e o "Salvar" permanece desabilitado até haver texto não vazio (máx. 50 caracteres).

Ao salvar: calcular quantidade_ml pelo mapeamento da seção 3.3, inserir registro, fechar modal, mostrar toast de sucesso, revalidar Dashboard.

Em caso de erro na escrita: manter modal aberto com os dados preenchidos e exibir toast de erro, permitindo nova tentativa sem perder o preenchimento.

5. Regras de Negócio e Validações

data_hora não pode ser uma data/hora futura.

Todo registro deve ter exatamente um valor para cada um dos 4 campos obrigatórios (quantidade, torra, espécie, preparo) — sem múltipla escolha.

especie_customizada só é relevante (e só deve ser exibido) quando especie = 'outros'.

quantidade_ml é sempre derivado do enum quantidade no momento da gravação (não é editável diretamente pelo usuário).

6. Casos Extremos

Nenhum registro cadastrado: Dashboard exibe estados vazios tanto no gráfico quanto na tabela ("Nenhuma dose registrada ainda"), sem erros.

Múltiplas doses no mesmo minuto: permitido; id (uuid) garante unicidade, ordenação usa data_hora + criado_em como desempate.

Exclusão de um item que está entre os últimos 5: a tabela deve puxar automaticamente o próximo registro mais recente para preencher a lista.

Espécie "outros" com texto vazio ou só espaços: bloqueado pela constraint no banco e pela validação no formulário.

Texto customizado muito longo: truncar/validar em 50 caracteres no frontend, reforçado por constraint no banco.

Fuso horário: data_hora e criado_em armazenados em UTC (timestamptz); exibição sempre convertida para o fuso local do navegador do usuário.

Alto volume de registros no mesmo dia: o gráfico deve continuar legível (agregação diária, não por registro individual).

Edição de um registro: reabre o mesmo modal de cadastro com os valores atuais preenchidos; ao salvar, faz update em vez de insert, recalculando quantidade_ml se a quantidade for alterada.

7. Componentes shadcn/ui esperados

Dialog, ToggleGroup / ToggleGroupItem, Button, Input, Label, Table, Card, Chart (Recharts), Toast/Sonner, AlertDialog (confirmação de exclusão).

8. Fora de Escopo (nesta fase)

Autenticação e multi-usuário.

Conexão/infraestrutura de banco (assume-se Supabase já disponível).

Metas de consumo, alertas de cafeína, integração com wearables.

Exportação de dados.

NAO CONECTE ao lovable cloud. eu irei conectar diretamente ao supabase usando o conector

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce5d2d39-5538-4d62-b1bc-64e74ddbebb1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

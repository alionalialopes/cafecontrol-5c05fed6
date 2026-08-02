-- Controle de Consumo de Café — schema inicial
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create type quantidade_dose as enum ('pequena', 'media', 'grande');
create type torra_cafe as enum ('clara', 'media', 'escura');
create type especie_cafe as enum ('arabica', 'robusta', 'outros');
create type metodo_preparo as enum (
  'coado', 'moka', 'prensa_francesa', 'espresso',
  'aeropress', 'hario_v60', 'chemex', 'sifao', 'turco'
);

create table doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quantidade quantidade_dose not null,
  quantidade_ml numeric not null,
  torra torra_cafe not null,
  especie especie_cafe not null,
  especie_customizada text,
  preparo metodo_preparo not null,
  data_hora timestamptz not null default now(),
  criado_em timestamptz not null default now(),

  constraint especie_customizada_obrigatoria check (
    especie <> 'outros'
    or (especie_customizada is not null and length(trim(especie_customizada)) > 0)
  ),
  constraint especie_customizada_tamanho check (
    especie_customizada is null or length(especie_customizada) <= 50
  ),
  constraint data_hora_nao_futura check (data_hora <= now())
);

create index idx_doses_user_data_hora on doses (user_id, data_hora desc);

grant select, insert, update, delete on public.doses to authenticated;
grant all on public.doses to service_role;

alter table public.doses enable row level security;

create policy "usuarios veem suas doses"
on public.doses for select
to authenticated
using (user_id = auth.uid());

create policy "usuarios inserem suas doses"
on public.doses for insert
to authenticated
with check (user_id = auth.uid());

create policy "usuarios atualizam suas doses"
on public.doses for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "usuarios excluem suas doses"
on public.doses for delete
to authenticated
using (user_id = auth.uid());

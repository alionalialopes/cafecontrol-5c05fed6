import { getSupabase } from "./supabase";

export type Quantidade = "pequena" | "media" | "grande";
export type Torra = "clara" | "media" | "escura";
export type Especie = "arabica" | "robusta" | "outros";
export type Preparo =
  | "coado"
  | "moka"
  | "prensa_francesa"
  | "espresso"
  | "aeropress"
  | "hario_v60"
  | "chemex"
  | "sifao"
  | "turco";

export interface Dose {
  id: string;
  user_id: string;
  quantidade: Quantidade;
  quantidade_ml: number;
  torra: Torra;
  especie: Especie;
  especie_customizada: string | null;
  preparo: Preparo;
  data_hora: string;
  criado_em: string;
}

export const ML_POR_QUANTIDADE: Record<Quantidade, number> = {
  pequena: 30,
  media: 80,
  grande: 150,
};

export const QUANTIDADES: { value: Quantidade; label: string }[] = [
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Média" },
  { value: "grande", label: "Grande" },
];

export const TORRAS: { value: Torra; label: string }[] = [
  { value: "clara", label: "Clara" },
  { value: "media", label: "Média" },
  { value: "escura", label: "Escura" },
];

export const ESPECIES: { value: Especie; label: string }[] = [
  { value: "arabica", label: "Arábica" },
  { value: "robusta", label: "Robusta" },
  { value: "outros", label: "Outros" },
];

export const PREPAROS: { value: Preparo; label: string }[] = [
  { value: "coado", label: "Coado" },
  { value: "moka", label: "Moka" },
  { value: "prensa_francesa", label: "Prensa francesa" },
  { value: "espresso", label: "Espresso" },
  { value: "aeropress", label: "Aeropress" },
  { value: "hario_v60", label: "Hario V60" },
  { value: "chemex", label: "Chemex" },
  { value: "sifao", label: "Sifão" },
  { value: "turco", label: "Turco" },
];

export function rotuloEspecie(dose: Pick<Dose, "especie" | "especie_customizada">): string {
  if (dose.especie === "outros") return dose.especie_customizada?.trim() || "Outros";
  return ESPECIES.find((e) => e.value === dose.especie)?.label ?? dose.especie;
}

export function rotulo<T extends string>(
  lista: { value: T; label: string }[],
  value: T,
): string {
  return lista.find((i) => i.value === value)?.label ?? value;
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface DosePayload {
  quantidade: Quantidade;
  torra: Torra;
  especie: Especie;
  especie_customizada: string | null;
  preparo: Preparo;
  data_hora: string;
}

async function obterUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await getSupabase().auth.getUser();
  if (error || !user) throw new Error("Usuário não autenticado");
  return user.id;
}

function toRow(payload: DosePayload) {
  return {
    quantidade: payload.quantidade,
    quantidade_ml: ML_POR_QUANTIDADE[payload.quantidade],
    torra: payload.torra,
    especie: payload.especie,
    especie_customizada:
      payload.especie === "outros" ? (payload.especie_customizada?.trim() ?? null) : null,
    preparo: payload.preparo,
    data_hora: payload.data_hora,
  };
}

export async function listarUltimasDoses(limite = 5): Promise<Dose[]> {
  const { data, error } = await getSupabase()
    .from("doses")
    .select("*")
    .order("data_hora", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return (data ?? []) as Dose[];
}

export interface PontoConsumo {
  dia: string;
  total: number;
  volume_total: number;
}

export async function listarConsumoPorDia(dias: number): Promise<PontoConsumo[]> {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabase()
    .from("doses")
    .select("data_hora, quantidade_ml")
    .gte("data_hora", desde)
    .order("data_hora", { ascending: true });
  if (error) throw new Error(error.message);

  const mapa = new Map<string, PontoConsumo>();
  for (const linha of (data ?? []) as { data_hora: string; quantidade_ml: number }[]) {
    const d = new Date(linha.data_hora);
    const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    const atual = mapa.get(dia) ?? { dia, total: 0, volume_total: 0 };
    atual.total += 1;
    atual.volume_total += Number(linha.quantidade_ml) || 0;
    mapa.set(dia, atual);
  }
  return [...mapa.values()].sort((a, b) => a.dia.localeCompare(b.dia));
}

export async function criarDose(payload: DosePayload): Promise<void> {
  const userId = await obterUserId();
  const { error } = await getSupabase()
    .from("doses")
    .insert({ ...toRow(payload), user_id: userId });
  if (error) throw new Error(error.message);
}

export async function atualizarDose(id: string, payload: DosePayload): Promise<void> {
  const { error } = await getSupabase().from("doses").update(toRow(payload)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function excluirDose(id: string): Promise<void> {
  const { error } = await getSupabase().from("doses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

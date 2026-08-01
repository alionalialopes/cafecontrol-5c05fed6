import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { listarConsumoPorDia } from "@/lib/doses";

const PERIODOS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

const config = {
  total: { label: "Doses", color: "var(--chart-1)" },
};

function formatarDia(dia: string) {
  const partes = dia.split("-").map(Number);
  const y = partes[0] ?? 1970;
  const m = partes[1] ?? 1;
  const d = partes[2] ?? 1;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
  });
}

export function ConsumoChart({
  periodo,
  onPeriodoChange,
}: {
  periodo: string;
  onPeriodoChange: (v: string) => void;
}) {
  const dias = Number(periodo);
  const { data, isLoading, error } = useQuery({
    queryKey: ["consumo", dias],
    queryFn: () => listarConsumoPorDia(dias),
  });

  const pontos = (data ?? []).map((p) => ({ ...p, label: formatarDia(p.dia) }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Consumo por dia</CardTitle>
          <CardDescription>Número de doses registradas por dia</CardDescription>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={periodo}
          onValueChange={(v) => v && onPeriodoChange(v)}
          className="gap-2"
        >
          {PERIODOS.map((p) => (
            <ToggleGroupItem key={p.value} value={p.value} className="rounded-md px-3">
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : error ? (
          <p className="py-20 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Erro ao carregar o gráfico"}
          </p>
        ) : pontos.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Nenhum registro neste período
          </p>
        ) : (
          <ChartContainer config={config} className="h-[260px] w-full">
            <BarChart data={pontos} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

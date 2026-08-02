import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Coffee, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsumoChart } from "@/components/ConsumoChart";
import { UltimasDoses } from "@/components/UltimasDoses";
import { DoseFormDialog } from "@/components/DoseFormDialog";
import { supabaseConfigurado } from "@/lib/supabase";
import type { Dose } from "@/lib/doses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle de Consumo de Café" },
      {
        name: "description",
        content:
          "Registre cada dose de café com quantidade, torra, espécie e método de preparo e acompanhe seu consumo diário.",
      },
      { property: "og:title", content: "Controle de Consumo de Café" },
      {
        property: "og:description",
        content: "Registre suas doses de café e acompanhe seu consumo ao longo do tempo.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();
  const [periodo, setPeriodo] = useState("7");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [doseEmEdicao, setDoseEmEdicao] = useState<Dose | null>(null);

  function revalidar() {
    queryClient.invalidateQueries({ queryKey: ["consumo"] });
    queryClient.invalidateQueries({ queryKey: ["ultimas-doses"] });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Coffee className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Controle de café!!!</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe suas doses diárias e seus métodos favoritos.
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setDoseEmEdicao(null);
            setDialogAberto(true);
          }}
        >
          <Plus className="size-4" />
          Registrar dose
        </Button>
      </header>

      {!supabaseConfigurado && (
        <div className="mb-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Banco de dados não conectado. Configure a conexão com o Supabase
          (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY) e rode o script em{" "}
          <code className="font-mono">db/schema.sql</code>.
        </div>
      )}

      <div className="space-y-6">
        <ConsumoChart periodo={periodo} onPeriodoChange={setPeriodo} />
        <UltimasDoses
          onEditar={(dose) => {
            setDoseEmEdicao(dose);
            setDialogAberto(true);
          }}
          onChanged={revalidar}
        />
      </div>

      <DoseFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        dose={doseEmEdicao}
        onSaved={revalidar}
      />
    </main>
  );
}

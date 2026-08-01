import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ESPECIES,
  PREPAROS,
  QUANTIDADES,
  TORRAS,
  atualizarDose,
  criarDose,
  type Dose,
  type Especie,
  type Preparo,
  type Quantidade,
  type Torra,
} from "@/lib/doses";

function paraInputLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dose?: Dose | null;
  onSaved: () => void;
}

export function DoseFormDialog({ open, onOpenChange, dose, onSaved }: Props) {
  const [quantidade, setQuantidade] = useState<Quantidade | "">("");
  const [torra, setTorra] = useState<Torra | "">("");
  const [especie, setEspecie] = useState<Especie | "">("");
  const [especieCustomizada, setEspecieCustomizada] = useState("");
  const [preparo, setPreparo] = useState<Preparo | "">("");
  const [dataHora, setDataHora] = useState(paraInputLocal(new Date().toISOString()));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuantidade(dose?.quantidade ?? "");
    setTorra(dose?.torra ?? "");
    setEspecie(dose?.especie ?? "");
    setEspecieCustomizada(dose?.especie_customizada ?? "");
    setPreparo(dose?.preparo ?? "");
    setDataHora(paraInputLocal(dose?.data_hora ?? new Date().toISOString()));
  }, [open, dose]);

  const dataFutura = dataHora ? new Date(dataHora).getTime() > Date.now() : false;
  const customizadaOk =
    especie !== "outros" ||
    (especieCustomizada.trim().length > 0 && especieCustomizada.length <= 50);
  const podeSalvar =
    !!quantidade && !!torra && !!especie && !!preparo && !!dataHora && !dataFutura && customizadaOk;

  async function salvar() {
    if (!podeSalvar) return;
    setSalvando(true);
    const payload = {
      quantidade: quantidade as Quantidade,
      torra: torra as Torra,
      especie: especie as Especie,
      especie_customizada: especie === "outros" ? especieCustomizada.trim() : null,
      preparo: preparo as Preparo,
      data_hora: new Date(dataHora).toISOString(),
    };
    try {
      if (dose) {
        await atualizarDose(dose.id, payload);
        toast.success("Dose atualizada");
      } else {
        await criarDose(payload);
        toast.success("Dose registrada");
      }
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar a dose");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dose ? "Editar dose" : "Registrar dose"}</DialogTitle>
          <DialogDescription>
            Escolha uma opção em cada campo para registrar seu café.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              className="flex flex-wrap justify-start gap-2"
              value={quantidade}
              onValueChange={(v) => v && setQuantidade(v as Quantidade)}
            >
              {QUANTIDADES.map((q) => (
                <ToggleGroupItem key={q.value} value={q.value} className="rounded-md px-3">
                  {q.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Torra</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              className="flex flex-wrap justify-start gap-2"
              value={torra}
              onValueChange={(v) => v && setTorra(v as Torra)}
            >
              {TORRAS.map((t) => (
                <ToggleGroupItem key={t.value} value={t.value} className="rounded-md px-3">
                  {t.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Espécie</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              className="flex flex-wrap justify-start gap-2"
              value={especie}
              onValueChange={(v) => v && setEspecie(v as Especie)}
            >
              {ESPECIES.map((e) => (
                <ToggleGroupItem key={e.value} value={e.value} className="rounded-md px-3">
                  {e.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {especie === "outros" && (
              <Input
                autoFocus
                maxLength={50}
                placeholder="Qual espécie?"
                value={especieCustomizada}
                onChange={(ev) => setEspecieCustomizada(ev.target.value.slice(0, 50))}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Preparo</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              className="flex flex-wrap justify-start gap-2"
              value={preparo}
              onValueChange={(v) => v && setPreparo(v as Preparo)}
            >
              {PREPAROS.map((p) => (
                <ToggleGroupItem key={p.value} value={p.value} className="rounded-md px-3">
                  {p.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-hora">Data e hora</Label>
            <Input
              id="data-hora"
              type="datetime-local"
              value={dataHora}
              max={paraInputLocal(new Date().toISOString())}
              onChange={(ev) => setDataHora(ev.target.value)}
            />
            {dataFutura && (
              <p className="text-sm text-destructive">
                A data e hora não podem estar no futuro.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={!podeSalvar || salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

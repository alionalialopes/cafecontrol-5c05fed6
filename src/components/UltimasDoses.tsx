import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PREPAROS,
  QUANTIDADES,
  TORRAS,
  excluirDose,
  formatarDataHora,
  listarUltimasDoses,
  rotulo,
  rotuloEspecie,
  type Dose,
} from "@/lib/doses";

export function UltimasDoses({
  onEditar,
  onChanged,
}: {
  onEditar: (dose: Dose) => void;
  onChanged: () => void;
}) {
  const [paraExcluir, setParaExcluir] = useState<Dose | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["ultimas-doses"],
    queryFn: () => listarUltimasDoses(5),
  });

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    try {
      await excluirDose(paraExcluir.id);
      toast.success("Dose excluída");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir");
    } finally {
      setParaExcluir(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos registros</CardTitle>
        <CardDescription>As 5 doses mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Erro ao carregar registros"}
          </p>
        ) : !data || data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma dose registrada ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Torra</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Preparo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((dose) => (
                  <TableRow key={dose.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatarDataHora(dose.data_hora)}
                    </TableCell>
                    <TableCell>
                      {rotulo(QUANTIDADES, dose.quantidade)}
                      <span className="text-muted-foreground"> · {dose.quantidade_ml} mL</span>
                    </TableCell>
                    <TableCell>{rotulo(TORRAS, dose.torra)}</TableCell>
                    <TableCell>{rotuloEspecie(dose)}</TableCell>
                    <TableCell>{rotulo(PREPAROS, dose.preparo)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar dose"
                        onClick={() => onEditar(dose)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir dose"
                        onClick={() => setParaExcluir(dose)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!paraExcluir} onOpenChange={(o) => !o && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A dose será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

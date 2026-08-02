import { Link } from "@tanstack/react-router";
import { Coffee } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  titulo: string;
  descricao: string;
  children: ReactNode;
  rodape?: ReactNode;
}

export function AuthShell({ titulo, descricao, children, rodape }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Coffee className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Controle de café</h1>
            <p className="text-sm text-muted-foreground">
              Registre suas doses e acompanhe seu consumo.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{titulo}</CardTitle>
            <CardDescription>{descricao}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>

        {rodape}
      </div>
    </main>
  );
}

export function AuthLink({
  to,
  children,
}: {
  to: "/login" | "/cadastro";
  children: ReactNode;
}) {
  return (
    <Link to={to} className="font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

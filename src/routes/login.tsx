import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthLink, AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — Controle de Consumo de Café" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/" });
    }
  }, [loading, session, navigate]);

  async function entrar(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !senha) return;

    setEnviando(true);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Login realizado com sucesso.");
      navigate({ to: "/" });
    } catch {
      toast.error("Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (loading || session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  return (
    <AuthShell
      titulo="Entrar"
      descricao="Use seu e-mail e senha para acessar o dashboard."
      rodape={
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta? <AuthLink to="/cadastro">Criar conta</AuthLink>
        </p>
      }
    >
      {!supabaseConfigurado && (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Supabase não configurado. Defina{" "}
          <code className="font-mono">VITE_SUPABASE_URL</code> e{" "}
          <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>.
        </div>
      )}

      <form className="space-y-4" onSubmit={entrar}>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" className="w-full" disabled={enviando || !supabaseConfigurado}>
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}

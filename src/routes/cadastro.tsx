import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthLink, AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [{ title: "Criar conta — Controle de Consumo de Café" }],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/" });
    }
  }, [loading, session, navigate]);

  async function cadastrar(event: React.FormEvent) {
    event.preventDefault();
    if (!nome.trim() || !email.trim() || !senha) return;

    setEnviando(true);
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: { nome: nome.trim() },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Conta criada com sucesso!");
        navigate({ to: "/" });
        return;
      }

      toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      navigate({ to: "/login" });
    } catch {
      toast.error("Não foi possível criar a conta. Tente novamente.");
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
      titulo="Criar conta"
      descricao="Preencha seus dados para começar a registrar suas doses."
      rodape={
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta? <AuthLink to="/login">Entrar</AuthLink>
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

      <form className="space-y-4" onSubmit={cadastrar}>
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            type="text"
            autoComplete="name"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <Button type="submit" className="w-full" disabled={enviando || !supabaseConfigurado}>
          {enviando ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>
    </AuthShell>
  );
}

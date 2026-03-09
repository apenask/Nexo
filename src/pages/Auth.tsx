import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Wallet, Mail, Lock, Loader2 } from 'lucide-react';

export function Auth() {

const PIX_KEY = "225161c5-c97a-413e-8a20-801fb8d40f02";

const copyPix = async () => {
  await navigator.clipboard.writeText(PIX_KEY);
  toast.success("Chave Pix copiada!");
};

  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Conta criada com sucesso! Verifique seu email.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-zinc-50 selection:bg-indigo-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Wallet size={24} className="text-indigo-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-50">
          {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {isLogin ? 'Ou ' : 'Já tem uma conta? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isLogin ? 'crie uma nova conta' : 'faça login'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-3xl sm:px-10 border border-zinc-800/50 backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-950/50 border-zinc-800/80 focus-visible:ring-indigo-500/50 h-12"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-zinc-950/50 border-zinc-800/80 focus-visible:ring-indigo-500/50 h-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-medium text-base"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isLogin ? (
                  'Entrar'
                ) : (
                  'Criar conta'
                )}
              </Button>
            </div>
          </form>

        <div className='mt-6 text-center'>
          <button onClick={copyPix} className='text-sm text-zinc-500 hover:text-zinc-300 underline'>
            Apoiar o criador (Pix)
          </button>
          <p className='text-xs text-zinc-500 mt-2'>Rickelme Alexandre Souza da Silva</p>
        </div>
        </div>
      </div>
    </div>
  );
}

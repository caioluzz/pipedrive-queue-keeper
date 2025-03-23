
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/contexts/LoginContext';
import { toast } from 'sonner';

const Login = () => {
  const [name, setName] = useState('');
  const { login, isLoggedIn } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length === 0) {
      toast.error('Por favor, informe seu nome');
      return;
    }
    
    login(name);
    toast.success(`Bem-vindo, ${name}!`);
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-accent p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-md bg-primary flex items-center justify-center text-white font-semibold text-xl">T</div>
          <h1 className="mt-4 text-2xl font-bold">TR Energia</h1>
          <p className="mt-2 text-gray-600">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Informe seu nome"
              className="block w-full"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;

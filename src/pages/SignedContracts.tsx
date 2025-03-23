
import React from 'react';
import SignedContracts from '@/components/SignedContracts';
import { Toaster } from '@/components/ui/sonner';

const SignedContractsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-semibold">P</div>
            <h1 className="text-lg font-medium hidden sm:block">Pipedrive Queue Keeper</h1>
            <h1 className="text-lg font-medium sm:hidden">PQK</h1>
          </div>
          
          <nav>
            <ul className="flex gap-3 sm:gap-6">
              <li>
                <a href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/concluded" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Concluídos
                </a>
              </li>
              <li>
                <a href="/signed" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Assinados
                </a>
              </li>
              <li>
                <a href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Configurações
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="py-6 sm:py-8">
        <SignedContracts />
      </main>
      
      <footer className="border-t mt-12 py-6 bg-white">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Pipedrive Queue Keeper. Todos os direitos reservados.
        </div>
      </footer>
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default SignedContractsPage;

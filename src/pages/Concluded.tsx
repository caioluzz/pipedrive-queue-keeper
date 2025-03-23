
import React from 'react';
import ConcludedContracts from '@/components/ConcludedContracts';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';

const ConcludedContractsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar active="concluded" />
      
      <main className="py-6 sm:py-8">
        <ConcludedContracts />
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

export default ConcludedContractsPage;

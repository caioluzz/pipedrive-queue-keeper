import React from 'react';
import ConcludedContracts from '@/components/ConcludedContracts';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ConcludedContractsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar active="concluded" />
      
      <main className="py-6 sm:py-8">
        <ConcludedContracts />
      </main>
      
      <Footer />
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ConcludedContractsPage;

import React from 'react';
import SignedContracts from '@/components/SignedContracts';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SignedContractsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar active="signed" />
      
      <main className="py-6 sm:py-8">
        <SignedContracts />
      </main>
      
      <Footer />
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default SignedContractsPage;

import React from 'react';
import PipedriveSettings from '@/components/PipedriveSettings';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar active="settings" />
      
      <main className="py-6 sm:py-8">
        <PipedriveSettings />
      </main>
      
      <Footer />
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Settings;

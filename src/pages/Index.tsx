
import React, { useEffect, useState } from 'react';
import PipedriveQueue from '@/components/PipedriveQueue';
import { Toaster } from '@/components/ui/sonner';
import { getConfig } from '@/services/pipedriveService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const [stageId, setStageId] = useState(2);

  useEffect(() => {
    // Get stageId from localStorage
    const config = getConfig();
    setStageId(config.stageId);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-accent">
      <Navbar active="dashboard" />
      
      <main className="flex-grow py-4 sm:py-8">
        <PipedriveQueue
          stageId={stageId}
          title="Fila de Contratos"
          description="Contratos que precisam ser elaborados"
          refreshInterval={60000} // 1 minute
        />
      </main>
      
      <Footer />
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;

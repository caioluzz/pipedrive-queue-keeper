
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const EmptyQueue: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="rounded-full bg-primary/10 p-6 mb-6"
      >
        <CheckCircle className="h-12 w-12 text-primary" />
      </motion.div>
      
      <h3 className="text-xl font-medium mb-2">Fila vazia</h3>
      <p className="text-muted-foreground max-w-md">
        Não há negócios para exibir nesta etapa no momento. Novos cards aparecerão automaticamente quando negócios entrarem nesta fase.
      </p>
    </motion.div>
  );
};

export default EmptyQueue;

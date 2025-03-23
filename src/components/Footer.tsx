import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t py-6 bg-white/80 backdrop-blur-sm">
      <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} TR Energia. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;

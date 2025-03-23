
import React from 'react';
import { useLogin } from '@/contexts/LoginContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Navbar = ({ active }: { active: 'dashboard' | 'concluded' | 'settings' }) => {
  const { currentUser, logout } = useLogin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Você saiu com sucesso');
    navigate('/login');
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-semibold">T</div>
          <h1 className="text-lg font-medium hidden sm:block">TR Energia</h1>
          <h1 className="text-lg font-medium sm:hidden">TR</h1>
        </div>
        
        <nav className="flex items-center">
          <ul className="flex gap-3 sm:gap-6 mr-4">
            <li>
              <Link 
                to="/" 
                className={`text-sm font-medium ${active === 'dashboard' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/concluded" 
                className={`text-sm font-medium ${active === 'concluded' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                Concluídos
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={`text-sm font-medium ${active === 'settings' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                Configurações
              </Link>
            </li>
          </ul>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{currentUser}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Sair">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

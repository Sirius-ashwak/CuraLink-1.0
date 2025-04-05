import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Pill, 
  UserSearch, 
  CalendarDays, 
  Ambulance, 
  Menu, 
  X,
  Home,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ProfileMenu from './ProfileMenu';

interface SideNavigationProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export default function SideNavigation({ activeTab, onTabChange }: SideNavigationProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);
  
  // Handle clicks outside the menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isMenuOpen && 
          menuRef.current && 
          dotsRef.current && 
          !menuRef.current.contains(event.target as Node) && 
          !dotsRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleTabChange = (tabName: string) => {
    onTabChange(tabName);
    setIsMenuOpen(false);
    setIsMobileSidebarOpen(false);
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" />,
      colorClass: 'text-blue-500'
    },
    { 
      id: 'ai-chat', 
      label: 'AI Companion', 
      icon: <Bot className="h-5 w-5" />,
      colorClass: 'text-purple-500'
    },
    { 
      id: 'medicine-tracker', 
      label: 'Medicine Tracker',

      icon: <Pill className="h-5 w-5" />,
      colorClass: 'text-green-500'
    },
    { 
      id: 'doctor-matcher', 
      label: 'Doctor Matcher', 
      icon: <UserSearch className="h-5 w-5" />,
      colorClass: 'text-sky-500'
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: <CalendarDays className="h-5 w-5" />,
      colorClass: 'text-indigo-500'
    },
    { 
      id: 'emergency-transport', 
      label: 'Emergency Transport', 
      icon: <Ambulance className="h-5 w-5" />,
      colorClass: 'text-red-500'
    }
  ];

  return (
    <>
      {/* Top Navigation Bar (Mobile & Desktop) */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-30">
        {/* Logo / Home button */}
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => handleTabChange('dashboard')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
            <Home className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">AI Health Bridge</h2>
        </div>

        {/* Menu Actions */}
        <div className="flex items-center">
          {/* Profile Menu */}
          <ProfileMenu />
          
          {/* Three Dots Menu Button */}
          <Button 
            ref={dotsRef}
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-gray-400 hover:text-white ml-2"
            onClick={toggleMenu}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden ml-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="h-9 w-9 rounded-full text-gray-400 hover:text-white"
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Apple-style Slide-in Menu Panel */}
      <div 
        ref={menuRef}
        className={cn(
          "fixed right-4 top-16 w-64 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-800 shadow-2xl transform transition-all duration-300 ease-in-out z-40",
          isMenuOpen 
            ? "translate-y-0 opacity-100" 
            : "translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <div className="p-2">
          <div className="space-y-1 py-2">
            {navItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors",
                  activeTab === item.id 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
                onClick={() => handleTabChange(item.id)}
              >
                <span className={cn("mr-3", item.colorClass)}>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Removed Side Navigation for Desktop - Now using three dots menu instead */}

      {/* Using the three dots menu for all devices - removed mobile side navigation */}
    </>
  );
}
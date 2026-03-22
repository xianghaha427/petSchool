import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export function Header() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/pets', label: '宠物列表' },
    { path: '/register', label: '宠物登记' },
    { path: '/map', label: '校园地图' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PawCampus
            </span>
          </Link>

          {/* 导航 */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-2 rounded-lg transition-colors',
                  location.pathname === link.path
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 登录按钮 */}
          <button className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-shadow">
            登录
          </button>
        </div>
      </div>
    </header>
  );
}

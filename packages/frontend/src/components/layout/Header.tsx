import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TIFFY_BLUE, TIFFY_BLUE_DARK } from '@/styles/theme';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token) {
      setIsLoggedIn(true);
      setUsername(username || '');
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // 清除登录信息
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setShowDropdown(false);
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/pets', label: '宠物列表', requireAuth: true },
    { path: '/register', label: '宠物登记', requireAuth: true },
    { path: '/map', label: '校园地图', requireAuth: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PetSchool
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
                style={!link.requireAuth || isLoggedIn ? {} : { pointerEvents: 'none', opacity: 0.5 }}
                onClick={(e) => {
                  if (link.requireAuth && !isLoggedIn) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 登录/用户按钮 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">👤</span>
                <span className="text-gray-600">{username}</span>
                <span className="text-gray-400">{showDropdown ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-14 right-4 w-48 bg-white rounded-xl shadow-xl py-2 z-50"
                  >
                    <button
                      onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>👤</span> 个人中心
                    </button>
                    <button
                      onClick={() => { navigate('/my-pets'); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>🐾</span> 我的萌宠
                    </button>
                    <button
                      onClick={() => { navigate('/favorites'); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>❤️</span> 我的收藏
                    </button>
                    <div className="my-2 border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-500 flex items-center gap-2"
                    >
                      <span>🚪</span> 退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-shadow"
              style={{
                background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})`
              }}
            >
              登录
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

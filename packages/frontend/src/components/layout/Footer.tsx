import { motion } from 'framer-motion';

const socialLinks = [
  { name: '微信', icon: '💬', color: 'hover:bg-green-500' },
  { name: '微博', icon: '🌐', color: 'hover:bg-red-500' },
  { name: '小红书', icon: '📕', color: 'hover:bg-pink-500' },
];

const quickLinks = [
  { label: '首页', path: '/' },
  { label: '宠物列表', path: '/pets' },
  { label: '宠物登记', path: '/register' },
  { label: '校园地图', path: '/map' },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                🐾
              </div>
              <div>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
                >
                  PawCampus
                </span>
                <p className="text-xs text-gray-400">宠物校园登记系统</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              为每一位毛孩子打造温馨的校园生活，让爱与陪伴从这里开始。
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  className={`w-10 h-10 rounded-xl bg-gray-700 hover:text-white flex items-center justify-center text-lg transition-all duration-300 ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4
              className="text-lg font-bold mb-6"
              style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
            >
              快速链接
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-teal-500 transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4
              className="text-lg font-bold mb-6"
              style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
            >
              联系我们
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <p className="text-gray-400 text-sm">北京市朝阳区</p>
                  <p className="text-gray-400 text-sm">宠物校园路88号</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <p className="text-gray-400 text-sm">400-888-8888</p>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <p className="text-gray-400 text-sm">hello@pawcampus.com</p>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4
              className="text-lg font-bold mb-6"
              style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
            >
              订阅资讯
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              获取最新活动和宠物护理知识
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="输入邮箱地址"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
              >
                订阅
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 宠物校园登记系统. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                隐私政策
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                服务条款
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                网站地图
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

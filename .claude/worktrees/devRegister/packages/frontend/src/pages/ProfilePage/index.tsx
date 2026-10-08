import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService, UserProfile } from '@/services/userService';
import { TIFFY_BLUE, TIFFY_BLUE_DARK } from '@/styles/theme';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    phone: '',
    avatarUrl: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        nickname: data.nickname || '',
        email: data.email || '',
        phone: data.phone || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (error) {
      console.error('获取资料失败', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(formData);
      setMsg('资料更新成功');
      setIsEditing(false);
      loadProfile();
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      setMsg('资料更新失败');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setMsg('请填写完整');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMsg('新密码至少6位');
      return;
    }
    setLoading(true);
    try {
      await userService.changePassword(passwordData);
      setMsg('密码修改成功');
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      setMsg('密码修改失败');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">个人中心</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-white rounded-lg transition-all"
                style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
              >
                编辑资料
              </button>
            )}
          </div>

          {msg && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-lg text-center">
              {msg}
            </div>
          )}

          {/* 头像 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <p className="mt-2 text-gray-600">@{profile?.userName}</p>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入昵称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入邮箱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">头像URL</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入头像图片地址"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2 text-white rounded-lg transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
                >
                  {loading ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">昵称</span>
                <span className="text-gray-800">{profile?.nickname || '未设置'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">邮箱</span>
                <span className="text-gray-800">{profile?.email || '未设置'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">手机号</span>
                <span className="text-gray-800">{profile?.phone || '未设置'}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-500">账号</span>
                <span className="text-gray-800">{profile?.userName}</span>
              </div>
            </div>
          )}

          {/* 修改密码 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              修改密码
            </button>
          </div>

          {/* 快捷链接 */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/my-pets')}
              className="w-full py-3 text-left px-4 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors"
            >
              我的萌宠
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="w-full py-3 text-left px-4 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
            >
              我的收藏
            </button>
          </div>
        </motion.div>

        {/* 修改密码弹窗 */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">修改密码</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 py-2 text-white rounded-lg transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(to right, ${TIFFY_BLUE}, ${TIFFY_BLUE_DARK})` }}
                >
                  {loading ? '修改中...' : '确认'}
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

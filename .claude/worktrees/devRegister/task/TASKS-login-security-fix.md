# 登录注册安全问题修复任务清单

## 修复文件清单

| 任务 | 文件路径 | 修改内容 |
|------|----------|----------|
| Task-1 | `packages/backend/src/main/java/com/petschool/service/impl/UserServiceImpl.java` | 修复changePassword明文问题 + 添加登录状态检查 |
| Task-2 | `packages/backend/src/main/java/com/petschool/config/CorsConfig.java` | 修复CORS配置冲突 |
| Task-3 | `packages/backend/src/main/resources/application.yml` | JWT密钥配置优化 |

---

## Task-1: 修复changePassword明文问题

**文件**: `packages/backend/src/main/java/com/petschool/service/impl/UserServiceImpl.java`

### 修改1: changePassword方法 (第96-107行)

**原代码**:
```java
@Override
public void changePassword(Long userId, PasswordChangeDTO passwordDTO) {
    User user = userMapper.selectById(userId);
    if (user == null) {
        throw new BusinessException(404, "用户不存在");
    }
    if (!user.getPassword().equals(passwordDTO.getOldPassword())) {
        throw new BusinessException(400, "旧密码错误");
    }
    user.setPassword(passwordDTO.getNewPassword());
    userMapper.updateById(user);
}
```

**修改为**:
```java
@Override
public void changePassword(Long userId, PasswordChangeDTO passwordDTO) {
    User user = userMapper.selectById(userId);
    if (user == null) {
        throw new BusinessException(404, "用户不存在");
    }
    // 使用BCrypt验证旧密码（不再是明文比较）
    if (!passwordEncoder.matches(passwordDTO.getOldPassword(), user.getPassword())) {
        throw new BusinessException(400, "旧密码错误");
    }
    // 新密码使用BCrypt加密存储
    user.setPassword(passwordEncoder.encode(passwordDTO.getNewPassword()));
    userMapper.updateById(user);
}
```

### 修改2: login方法 (第35-52行) - 添加状态检查

**原代码**:
```java
@Override
public User login(UserDTO userDTO) {
    String userName=userDTO.getUserName();
    String password=userDTO.getPassword();

    // 使用 QueryWrapper 查询
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.eq("username", userName);
    User user = userMapper.selectOne(queryWrapper);

    if(user == null){
        throw new RuntimeException("用户名或密码错误");
    }
    //校验密码（使用 BCrypt 验证）
    if(!passwordEncoder.matches(password, user.getPassword())){
        throw new RuntimeException("用户名或密码错误");
    }
    return user;
}
```

**修改为**:
```java
@Override
public User login(UserDTO userDTO) {
    String userName=userDTO.getUserName();
    String password=userDTO.getPassword();

    // 使用 QueryWrapper 查询
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.eq("username", userName);
    User user = userMapper.selectOne(queryWrapper);

    if(user == null){
        throw new RuntimeException("用户名或密码错误");
    }
    //校验密码（使用 BCrypt 验证）
    if(!passwordEncoder.matches(password, user.getPassword())){
        throw new RuntimeException("用户名或密码错误");
    }
    // 检查用户状态是否启用
    if (user.getStatus() == null || user.getStatus() != 1) {
        throw new BusinessException(403, "账号已被禁用");
    }
    return user;
}
```

---

## Task-2: 修复CORS配置冲突

**文件**: `packages/backend/src/main/java/com/petschool/config/CorsConfig.java`

### 修改内容 (第19-21行)

**原代码**:
```java
// 允许所有域名进行跨域调用
config.addAllowedOriginPattern("*");
// 允许跨域发送 cookie
config.setAllowCredentials(true);
```

**修改为**:
```java
// 允许所有域名进行跨域调用
config.addAllowedOriginPattern("*");
// 关闭凭证支持（与通配符*冲突）
config.setAllowCredentials(false);
```

---

## Task-3: JWT配置优化

**文件**: `packages/backend/src/main/resources/application.yml`

### 修改内容 (第47-49行)

**原配置**:
```yaml
pet:
  jwt:
    secret-key: ${JWT_SECRET_KEY:xiangxiangaihaha1234567890hahaaixiangxiang1234567890}
    ttl: 7200000000
```

**修改为**:
```yaml
pet:
  jwt:
    secret-key: ${JWT_SECRET_KEY}
    ttl: 86400000
```

> 注意: secret-key不再有默认值，生产环境必须通过环境变量JWT_SECRET_KEY设置

---

## 验证清单

- [ ] `mvn compile` 编译成功
- [ ] 旧密码验证使用BCrypt matches()
- [ ] 新密码存储使用BCrypt encode()
- [ ] 禁用账户登录被正确拦截
- [ ] CORS配置允许跨域请求
- [ ] JWT密钥强制要求环境变量

---

## 回滚方案

如需回滚，执行以下git命令:
```bash
git checkout HEAD -- packages/backend/src/main/java/com/petschool/service/impl/UserServiceImpl.java
git checkout HEAD -- packages/backend/src/main/java/com/petschool/config/CorsConfig.java
git checkout HEAD -- packages/backend/src/main/resources/application.yml
```

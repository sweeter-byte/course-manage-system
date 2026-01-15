# 课程互动管理系统 - 部署与启动指南

## 一、系统功能完整性检查

### ✅ 已完成功能

| 模块 | 功能 | 状态 |
|------|------|:----:|
| **用户认证** | 注册/登录/登出 | ✅ |
| | JWT Token认证 | ✅ |
| | BCrypt密码加密 | ✅ |
| | 短信验证码(支持阿里云/腾讯云) | ✅ |
| | 忘记密码/重置密码 | ✅ |
| **课程管理** | 创建/编辑/删除课程 | ✅ |
| | 选课/退课 | ✅ |
| | 课程资源上传/下载 | ✅ |
| **作业管理** | 教师发布作业 | ✅ |
| | 学生提交作业 | ✅ |
| | 教师批改打分 | ✅ |
| | 成绩查看 | ✅ |
| **互动功能** | 学生提问/反馈 | ✅ |
| | 教师回复 | ✅ |
| **用户管理** | 管理员重置密码 | ✅ |
| | 个人信息修改(Web+Android) | ✅ |

---

## 二、需要人为确定/配置的事项

### 🔴 必须配置（生产环境）

#### 1. 数据库配置
```properties
# server/src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://你的数据库地址:3306/course_db
spring.datasource.username=你的数据库用户名
spring.datasource.password=你的数据库密码
```

#### 2. JWT密钥（安全相关）
```properties
# 生产环境务必修改为随机字符串
jwt.secret=你的随机密钥字符串至少64位
```

#### 3. 短信服务配置（如需真实发送）
```properties
# 选择服务商: aliyun 或 tencent
sms.provider=aliyun

# 阿里云配置（详见 doc/SMS_CONFIG_GUIDE.md）
sms.aliyun.access-key-id=xxx
sms.aliyun.access-key-secret=xxx
sms.aliyun.sign-name=xxx
sms.aliyun.template-code=SMS_xxx
```

### 🟡 建议配置

#### 4. 文件上传路径
```properties
# 课程资源存储路径（默认为项目目录下的uploads文件夹）
file.upload-dir=/your/custom/path/uploads
file.base-url=http://你的服务器地址:8080/api/files
```

#### 5. Android客户端服务器地址
```java
// android_client/.../network/RetrofitClient.java
// 修改 BASE_URL 为你的后端服务器地址
private static final String BASE_URL = "http://你的服务器IP:8080/";
```

### 🟢 开发环境可选

#### 6. 跨域配置（如前后端分离部署）
需要在后端添加CORS配置

---

## 三、系统启动步骤

### 步骤1: 初始化数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库初始化脚本
source /path/to/course-manage-system/server/db_schema.sql
```

或手动执行 `server/db_schema.sql` 中的SQL语句

### 步骤2: 启动后端服务 (Spring Boot)

```bash
cd /home/user/course-manage-system/server

# 方式1: 使用Maven
mvn spring-boot:run

# 方式2: 打包后运行
mvn clean package -DskipTests
java -jar target/system-0.0.1-SNAPSHOT.jar
```

**验证:** 访问 http://localhost:8080/api/courses 应返回JSON

### 步骤3: 启动前端Web (React + Vite)

```bash
cd /home/user/course-manage-system/frontend

# 安装依赖（首次运行）
npm install

# 开发模式启动
npm run dev
```

**访问地址:** http://localhost:5173

### 步骤4: 构建Android客户端

```bash
cd /home/user/course-manage-system/android_client

# 方式1: 使用Android Studio打开项目，点击Run

# 方式2: 命令行构建
./gradlew assembleDebug

# APK位置: app/build/outputs/apk/debug/app-debug.apk
```

**注意:** Android模拟器连接本地后端使用 `10.0.2.2:8080`

---

## 四、默认端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端API | 8080 | Spring Boot |
| 前端Web | 5173 | Vite开发服务器 |
| MySQL | 3306 | 数据库 |

---

## 五、测试账号

初次使用需要通过注册页面创建账号，或直接在数据库插入测试数据：

```sql
-- 插入测试用户（密码为BCrypt加密后的"123456"）
INSERT INTO users (user_id, username, password, real_name, phone_number, role) VALUES
('teacher_001', 'teacher1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张老师', '13800000001', 'teacher'),
('student_001', 'student1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李同学', '13800000002', 'student'),
('officer_001', 'admin1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王管理员', '13800000003', 'officer');
```

---

## 六、常见问题

### Q1: 后端启动报数据库连接失败
- 检查MySQL是否启动
- 检查application.properties中的数据库配置
- 确认数据库course_db已创建

### Q2: 前端访问后端报CORS错误
- 开发环境：Vite已配置代理，使用相对路径API
- 生产环境：需在后端配置CORS或使用Nginx反向代理

### Q3: Android连接不上后端
- 模拟器使用 `10.0.2.2` 代替 `localhost`
- 真机需使用电脑的局域网IP
- 检查防火墙是否放行8080端口

### Q4: 短信验证码收不到
- 开发模式(mock)下验证码打印在后端控制台
- 生产模式需配置阿里云/腾讯云短信服务

---

## 七、生产部署建议

1. **后端:** 使用Docker容器化部署，或直接部署到云服务器
2. **前端:** `npm run build` 后将dist目录部署到Nginx
3. **数据库:** 使用云数据库服务（阿里云RDS/腾讯云MySQL）
4. **HTTPS:** 配置SSL证书，使用HTTPS访问
5. **Android:** 签名打包后发布到应用市场或提供下载链接

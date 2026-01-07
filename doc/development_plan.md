# 课程互动管理系统 - 后续开发计划

## 1. 概述
本计划基于 2026年1月6日 的代码审核结果制定。
**目标**：将目前的“半成品”原型转化为功能完整、安全、符合验收标准的系统。
**核心任务**：修复后端安全与模型缺陷、补全Android端功能、从零构建Web管理端。

## 2. 阶段一：后端重构与核心完善 (预计耗时: 3-5天)
> **目标**：打造稳固、安全的数据底座，确保所有业务逻辑闭环。

### 1.1 数据库结构优化 (Priority: High)
- **任务**：新增 `course_enrollments` 表。
    - *字段*：`enrollment_id`, `student_id`, `course_id`, `enrollment_time`。
    - *目的*：解决“不知道谁选了哪门课”的问题，支持个性化课程列表展示。
- **任务**：字段规范化。
    - 检查所有表的主键生成策略，建议统一使用 UUID。

### 1.2 安全性升级 (Priority: Critical)
- **任务**：实现密码加密。
    - 引入 `BCryptPasswordEncoder`。
    - 注册时：`encode(password)` 存入数据库。
    - 登录时：`matches(raw, encoded)` 进行比对。
- **任务**：会话管理。
    - 引入 JWT (Json Web Token) 或简单的 Token 机制。
    - **禁止**在 API 响应中明文返回用户密码。

### 1.3 如果 API 补全 (Priority: High)
- **AssignmentAnswerController**: 新增 `POST /api/answers/grade` (教师批改接口)。
- **CourseController**: 新增 `PUT` (修改课程) 和 `DELETE` (删除课程) 接口。
- **UserController**: 新增 `POST /api/users/update` (修改个人信息) 和 `logout` 接口。

---

## 3. 阶段二：Android 客户端功能补全 (预计耗时: 4-6天)
> **目标**：消除硬编码，实现真实的用户身份流转。

### 2.1 身份认证模块
- **任务**：完善登录逻辑。
    - 登录成功后，将后端返回的 `token` 和 `userId` 存入 `SharedPreferences`。
- **任务**：新增注册页面 (`RegisterActivity`)。
    - 包含输入框：手机号、验证码(模拟)、密码、确认密码。

### 2.2 消除硬编码 (Hardcoding Removal)
- **任务**：全局替换 `student_001`。
    - 在 `AssignmentDetailActivity` 和 `FeedbackActivity` 中，从 `SharedPreferences` 读取当前登录的 `studentId`。

### 2.3 角色适配
- **任务**：根据登录角色 (`role`) 跳转不同 Dashboard。
    - **学生**：保持现有界面。
    - **教师**：新增 `TeacherDashboardActivity`，展示其执教的课程，提供发布作业入口。

---

## 4. 阶段三：Web 管理端开发 (预计耗时: 5-7天)
> **目标**：为教师和教务员提供高效的大屏管理工具。

### 3.1 教师管理端 (Workstation)
- **功能**：
    - **作业批改中心**：列表展示所有提交的作业，提供在线打分和评语输入框 (对接 `POST /grade`)。
    - **课程资源管理**：上传课件、发布通知。
    - **答疑看板**：集中回复学生的 Feedback。

### 3.2 教务管理端 (Admin Dashboard)
- **功能**：
    - **课程管理**：排课、审核开课申请。
    - **人员管理**：导入/导出学生名单，重置用户密码。

### 3.3 技术栈建议
- 建议继续使用 `frontend` 目录下的 Vite 项目。
- 推荐：React + Ant Design 或 Vue + Element Plus，能快速搭建表格和表单丰富的管理后台。

---

## 5. 阶段四：集成测试与文档 (预计耗时: 2天)
> **目标**：确保交付质量。

### 4.1 联调测试
- **场景一**：教师在 Web 端发布作业 -> 学生在 Android 端收到通知并提交 -> 教师在 Web 端批改 -> 学生在 Android 端查看分数。
- **场景二**：学生在 Android 端更改头像 -> 重新登录后生效。

### 4.2 文档更新
- 更新 `doc/` 下的验收报告，截图记录上述功能的实际运行效果。

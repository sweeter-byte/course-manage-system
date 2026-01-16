# 短信服务配置指南

## 1. 概述

本系统支持三种短信发送模式：
- **mock** - 模拟模式（默认），仅在控制台打印验证码，适用于开发测试
- **aliyun** - 阿里云短信服务
- **tencent** - 腾讯云短信服务

## 2. 快速开始（开发模式）

开发测试时无需配置，系统默认使用 mock 模式，验证码会打印在控制台。

## 3. 阿里云短信服务配置

### 3.1 购买与开通

1. **注册阿里云账号**
   - 访问：https://www.aliyun.com
   - 完成实名认证

2. **开通短信服务**
   - 访问：https://www.aliyun.com/product/sms
   - 点击"立即开通"

3. **创建 AccessKey**
   - 访问：https://ram.console.aliyun.com/manage/ak
   - 点击"创建 AccessKey"
   - 保存 AccessKey ID 和 AccessKey Secret

4. **添加短信签名**
   - 访问：https://dysms.console.aliyun.com/domestic/text/sign
   - 点击"添加签名"
   - 填写签名名称（如：课程管理系统）
   - 等待审核通过（通常1-2个工作日）

5. **创建短信模板**
   - 访问：https://dysms.console.aliyun.com/domestic/text/template
   - 点击"添加模板"
   - 模板内容示例：`您的验证码是${code}，5分钟内有效，请勿泄露给他人。`
   - 等待审核通过
   - 记录模板 Code（如：SMS_123456789）

### 3.2 配置参数

在 `application.properties` 中配置：

```properties
# 切换到阿里云模式
sms.provider=aliyun

# 阿里云配置
sms.aliyun.access-key-id=你的AccessKeyId
sms.aliyun.access-key-secret=你的AccessKeySecret
sms.aliyun.sign-name=你的签名名称
sms.aliyun.template-code=SMS_123456789
```

或使用环境变量（推荐生产环境）：

```bash
export SMS_PROVIDER=aliyun
export ALIYUN_ACCESS_KEY_ID=你的AccessKeyId
export ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
export ALIYUN_SMS_SIGN_NAME=你的签名名称
export ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

### 3.3 费用说明

- 国内短信：约 0.045 元/条
- 详见：https://www.aliyun.com/price/product#/sms/detail

---

## 4. 腾讯云短信服务配置

### 4.1 购买与开通

1. **注册腾讯云账号**
   - 访问：https://cloud.tencent.com
   - 完成实名认证

2. **开通短信服务**
   - 访问：https://cloud.tencent.com/product/sms
   - 点击"立即使用"

3. **创建 SecretId/SecretKey**
   - 访问：https://console.cloud.tencent.com/cam/capi
   - 点击"新建密钥"
   - 保存 SecretId 和 SecretKey

4. **创建短信应用**
   - 访问：https://console.cloud.tencent.com/smsv2/app-manage
   - 点击"创建应用"
   - 记录 SDK AppID

5. **添加短信签名**
   - 访问：https://console.cloud.tencent.com/smsv2/csms-sign
   - 点击"创建签名"
   - 填写签名内容（如：课程管理系统）
   - 等待审核通过

6. **创建短信模板**
   - 访问：https://console.cloud.tencent.com/smsv2/csms-template
   - 点击"创建正文模板"
   - 模板内容示例：`您的验证码是{1}，{2}分钟内有效，请勿泄露给他人。`
   - 等待审核通过
   - 记录模板 ID

### 4.2 配置参数

在 `application.properties` 中配置：

```properties
# 切换到腾讯云模式
sms.provider=tencent

# 腾讯云配置
sms.tencent.secret-id=你的SecretId
sms.tencent.secret-key=你的SecretKey
sms.tencent.sdk-app-id=你的SDKAppID
sms.tencent.sign-name=你的签名内容
sms.tencent.template-id=你的模板ID
```

或使用环境变量（推荐生产环境）：

```bash
export SMS_PROVIDER=tencent
export TENCENT_SECRET_ID=你的SecretId
export TENCENT_SECRET_KEY=你的SecretKey
export TENCENT_SMS_SDK_APP_ID=你的SDKAppID
export TENCENT_SMS_SIGN_NAME=你的签名内容
export TENCENT_SMS_TEMPLATE_ID=你的模板ID
```

### 4.3 费用说明

- 国内短信：约 0.05 元/条
- 新用户有免费额度
- 详见：https://cloud.tencent.com/document/product/382/18058

---

## 5. 推荐选择

| 服务商 | 优点 | 缺点 | 适用场景 |
|-------|------|------|---------|
| **阿里云** | 稳定性高、API简洁、文档完善 | 价格略高 | 大型项目、企业应用 |
| **腾讯云** | 新用户有免费额度、接入微信生态方便 | 审核较严格 | 初创项目、微信相关应用 |

**建议**：
- 学生/个人项目：腾讯云（有免费额度）
- 企业/正式项目：阿里云（稳定性更好）

---

## 6. 常见问题

### Q1: 签名/模板审核不通过？
- 签名需要与网站/APP名称一致
- 模板不能包含营销内容
- 需要提供相关资质证明

### Q2: 发送失败怎么排查？
- 查看应用日志中的错误信息
- 确认 AccessKey/SecretKey 正确
- 确认签名和模板已审核通过
- 检查手机号格式是否正确

### Q3: 如何切换回开发模式？
```properties
sms.provider=mock
```

---

## 7. 安全建议

1. **不要将密钥提交到代码仓库**
   - 使用环境变量或配置中心管理密钥

2. **限制 API 调用频率**
   - 系统已内置 1 分钟发送频率限制

3. **定期轮换密钥**
   - 建议每 3-6 个月更换一次

4. **监控短信发送量**
   - 设置日/月发送上限
   - 配置异常告警

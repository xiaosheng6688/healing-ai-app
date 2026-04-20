# GitHub Pages 部署指南

## 方案一：手动上传（推荐，5分钟完成）

### 步骤1：创建 GitHub 账号
1. 访问 https://github.com
2. 点击 "Sign up" 注册账号
3. 验证邮箱

### 步骤2：创建仓库
1. 点击右上角 "+" → "New repository"
2. Repository name: `healing-ai-app`
3. 选择 "Public"
4. 勾选 "Add a README file"
5. 点击 "Create repository"

### 步骤3：上传文件
1. 在新仓库页面，点击 "Add file" → "Upload files"
2. 把 `docs/index.html` 文件拖进去
3. 点击 "Commit changes"

### 步骤4：启用 GitHub Pages
1. 点击 "Settings" 标签
2. 左侧菜单点击 "Pages"
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选择 "/ (root)"
5. 点击 "Save"
6. 等待1-2分钟，页面会显示你的链接：`https://你的用户名.github.io/healing-ai-app/`

---

## 方案二：命令行部署（需要配置git）

```bash
# 1. 配置git用户名和邮箱
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱"

# 2. 添加远程仓库（替换YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/healing-ai-app.git

# 3. 推送代码
git branch -M main
git push -u origin main

# 4. 在GitHub Settings > Pages 中启用Pages
```

---

## 方案三：使用现有文件直接打开

如果暂时不想部署，可以直接双击打开：
```
C:\Users\Administrator\.qclaw\workspace\healing-ai-app\docs\index.html
```

所有功能都可用，只是没有在线链接。

---

## 部署后的链接格式

```
https://你的用户名.github.io/healing-ai-app/
```

例如：
```
https://zhangsan.github.io/healing-ai-app/
```

---

## 需要我帮你做什么？

1. **方案一**：我提供截图步骤指导
2. **方案二**：我帮你执行命令（需要你的GitHub账号密码）
3. **方案三**：直接用本地文件，不部署

请告诉我你选择哪种方案？

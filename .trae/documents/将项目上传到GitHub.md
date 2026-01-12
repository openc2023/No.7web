## 1. 初始化Git仓库
- 在项目根目录执行 `git init` 初始化Git仓库
- 创建 `.gitignore` 文件，排除不必要的文件

## 2. 配置.gitignore文件
- 添加常见的忽略规则，如 `node_modules/`、`vendor/`、`.env`、`*.log` 等
- 针对当前项目，添加 `admin/index.php.backup*`、`*.swp` 等临时文件

## 3. 提交初始代码
- 执行 `git add .` 添加所有文件
- 执行 `git commit -m "Initial commit"` 创建初始提交

## 4. 连接GitHub
- 在GitHub上创建名为"No.7"的新仓库
- 执行 `git remote add origin <GitHub仓库URL>` 连接到远程仓库

## 5. 推送代码
- 执行 `git push -u origin main` 推送代码到GitHub
- 确保分支名称正确，GitHub默认分支可能为main或master

## 6. 验证结果
- 登录GitHub检查仓库内容是否完整
- 验证文件结构和提交历史是否正确

## 注意事项
- 确保不包含敏感信息，如API密钥、数据库凭据等
- 检查.gitignore文件是否正确配置，避免提交不必要的文件
- 确保使用正确的GitHub用户名和仓库URL
# 构建核心SDK，重构API文件

## 1. 创建核心类文件
- 创建 `admin/core/Studio.php` 核心类
- 包含所有业务逻辑：扫描组件、读取页面、保存页面、创建页面、读取菜单、保存菜单
- 实现安全处理：basename()过滤文件名，防止路径遍历
- 定义基础路径，避免硬编码相对路径

## 2. 实现Studio类方法
### 2.1 构造函数
- 定义基础路径
- 初始化组件目录和页面目录

### 2.2 组件相关方法
- `getComponents()`：扫描组件目录，返回组件列表

### 2.3 页面相关方法
- `getPage($filename)`：读取指定页面的HTML和CSS
- `savePage($filename, $html, $css)`：保存页面内容
- `createPage($filename)`：创建新页面

### 2.4 菜单相关方法
- `getMenu()`：读取菜单数据
- `saveMenu($menuData)`：保存菜单数据

## 3. 重构API文件
### 3.1 get-components.php
- 引入Studio类
- 调用`$studio->getComponents()`
- 返回JSON响应

### 3.2 get-page.php
- 引入Studio类
- 调用`$studio->getPage($filename)`
- 返回JSON响应

### 3.3 save-page.php
- 引入Studio类
- 调用`$studio->savePage($filename, $html, $css)`
- 返回JSON响应

### 3.4 create-page.php
- 引入Studio类
- 调用`$studio->createPage($filename)`
- 返回JSON响应

### 3.5 get-menu.php
- 引入Studio类
- 调用`$studio->getMenu()`
- 返回JSON响应

### 3.6 save-menu.php
- 引入Studio类
- 调用`$studio->saveMenu($menuData)`
- 返回JSON响应

## 4. 测试API功能
- 确保所有API文件正常工作
- 验证安全处理是否有效
- 检查错误处理机制

## 5. 预期效果
- API文件变得简洁，仅包含HTTP处理
- 业务逻辑集中在Studio类中，便于维护和复用
- 安全处理统一，降低安全风险
- 便于后续扩展新功能

## 6. 技术亮点
- 采用面向对象设计，封装业务逻辑
- 统一的错误处理机制
- 安全的文件操作
- 清晰的目录结构
- 易于扩展的架构
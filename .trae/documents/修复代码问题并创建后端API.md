# 修复代码问题并创建后端API

## 1. 修复GrapesJS初始化容器问题
- 修改 `admin/index.php` 中的 `initGrapesJS` 函数，在初始化前清空canvas-frame容器

## 2. 创建后端API文件
### 2.1 创建 `admin/api/get-menu.php`
- 从 `config/site.json` 读取菜单数据
- 返回JSON格式的菜单数据

### 2.2 创建 `admin/api/save-menu.php`
- 接收前端发送的菜单数据
- 将数据保存到 `config/site.json`
- 返回保存结果

### 2.3 创建 `admin/api/get-components.php`
- 扫描 `components` 目录下的组件文件
- 解析组件配置
- 返回组件列表

## 3. 测试API功能
- 确保API文件能正常响应
- 测试菜单的加载、保存功能
- 测试组件库的加载功能

## 4. 验证前端功能
- 确保GrapesJS编辑器能正常初始化
- 验证菜单管理器的拖拽排序功能
- 验证底部属性栏的切换功能

## 技术说明
- 使用PHP 7.4+开发API
- 使用JSON格式进行数据交互
- 确保API文件具有正确的权限
- 实现基本的错误处理
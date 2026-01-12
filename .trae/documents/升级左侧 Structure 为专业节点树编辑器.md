## 升级左侧 Structure 为专业节点树编辑器

我将按照用户提供的方案，彻底重构左侧 Structure 的 HTML 结构、CSS 样式和 JavaScript 逻辑，使其成为像 Godot 引擎或 VS Code 那样专业的节点树编辑器。

### 1. 修改 CSS 样式
- 替换原有的 CSS 中 `/* 3.2 左侧：专业大纲树样式 (Godot Style) */` 及其之后的相关部分
- 使用用户提供的专业大纲树样式，包括层级线、折叠箭头动画和高亮选中态

### 2. 修改 HTML 结构
- 保留现有的 `<aside class="sidebar sidebar-left">` 结构
- 确保 Structure 根元素的 ID 为 `structure-root`
- 确保包含添加顶级菜单的按钮

### 3. 修改 JavaScript 逻辑
- 替换现有的菜单处理逻辑，从 `loadMenu` 到 `deleteMenu` 以及 `initSortable` 等相关函数
- 实现新的递归生成 HTML 函数 `generateTreeHTML`
- 实现新的嵌套拖拽初始化函数 `initNestedSortable`
- 实现从 DOM 反解数据的函数 `updateTreeDataFromDOM`
- 实现节点选择、折叠/展开、添加子节点等交互功能

### 4. 保留现有功能
- 页面切换功能
- 节点添加、删除、编辑功能
- 文件管理功能

### 5. 预期效果
- 支持折叠、嵌套、精准拖拽的专业节点树编辑器
- 清晰的层级线和折叠箭头
- 流畅的动画效果
- 直观的高亮选中态
- 支持复杂的父子关系拖拽

### 6. 实现步骤
1. 备份当前的 `admin/index.php` 文件
2. 替换 CSS 样式部分
3. 调整 HTML 结构（如果需要）
4. 替换 JavaScript 逻辑部分
5. 测试功能是否正常
6. 修复可能出现的问题

### 7. 注意事项
- 确保与现有代码的兼容性
- 确保功能的完整性
- 确保性能的优化
- 确保代码的可读性和可维护性
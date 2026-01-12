## 计划：更新底部栏UI和功能

### 1. 添加底部栏布局优化CSS
将用户提供的底部栏CSS样式添加到文件的<style>标签末尾，替换现有的.bottom-bar相关样式。

### 2. 替换底部栏HTML结构
删除现有的<footer class="bottom-bar">...</footer>，替换为用户提供的新HTML结构，包括：
- 左侧模式切换区（全局设置/组件属性）
- 右侧属性面板区（全局属性、组件属性）
- 各种属性控制面板

### 3. 更新JavaScript逻辑
- 替换现有的StyleSystem对象，使用增强版的StyleSystem
- 添加switchBottomTab函数用于切换标签
- 添加initSelectionListener函数用于监听组件选中事件
- 移除旧的底部栏切换逻辑
- 移除旧的switchMode和handleStyleChange函数

### 4. 集成到initGrapesJS函数
在initGrapesJS函数末尾（window.editor = editor;之前）添加initSelectionListener(editor)调用，初始化组件选中监听器。

### 5. 保持其他功能不变
- 菜单管理功能保持不变
- 组件加载功能保持不变
- 保存项目功能保持不变
- GrapesJS编辑器初始化保持不变

### 技术要点
- 使用新的底部栏布局，左侧为模式切换，右侧为属性面板
- 实现组件选中自动切换到底部栏的组件属性模式
- 实现属性的智能回显，滑块自动调整到对应位置
- 支持不同组件类型的属性面板切换
- 支持全局和局部样式的修改

通过这些修改，底部栏将具备更清晰的布局和更强大的功能，能够更好地控制画布里的组件样式。
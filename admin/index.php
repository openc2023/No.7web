<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No.7 WEB Studio</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- 引入SortableJS库 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
    
    <!-- 引入GrapesJS库 -->
    <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css">
    <script src="https://unpkg.com/grapesjs"></script>
    
    <style>
        /* --- 0. 设计系统 (Design Tokens) --- */
        :root {
            /* 核心色板 */
            --bg-root: #09090b;       /* 极黑背景 */
            --bg-sidebar: #18181b;    /* 侧边栏 */
            --bg-header: #18181b;     /* 顶部栏 */
            --bg-card: #27272a;       /* 组件卡片 */
            --bg-hover: #3f3f46;      /* 鼠标悬停 */
            
            --border-color: #3f3f46;  /* 边框颜色 */
            --primary: #ffffff;       /* 主色 (纯白) */
            --text-main: #e4e4e7;     /* 主文字 */
            --text-muted: #a1a1aa;    /* 次要文字 */
            
            --accent-green: #10b981;  /* 状态绿 */
            --accent-blue: #3b82f6;   /* 强调蓝 */
            
            /* --- 玻璃拟态统一标准 --- */
            /* 材质与质感 */
            --global-blur: 20px;           /* 全局磨砂强度 */
            --global-bg-color: 255, 255, 255; /* 全局底色 RGB */
            --global-bg-opacity: 0.1;      /* 全局透明度 */
            
            /* 形状与轮廓 */
            --global-radius: 24px;         /* 全局圆角 */
            --global-border-color: rgba(255, 255, 255, 0.2); /* 全局边框颜色 */
            --global-border-width: 1px;    /* 全局边框宽度 */
            
            /* 光影与深度 */
            --global-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); /* 全局阴影 */
            
            /* 排版与色彩 */
            --global-text-color: #ffffff;  /* 全局文字颜色 */
            --global-accent-color: #3b82f6; /* 全局强调色 */
            
            /* 全局环境 */
            --global-bg-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'); /* 全局背景图片 */
            --global-overlay-opacity: 0.4; /* 全局背景遮罩浓度 */
        }

        /* --- 1. 全局重置 --- */
        * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
        
        body { 
            height: 100vh; 
            width: 100vw; 
            overflow: hidden; 
            display: flex;
            flex-direction: column;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg-root);
            color: var(--text-main);
            font-size: 13px; /* 紧凑的 UI 字体 */
        }

        /* --- 2. 顶部工具栏 (Top Bar) --- */
        .top-bar {
            height: 50px;
            background-color: var(--bg-header);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            flex-shrink: 0;
            z-index: 10;
        }

        .brand {
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .brand span { font-weight: 300; opacity: 0.6; }

        .device-switcher {
            display: flex;
            background: var(--bg-root);
            padding: 4px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
        }
        .device-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 6px 14px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .device-btn:hover { color: var(--text-main); }
        .device-btn.active { 
            background: var(--bg-hover); 
            color: var(--primary); 
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .action-group .btn-publish {
            background: var(--primary);
            color: black;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: opacity 0.2s;
        }
        .action-group .btn-publish:hover { opacity: 0.9; }

        /* --- 3. 中间工作区 (Workspace) --- */
        .workspace {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        /* 3.1 侧边栏通用样式 */
        .sidebar {
            width: 280px;
            background: var(--bg-sidebar);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            z-index: 5;
        }
        .sidebar-left { border-right: 1px solid var(--border-color); }
        .sidebar-right { border-left: 1px solid var(--border-color); }

        .sidebar-header {
            height: 44px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            font-weight: 600;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border-color);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
        }

        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
        }
        
        /* 滚动条美化 */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }

        /* --- 3.2 左侧：专业大纲树样式 (Godot Style) --- */
        .tree-root {
            list-style: none;
            padding: 0;
            margin: 0;
            min-height: 50px; /* 保证空列表也能拖进去 */
            padding-bottom: 20px;
        }

        /* 每一行菜单项的容器 li */
        .tree-node-li {
            list-style: none;
            margin: 0;
            position: relative;
        }

        /* 菜单项的内容条 (可点击区域) */
        .tree-content {
            display: flex;
            align-items: center;
            padding: 4px 8px; /* Godot 风格比较紧凑 */
            cursor: pointer;
            color: var(--text-main);
            transition: all 0.1s;
            border: 1px solid transparent;
            margin-bottom: 1px;
            border-radius: 3px;
            font-size: 13px;
            user-select: none;
        }

        /* 悬停效果 */
        .tree-content:hover {
            background: var(--bg-hover);
        }

        /* 选中高亮 (Godot 风格深蓝背景) */
        .tree-content.active {
            background: #475569; /* 类似 Godot 的选中色 */
            color: white;
        }

        /* 拖拽时的幽灵样式 */
        .sortable-ghost > .tree-content {
            background: rgba(59, 130, 246, 0.2);
            border: 1px dashed var(--accent-blue);
            opacity: 0.5;
        }

        /* 拖拽选中项 */
        .sortable-chosen > .tree-content {
            background: var(--bg-card);
        }

        /* 子菜单容器 (真实的物理嵌套) */
        .tree-children {
            list-style: none;
            padding-left: 22px; /* 缩进距离 */
            margin: 0;
            border-left: 1px solid #3f3f46; /* 层级辅助线 */
            margin-left: 11px; /* 让线居中对齐图标 */
            min-height: 5px; /* 关键：允许拖拽放入空文件夹 */
        }

        /* 折叠状态 */
        .tree-children.collapsed {
            display: none;
        }

        /* --- 图标系统 --- */
        /* 折叠箭头 */
        .toggle-icon {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: var(--text-muted);
            transition: transform 0.2s ease;
            margin-right: 2px;
            border-radius: 3px;
        }
        .toggle-icon:hover { background: rgba(255,255,255,0.1); color: white; }
        .toggle-icon.expanded { transform: rotate(90deg); } /* 展开时旋转 */
        .toggle-icon.invisible { opacity: 0; pointer-events: none; }

        /* 节点类型图标 */
        .node-icon { width: 18px; text-align: center; margin-right: 6px; color: #a1a1aa; }
        .node-icon.folder { color: #fbbf24; } /* 文件夹黄色 */
        .node-icon.file { color: #60a5fa; }   /* 文件蓝色 */

        /* 节点文字 */
        .node-label {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* 操作按钮组 (Hover显示) */
        .node-actions {
            display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;
        }
        .tree-content:hover .node-actions { opacity: 1; }

        .action-btn {
            width: 20px; height: 20px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 3px;
            font-size: 10px; color: var(--text-muted);
        }
        .action-btn:hover { background: var(--bg-header); color: white; }

        /* 3.3 中间：画布区域 */
        .canvas-area {
            flex: 1;
            background-color: #000; /* 画布背景纯黑，对比强烈 */
            background-image: radial-gradient(#333 1px, transparent 1px);
            background-size: 20px 20px; /* 点阵背景 */
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        /* 1. 滚动容器：去掉内边距，允许内容撑满 */
        .canvas-scroller {
            flex: 1;
            overflow: auto;
            display: flex;
            /* 去掉 justify-content: center */
            padding: 0; /* 关键：去掉四周的留白 */
            background-color: #000; /* 确保底色一致 */
        }

        /* 2. 画布框架：去掉最大宽度限制 */
        .canvas-frame {
            background: white;
            min-height: 100%; /* 高度至少填满 */
            width: 100%;      /* 宽度填满 */
            max-width: none;  /* 关键：取消 1200px 限制，允许无限宽 */
            box-shadow: none; /* 去掉阴影，因为已经填满了 */
            border: none;
        }

        /* 3. 确保 GrapesJS 容器也填满 */
        .gjs-cv-canvas {
            height: 100%;
            width: 100%;
            top: 0;
        }

        /* 3.4 右侧：组件库样式 */
        .comp-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-content: flex-start;
            width: 100%;
        }
        .comp-card {
            background: var(--bg-card);
            border: 1px solid transparent;
            border-radius: 6px;
            height: 90px;
            width: calc(50% - 5px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: grab;
            transition: all 0.2s;
        }
        .comp-card:hover {
            border-color: var(--text-muted);
            background: var(--bg-hover);
            transform: translateY(-2px);
        }
        .comp-card i { font-size: 20px; margin-bottom: 8px; color: var(--text-main); }
        .comp-card span { font-size: 11px; color: var(--text-muted); }
        
        /* 矩阵容器样式 */
        .comp-matrix-wrapper {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-auto-rows: minmax(150px, auto);
            gap: 20px;
            padding: 20px;
            min-height: 300px;
            background: rgba(255,255,255,0.05);
            border: 2px dashed rgba(255,255,255,0.2);
            border-radius: 12px;
        }
        /* 拖拽时的视觉提示 */
        .comp-matrix-wrapper:empty::before {
            content: '拖拽组件到这里自动吸附';
            color: #666;
            display: flex; justify-content: center; align-items: center;
            grid-column: 1 / -1;
        }

        /* 控件样式 */
        .input-dark {
            background: #09090b;
            border: 1px solid #3f3f46;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            outline: none;
        }
        .input-dark:focus { border-color: var(--accent-blue); }
        
        .color-picker-wrapper {
            width: 24px; height: 24px; border-radius: 4px; border: 1px solid #3f3f46; overflow: hidden; cursor: pointer;
        }
        .color-input { width: 150%; height: 150%; transform: translate(-25%, -25%); cursor: pointer; }
        
        .icon-btn {
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-muted);
            width: 28px; height: 28px;
            border-radius: 4px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover { background: #3f3f46; color: white; }
        .icon-btn.active { background: #3f3f46; color: var(--accent-blue); border-color: #3f3f46; }
        
        /* 隐藏类 */
        .hidden { display: none !important; }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-right: 15px;
        }
        .status-dot {
            width: 6px; height: 6px; background: var(--accent-green); border-radius: 50%;
        }
        
        /* --- 底部栏布局优化 --- */
        .bottom-bar {
            height: 50px; /* 稍微增高以容纳标签 */
            padding: 0;   /* 清除内边距，由内部容器管理 */
            display: flex;
            justify-content: flex-start;
            background: #18181b;
            border-top: 1px solid #3f3f46;
        }
        
        /* 1. 左侧：模式切换区 */
        .bottom-switcher {
            width: 200px;
            display: flex;
            border-right: 1px solid #3f3f46;
            background: #000; /* 深色底区分 */
        }
        
        .switcher-btn {
            flex: 1;
            background: transparent;
            border: none;
            color: #71717a;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
        }
        
        .switcher-btn:hover { color: #e4e4e7; background: #27272a; }
        .switcher-btn.active {
            color: #ffffff;
            background: #27272a;
            border-bottom-color: #3b82f6; /* 激活态蓝条 */
        }
        
        /* 2. 右侧：属性面板区 */
        .props-container {
            flex: 1;
            display: flex;
            align-items: center;
            padding: 0 20px;
            overflow-x: auto; /* 防止属性太多溢出 */
        }
        
        /* 属性面板容器 */
        .prop-panel {
            display: flex;
            align-items: center;
            gap: 15px;
            flex: 1;
        }
        
        /* 属性分组微调 */
        .prop-group {
            height: 100%;
            padding: 0 15px;
            border-right: 1px solid #27272a;
        }
        
        /* 空状态提示 */
        .empty-msg { color: #52525b; font-style: italic; font-size: 12px; display: flex; align-items: center; gap: 8px; }
        
        /* 状态栏项目 */
        .status-item {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-right: 15px;
        }
        /* --- 全局文本编辑器工具条样式 (Office Style) --- */ 
        .text-toolbar { 
            display: flex; 
            align-items: center; 
            height: 100%; 
            padding: 0 5px; 
            gap: 8px; 
            background: transparent; 
        }

        /* 垂直分割线 */ 
        .toolbar-separator { 
            width: 1px; 
            height: 20px; 
            background-color: #3f3f46; 
            margin: 0 2px; 
        }

        /* 1. 字体下拉框 */ 
        .toolbar-select { 
            background: #27272a; 
            border: 1px solid transparent; 
            color: #e4e4e7; 
            padding: 0 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            height: 30px; 
            cursor: pointer; 
            outline: none; 
            min-width: 100px; 
            transition: all 0.2s; 
        } 
        .toolbar-select:hover { background: #3f3f46; } 
        .toolbar-select:focus { border-color: var(--accent-blue); background: #09090b; }

        /* 2. 数值输入框 (字号/行高) */ 
        .input-group { 
            display: flex; 
            align-items: center; 
            background: #27272a; 
            border-radius: 4px; 
            padding: 0 4px; 
            height: 30px; 
            border: 1px solid transparent; 
        } 
        .input-group:hover { background: #3f3f46; } 
        .input-group:focus-within { border-color: var(--accent-blue); background: #09090b; }

        .toolbar-input { 
            background: transparent; 
            border: none; 
            color: white; 
            width: 36px; 
            font-size: 12px; 
            text-align: center; 
            outline: none; 
        } 
        .input-unit { font-size: 10px; color: #a1a1aa; margin-right: 2px; }

        /* 3. 图标按钮 (加粗/对齐等) */ 
        .toolbar-btn { 
            width: 30px; 
            height: 30px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: transparent; 
            border: 1px solid transparent; 
            color: #a1a1aa; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 13px; 
            transition: all 0.1s; 
        } 
        .toolbar-btn:hover { background: #3f3f46; color: white; } 
        .toolbar-btn.active { 
            background: rgba(59, 130, 246, 0.2); 
            color: var(--accent-blue); 
        }

        /* 4. 颜色选择器 (带底部色条) */ 
        .color-btn-wrap { 
            width: 30px; 
            height: 30px; 
            position: relative; 
            border-radius: 4px; 
            cursor: pointer; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
        } 
        .color-btn-wrap:hover { background: #3f3f46; } 

        .color-icon { font-size: 12px; color: #e4e4e7; margin-bottom: 2px; } 
        .color-bar { width: 16px; height: 3px; background: white; border-radius: 1px; }

        /* 隐形的原生颜色 input */ 
        .toolbar-color-input { 
            position: absolute; 
            top: 0; left: 0; width: 100%; height: 100%; 
            opacity: 0; 
            cursor: pointer; 
        }

        /* --- 自定义组件字段面板 --- */
        .field-panel {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
        }

        .field-title {
            font-size: 12px;
            color: #a1a1aa;
            font-weight: 600;
            white-space: nowrap;
        }

        .field-list {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: nowrap;
            overflow-x: auto;
        }

        .field-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 160px;
        }

        .field-label {
            font-size: 11px;
            color: #a1a1aa;
        }

        .field-input,
        .field-textarea {
            background: #27272a;
            border: 1px solid transparent;
            color: #e4e4e7;
            border-radius: 6px;
            padding: 6px 8px;
            font-size: 12px;
        }

        .field-input:focus,
        .field-textarea:focus {
            border-color: var(--accent-blue);
            outline: none;
        }

        .field-textarea {
            min-height: 80px;
            resize: vertical;
        }

        .field-color {
            padding: 0;
            height: 32px;
            width: 52px;
        }
    </style>
</head>
<body>

    <header class="top-bar">
        <div class="brand">
            <i class="fa-solid fa-cube"></i> NO.7 <span>STUDIO</span>
        </div>
        
        <div class="device-switcher">
            <button class="device-btn" title="Mobile" onclick="resizeCanvas('375px', this)"><i class="fa-solid fa-mobile-screen"></i></button>
            <button class="device-btn" title="Tablet" onclick="resizeCanvas('768px', this)"><i class="fa-solid fa-tablet-screen-button"></i></button>
            <button class="device-btn active" title="Desktop" onclick="resizeCanvas('100%', this)"><i class="fa-solid fa-desktop"></i></button>
        </div>

        <div class="action-group">
            <button class="btn-publish" onclick="saveProject()">
                <i class="fa-brands fa-github"></i> Publish
            </button>
        </div>
    </header>

    <div class="workspace">
        
        <aside class="sidebar sidebar-left">
            <div class="sidebar-header">
                Structure
                <div style="margin-left:auto; display:flex; gap:10px;">
                     <i class="fa-solid fa-folder-plus" style="cursor:pointer;" onclick="addTopMenu()" title="New Folder"></i>
                </div>
            </div>
            <div class="sidebar-content">
                <ul id="structure-root" class="tree-root">
                    </ul>
            </div>
        </aside>

        <main class="canvas-area">
            <div class="canvas-scroller">
                <div id="canvas-frame" class="canvas-frame">
                    <div style="height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">
                        Preview Content Area
                    </div>
                </div>
            </div>
        </main>

        <aside class="sidebar sidebar-right">
            <div class="sidebar-header">Components</div>
            <div class="sidebar-content">
                <div class="comp-grid">
                    <div class="comp-card">
                        <i class="fa-regular fa-image"></i>
                        <span>Hero Header</span>
                    </div>
                    <div class="comp-card">
                        <i class="fa-solid fa-quote-left"></i>
                        <span>Text Block</span>
                    </div>
                    <div class="comp-card">
                        <i class="fa-solid fa-list-ul"></i>
                        <span>Features</span>
                    </div>
                    <div class="comp-card">
                        <i class="fa-regular fa-images"></i>
                        <span>Gallery</span>
                    </div>
                    <div class="comp-card">
                        <i class="fa-solid fa-video"></i>
                        <span>Video Embed</span>
                    </div>
                    <div class="comp-card">
                        <i class="fa-brands fa-wpforms"></i>
                        <span>Contact Form</span>
                    </div>
                </div>
            </div>
        </aside>

    </div>

    <footer class="bottom-bar">
        
        <div class="bottom-switcher">
            <button id="tab-global" class="switcher-btn" onclick="switchBottomTab('global')">
                <i class="fa-solid fa-globe"></i>
                <span>全局设置</span>
            </button>
            <button id="tab-comp" class="switcher-btn active" onclick="switchBottomTab('component')">
                <i class="fa-solid fa-layer-group"></i>
                <span>组件属性</span>
            </button>
        </div>

        <div class="props-container">

            <div id="panel-global" class="prop-panel hidden" style="width:100%">
                <div class="status-item" style="margin-right:20px; opacity:0.5;">
                    <i class="fa-solid fa-sliders"></i> 全局风格
                </div>
                <div class="prop-group">
                    <span class="prop-label">Blur</span>
                    <input type="range" min="0" max="50" id="gl-blur" oninput="StyleSystem.setGlobal('blur', this.value + 'px')">
                </div>
                <div class="prop-group">
                    <span class="prop-label">Radius</span>
                    <input type="range" min="0" max="50" id="gl-radius" oninput="StyleSystem.setGlobal('radius', this.value + 'px')">
                </div>
                <div class="prop-group">
                    <span class="prop-label">Color</span>
                    <div class="color-picker-wrapper">
                        <input type="color" class="color-input" id="gl-accent" onchange="StyleSystem.setGlobal('accent-color', this.value)">
                    </div>
                </div>
            </div>

            <div id="panel-component" class="prop-panel" style="width:100%">
                
                <div id="comp-msg-none" class="empty-msg">
                    <i class="fa-solid fa-arrow-pointer"></i> 请选择组件以编辑
                </div>

                <div id="comp-props-text" class="text-toolbar hidden">
                    
                    <select class="toolbar-select" id="txt-font" onchange="StyleSystem.setCss('font-family', this.value)" title="字体">
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">宋体 / Times</option>
                    </select>

                    <div class="toolbar-separator"></div>

                    <div class="input-group" title="字号">
                        <input type="number" class="toolbar-input" id="txt-size" value="16" onchange="StyleSystem.setCss('font-size', this.value + 'px')">
                        <span class="input-unit">px</span>
                    </div>

                    <div class="toolbar-separator"></div>

                    <button class="toolbar-btn" id="btn-bold" title="加粗" onclick="StyleSystem.toggleCss('font-weight', 'bold', 'normal', this)">
                        <i class="fa-solid fa-bold"></i>
                    </button>
                    <button class="toolbar-btn" id="btn-italic" title="倾斜" onclick="StyleSystem.toggleCss('font-style', 'italic', 'normal', this)">
                        <i class="fa-solid fa-italic"></i>
                    </button>
                    <button class="toolbar-btn" id="btn-underline" title="下划线" onclick="StyleSystem.toggleCss('text-decoration', 'underline', 'none', this)">
                        <i class="fa-solid fa-underline"></i>
                    </button>
                    <button class="toolbar-btn" id="btn-strike" title="删除线" onclick="StyleSystem.toggleCss('text-decoration', 'line-through', 'none', this)">
                        <i class="fa-solid fa-strikethrough"></i>
                    </button>

                    <div class="toolbar-separator"></div>

                    <div class="color-btn-wrap" title="文字颜色">
                        <i class="fa-solid fa-font color-icon"></i>
                        <div class="color-bar" id="indicator-text-color" style="background:#fff"></div>
                        <input type="color" class="toolbar-color-input" id="txt-color" oninput="document.getElementById('indicator-text-color').style.background = this.value; StyleSystem.setCss('color', this.value)">
                    </div>

                    <div class="toolbar-separator"></div>

                    <button class="toolbar-btn" id="align-left" title="左对齐" onclick="StyleSystem.setAlign('left')"><i class="fa-solid fa-align-left"></i></button>
                    <button class="toolbar-btn" id="align-center" title="居中" onclick="StyleSystem.setAlign('center')"><i class="fa-solid fa-align-center"></i></button>
                    <button class="toolbar-btn" id="align-right" title="右对齐" onclick="StyleSystem.setAlign('right')"><i class="fa-solid fa-align-right"></i></button>

                </div>

                <div id="comp-props-glass" class="prop-panel hidden">
                    <div class="prop-group">
                        <span class="prop-label">Blur</span>
                        <input type="range" min="0" max="50" id="lc-blur" oninput="StyleSystem.setLocal('blur', this.value + 'px')">
                    </div>
                    <div class="prop-group">
                        <span class="prop-label">Radius</span>
                        <input type="range" min="0" max="50" id="lc-radius" oninput="StyleSystem.setLocal('radius', this.value + 'px')">
                    </div>
                    <div class="prop-group">
                        <span class="prop-label">Opacity</span>
                        <input type="range" min="0" max="100" id="lc-opacity" oninput="StyleSystem.setLocal('bg-opacity', this.value / 100)">
                    </div>
                    <div class="prop-group">
                        <span class="prop-label">Bg Color</span>
                        <div class="color-picker-wrapper">
                             <input type="color" class="color-input" id="lc-color" onchange="StyleSystem.setLocalColor('bg-color', this.value)">
                        </div>
                    </div>
                </div>

                <div id="comp-props-image" class="prop-panel hidden">
                     <div class="prop-group">
                        <button class="input-dark" onclick="window.editor.runCommand('open-assets')">
                            <i class="fa-solid fa-image"></i> 更换图片
                        </button>
                    </div>
                </div>

                <div id="comp-props-fields" class="field-panel hidden">
                    <div class="field-title">组件字段</div>
                    <div id="comp-fields-container" class="field-list"></div>
                </div>

            </div>
        </div>
    </footer>

    <script>
        // 菜单数据
        let menuData = [];
        let currentPageFile = 'index.html'; // 记录当前正在编辑的文件名
        
        // --- 底部栏逻辑系统 ---

        // 1. 样式控制核心 (增强版)
        const StyleSystem = {
            getDoc: () => window.editor.Canvas.getDocument().documentElement,

            // 修改全局变量
            setGlobal: function(prop, val) {
                this.getDoc().style.setProperty(`--global-${prop}`, val);
            },

            // 修改局部 CSS 变量
            setLocal: function(prop, val) {
                const selected = window.editor.getSelected();
                if (selected) {
                    const style = {};
                    style[`--${prop}`] = val;
                    selected.addStyle(style);
                }
            },
            
            setLocalColor: function(prop, hex) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                this.setLocal(prop, `${r}, ${g}, ${b}`);
            },

            // A. 直接设置 CSS 属性 (用于字号、颜色等)
            setCss: function(prop, val) {
                const selected = window.editor.getSelected();
                if(selected) {
                    selected.addStyle({ [prop]: val });
                }
            },

            // B. 切换 CSS 属性 (用于加粗、倾斜)
            // toggleVal: 要切换的值(如 bold), defaultVal: 默认值(如 normal)
            toggleCss: function(prop, toggleVal, defaultVal, btnElement) {
                const selected = window.editor.getSelected();
                if(!selected) return;

                const currentStyle = selected.getStyle();
                const currentVal = currentStyle[prop];

                // 检查当前是否已经是该值
                const isSet = currentVal === toggleVal;
                const newVal = isSet ? defaultVal : toggleVal;

                selected.addStyle({ [prop]: newVal });
                
                // 更新按钮 UI
                if(btnElement) btnElement.classList.toggle('active', !isSet);
            },

            // C. 设置对齐方式 (互斥按钮组)
            setAlign: function(alignVal) {
                this.setCss('text-align', alignVal);
                // 更新 UI
                ['left', 'center', 'right', 'justify'].forEach(a => {
                    document.getElementById('align-' + a).classList.toggle('active', a === alignVal);
                });
            }
        };

        // 2. 标签切换逻辑
        function switchBottomTab(tab) {
            document.getElementById('tab-global').classList.toggle('active', tab === 'global');
            document.getElementById('tab-comp').classList.toggle('active', tab === 'component');
            document.getElementById('panel-global').classList.toggle('hidden', tab !== 'global');
            document.getElementById('panel-component').classList.toggle('hidden', tab !== 'component');
        }

        function normalizeColorValue(value) {
            if (!value) return '#ffffff';
            if (value.startsWith('#')) return value;
            const match = value.match(/^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$/);
            if (!match) return '#ffffff';
            const toHex = (num) => ("0" + parseInt(num, 10).toString(16)).slice(-2);
            return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
        }

        function getComponentRootElement(model) {
            if (!model) return null;
            const el = model.getEl();
            if (!el) return null;
            return el.closest('[data-no7-fields]');
        }

        function isInsideFreeform(model) {
            if (!model) return false;
            const el = model.getEl();
            if (!el) return false;
            return Boolean(el.closest('.freeform-frame'));
        }

        function getComponentRootModel(rootEl) {
            if (!rootEl || !window.editor) return null;
            const wrapper = window.editor.DomComponents.getWrapper();
            if (!wrapper) return null;
            const matches = wrapper.find('[data-no7-fields]');
            return matches.find((component) => component.getEl() === rootEl) || null;
        }

        function getComponentFields(rootEl) {
            if (!rootEl) return [];
            const raw = rootEl.dataset.no7Fields;
            if (!raw) return [];
            try {
                return JSON.parse(decodeURIComponent(raw));
            } catch (error) {
                console.warn('解析组件字段失败:', error);
                return [];
            }
        }

        function getFieldTarget(rootEl, rootModel, field) {
            const selector = field.selector;
            const targetEl = selector ? rootEl.querySelector(selector) : rootEl;
            let targetModel = rootModel;
            if (selector && rootModel) {
                const candidates = rootModel.find(selector);
                if (candidates.length > 0) {
                    targetModel = candidates[0];
                }
            }
            return { targetEl, targetModel };
        }

        function getFieldValue(field, rootEl) {
            const selector = field.selector;
            const target = selector ? rootEl.querySelector(selector) : rootEl;
            if (!target) return '';

            if (field.style) {
                const computed = window.getComputedStyle(target);
                return computed.getPropertyValue(field.style).trim();
            }

            const attribute = field.attribute || 'text';
            if (attribute === 'text') return target.textContent.trim();
            if (attribute === 'html') return target.innerHTML.trim();
            return target.getAttribute(attribute) || '';
        }

        function applyFieldValue(field, rootEl, rootModel, value) {
            const { targetEl, targetModel } = getFieldTarget(rootEl, rootModel, field);
            if (!targetEl) return;

            if (field.style) {
                targetEl.style.setProperty(field.style, value);
                if (targetModel) {
                    targetModel.addStyle({ [field.style]: value });
                }
                return;
            }

            const attribute = field.attribute || 'text';
            if (attribute === 'text') {
                if (targetModel) {
                    targetModel.components(value);
                } else {
                    targetEl.textContent = value;
                }
            } else if (attribute === 'html') {
                if (targetModel) {
                    targetModel.components(value);
                } else {
                    targetEl.innerHTML = value;
                }
            } else {
                targetEl.setAttribute(attribute, value);
                if (targetModel) {
                    targetModel.addAttributes({ [attribute]: value });
                }
            }
        }

        function clearComponentFields() {
            const container = document.getElementById('comp-fields-container');
            if (container) {
                container.innerHTML = '';
            }
        }

        function renderComponentFields(fields, rootEl) {
            const container = document.getElementById('comp-fields-container');
            if (!container) return;
            container.innerHTML = '';

            const rootModel = getComponentRootModel(rootEl);

            fields.forEach((field) => {
                const item = document.createElement('div');
                item.className = 'field-item';

                const label = document.createElement('label');
                label.className = 'field-label';
                label.textContent = field.label || field.key || '字段';

                let input;
                if (field.type === 'textarea') {
                    input = document.createElement('textarea');
                    input.className = 'field-textarea';
                } else {
                    input = document.createElement('input');
                    input.className = 'field-input';
                    input.type = field.type === 'color' ? 'color' : 'text';
                    if (field.type === 'color') {
                        input.classList.add('field-color');
                    }
                }

                let value = getFieldValue(field, rootEl);
                if (field.type === 'color') {
                    value = normalizeColorValue(value);
                }
                if (value) {
                    input.value = value;
                }

                input.addEventListener('input', (event) => {
                    applyFieldValue(field, rootEl, rootModel, event.target.value);
                });

                item.appendChild(label);
                item.appendChild(input);
                container.appendChild(item);
            });
        }

        // 3. 核心：监听组件选中，更新底部栏状态
        function initSelectionListener(editor) {
            editor.on('component:selected', (model) => {
                const selected = model;
                
                // A. 自动切到组件面板
                switchBottomTab('component');
                document.getElementById('comp-msg-none').classList.add('hidden');

                // B. 隐藏所有专属面板
                document.getElementById('comp-props-glass').classList.add('hidden');
                document.getElementById('comp-props-text').classList.add('hidden');
                document.getElementById('comp-props-image').classList.add('hidden');
                document.getElementById('comp-props-fields').classList.add('hidden');

                const componentRoot = getComponentRootElement(selected);
                const fields = getComponentFields(componentRoot);
                if (fields.length > 0) {
                    document.getElementById('comp-props-fields').classList.remove('hidden');
                    renderComponentFields(fields, componentRoot);
                    return;
                }

                if (isInsideFreeform(selected)) {
                    editor.setDragMode('absolute');
                } else {
                    editor.setDragMode('translate');
                }

                // C. 智能识别并显示对应面板
                if (selected.is('text') || selected.attributes.type === 'text' || selected.getEl().innerText.trim().length > 0) {
                    // --> 是文本 (或包含文本的容器)
                    document.getElementById('comp-props-text').classList.remove('hidden');
                    syncTextToolbar(selected); // 同步数据回显
                    
                } else if (selected.is('image')) {
                    // --> 是图片
                    document.getElementById('comp-props-image').classList.remove('hidden');
                    
                } else {
                    // --> 默认为玻璃容器
                    document.getElementById('comp-props-glass').classList.remove('hidden');
                    
                    // 回显玻璃属性
                    const style = selected.getStyle();
                    if (style['--blur']) document.getElementById('lc-blur').value = parseFloat(style['--blur']);
                    if (style['--radius']) document.getElementById('lc-radius').value = parseFloat(style['--radius']);
                    if (style['--bg-opacity']) document.getElementById('lc-opacity').value = parseFloat(style['--bg-opacity']) * 100;
                }
            });

            editor.on('component:deselected', () => {
                document.getElementById('comp-msg-none').classList.remove('hidden');
                document.getElementById('comp-props-glass').classList.add('hidden');
                document.getElementById('comp-props-text').classList.add('hidden');
                document.getElementById('comp-props-image').classList.add('hidden');
                document.getElementById('comp-props-fields').classList.add('hidden');
                clearComponentFields();
                editor.setDragMode('translate');
            });
        }

        // 4. 辅助：同步文本工具栏状态 (回显)
        function syncTextToolbar(selected) {
            const style = selected.getStyle(); // 获取GrapesJS管理的样式
            const computed = window.getComputedStyle(selected.getEl()); // 获取浏览器最终计算样式

            // 1. 字号
            const size = style['font-size'] || computed.fontSize;
            if(size) document.getElementById('txt-size').value = parseFloat(size);

            // 2. 字体
            // 注意：font-family 可能带引号，简单匹配一下
            const font = style['font-family'] || computed.fontFamily;
            if(font) {
                // 尝试设置 select 的值，如果 select 里没有这个字体，可能需要额外处理
                document.getElementById('txt-font').value = font.replace(/"/g, "'");
            }

            // 3. 颜色回显
            // 转换 rgb(r,g,b) 到 hex #RRGGBB 的简单函数
            const rgb2hex = (rgb) => {
                if (!rgb || rgb === 'transparent') return '#ffffff';
                if (rgb.startsWith('#')) return rgb;
                const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                if (!rgbMatch) return '#ffffff';
                const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
                return "#" + hex(rgbMatch[1]) + hex(rgbMatch[2]) + hex(rgbMatch[3]);
            };

            const textColor = style['color'] || computed.color;
            const bgColor = style['background-color'] || computed.backgroundColor;

            if(textColor) {
                const hex = rgb2hex(textColor);
                document.getElementById('txt-color').value = hex;
                document.getElementById('indicator-text-color').style.background = hex;
            }
            if(bgColor) {
                const hex = rgb2hex(bgColor);
                document.getElementById('txt-bg').value = hex;
                document.getElementById('indicator-bg-color').style.background = hex;
            }

            // 4. 按钮状态高亮 (B/I/U/S)
            const weight = style['font-weight'] || computed.fontWeight;
            document.getElementById('btn-bold').classList.toggle('active', weight === 'bold' || parseInt(weight) >= 700);

            const fontStyle = style['font-style'] || computed.fontStyle;
            document.getElementById('btn-italic').classList.toggle('active', fontStyle === 'italic');

            const decoration = style['text-decoration'] || computed.textDecorationLine || '';
            document.getElementById('btn-underline').classList.toggle('active', decoration.includes('underline'));
            document.getElementById('btn-strike').classList.toggle('active', decoration.includes('line-through'));

            // 5. 对齐回显
            const align = style['text-align'] || computed.textAlign;
            ['left', 'center', 'right', 'justify'].forEach(a => {
                document.getElementById('align-' + a).classList.toggle('active', a === align);
            });
            
            // 6. 行高
            const lh = style['line-height'] || computed.lineHeight;
            if(lh && lh !== 'normal') {
                document.getElementById('txt-lineheight').value = parseFloat(lh);
            }
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 先初始化编辑器
            initGrapesJS();
            // 然后加载数据
            loadMenu();
            // 组件现在由 GrapesJS 的 BlockManager 管理
            loadComponentsToBlocks();
        });

        // --- 核心修改：将组件加载进 GrapesJS BlockManager --- 
        function loadComponentsToBlocks() {
            console.log('正在加载组件到 BlockManager...');
            
            fetch('../api/get-components.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        const bm = window.editor.BlockManager;
                        
                        // 1. 先添加一个核心的"矩阵容器"组件 (Matrix Container)
                        bm.add('matrix-container', {
                            label: '矩阵容器 (Matrix)',
                            category: '布局组件',
                            attributes: { class: 'fa-solid fa-border-all' }, // 图标
                            content: `
                                <div class="comp-matrix-wrapper">
                                    <style>
                                        .comp-matrix-wrapper {
                                            display: grid;
                                            /* 关键：自动填充矩阵，最小宽度 200px，自动吸附 */
                                            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                                            grid-auto-rows: minmax(150px, auto);
                                            gap: 20px;
                                            padding: 20px;
                                            min-height: 300px;
                                            background: rgba(255,255,255,0.05);
                                            border: 2px dashed rgba(255,255,255,0.2);
                                            border-radius: 12px;
                                        }
                                        /* 拖拽时的视觉提示 */
                                        .comp-matrix-wrapper:empty::before {
                                            content: '拖拽组件到这里自动吸附';
                                            color: #666;
                                            display: flex; justify-content: center; align-items: center;
                                            grid-column: 1 / -1;
                                        }
                                    </style>
                                    </div>
                            `
                        });

                        // 2. 添加自由画布容器（局部绝对定位）
                        bm.add('freeform-frame', {
                            label: '自由画布 (Freeform)',
                            category: '布局组件',
                            attributes: { class: 'fa-solid fa-expand' },
                            content: `
                                <div class="freeform-frame" data-gjs-droppable="true">
                                    <style>
                                        .freeform-frame {
                                            position: relative;
                                            min-height: 320px;
                                            border: 2px dashed rgba(255,255,255,0.3);
                                            border-radius: 12px;
                                            background: rgba(255,255,255,0.03);
                                            overflow: hidden;
                                        }
                                        .freeform-frame::before {
                                            content: '自由画布：拖入组件后可自由定位';
                                            position: absolute;
                                            inset: 0;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: rgba(255,255,255,0.45);
                                            font-size: 12px;
                                            pointer-events: none;
                                        }
                                        .freeform-frame > * {
                                            position: absolute;
                                        }
                                    </style>
                                </div>
                            `
                        });

                        // 3. 循环添加 API 返回的组件
                        data.components.forEach((comp, index) => {
                            // 为每个组件生成唯一ID
                            const compId = comp.name.toLowerCase().replace(/\s+/g, '-') + '-' + index;
                            const fields = Array.isArray(comp.fields) ? comp.fields : [];
                            const encodedFields = encodeURIComponent(JSON.stringify(fields));
                            const componentMarkup = `
                                <div class="no7-component" data-no7-component="${comp.id}" data-no7-name="${comp.name}" data-no7-fields="${encodedFields}">
                                    ${comp.template}
                                </div>
                                <style>${comp.style || ''}</style>
                            `;
                            bm.add(compId, {
                                label: comp.name,
                                category: comp.category || '未分类',
                                attributes: { class: `fa-solid ${comp.icon}` },
                                content: componentMarkup
                            });
                        });
                        
                        // 4. 重新渲染侧边栏 (使用我们自定义的渲染函数)
                        renderCustomBlocks();
                    }
                })
                .catch(error => {
                    console.error('组件加载失败:', error);
                });
        }
        
        // 自定义渲染函数
        function renderCustomBlocks() {
            const editor = window.editor;
            if (!editor) return;
            
            const bm = editor.BlockManager;
            const container = document.querySelector('.comp-grid');
            container.innerHTML = ''; // 清空旧内容
            
            // 获取所有blocks并转换为数组
            const blocks = Array.from(bm.getAll().values());
            
            // 按分类分组
            const categories = {};
            blocks.forEach(block => {
                // 使用正确的API获取分类
                const blockData = block.toJSON();
                const cat = blockData.category || '未分类';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(block);
            });
            
            // 渲染
            for (const [cat, items] of Object.entries(categories)) {
                // 分类标题
                const catTitle = document.createElement('h4');
                catTitle.style.cssText = 'font-size:11px; font-weight:700; color:#52525b; margin:15px 0 10px 4px; text-transform:uppercase; width:100%;';
                catTitle.innerHTML = cat;
                container.appendChild(catTitle);
                
                items.forEach(block => {
                    // 使用toJSON()获取block数据
                    const blockData = block.toJSON();
                    
                    // 创建卡片DOM
                    const el = document.createElement('div');
                    el.className = 'comp-card';
                    el.draggable = true;
                    el.title = blockData.label;
                    el.innerHTML = `
                        <i class="${blockData.attributes.class}"></i>
                        <span>${blockData.label}</span>
                    `;
                    
                    // 连接GrapesJS的拖拽引擎
                    el.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', ''); // Firefox hack
                        // 告诉编辑器开始拖拽这个block
                        editor.BlockManager.dragStart(block);
                    });
                    
                    // 点击直接添加
                    el.addEventListener('click', () => {
                        const content = blockData.content;
                        editor.addComponents(content);
                    });
                    
                    container.appendChild(el);
                });
            }
        }

        // --- 关键：初始化 GrapesJS 编辑器 --- 
        function initGrapesJS() {
            const canvasFrame = document.getElementById('canvas-frame');
            canvasFrame.innerHTML = ''; // 清空占位文字

            const editor = grapesjs.init({
                container: canvasFrame,
                height: '100%',
                width: '100%',
                storageManager: false, // 禁用默认的 LocalStorage
                // 关键修复：配置 blockManager 渲染到你的侧边栏 DOM 里
                blockManager: {
                    appendTo: '.comp-grid', // 指定渲染目标是你右侧的 div
                    // 自定义 Block 的渲染外观，让它长得像你的卡片
                    custom: true
                },
                // 默认流式拖拽，绝对定位仅在自由画布容器内启用
                dragMode: 'translate',
                
                panels: { defaults: [] }, // 清空默认面板
                
                // 画布配置
                canvas: {
                    styles: [
                        // 引入 FontAwesome 确保画布里图标显示正常
                        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
                    ],
                    scripts: []
                }
            });

            // --- 移除旧的 BlockManager.render 覆盖，使用独立的自定义渲染函数 ---

            // 初始化组件选中监听
            initSelectionListener(editor);

            // 编辑器加载后，强制注入画布背景色
            editor.on('load', () => {
                const head = editor.Canvas.getDocument().head;
                head.insertAdjacentHTML('beforeend', `
                    <style>
                        body { 
                            background-color: #121212; /* 与你后台背景一致 */
                            color: #fff;
                            margin: 0;
                            padding: 20px; /* 给一点呼吸空间 */
                        }
                        /* 让选中框好看一点 */
                        .gjs-selected {
                            outline: 2px solid #3b82f6 !important;
                            outline-offset: 2px;
                        }
                    </style>
                `);
            });

            // 在 init 之后手动加载内容
            // 加载 HTML
            fetch('../pages-source/index.html')
                .then(res => res.text())
                .then(html => {
                    // 如果文件是空的，加载默认模板
                    if(!html || html.trim() === '') {
                        html = `
                            <div class="comp-matrix-wrapper"></div>
                        `;
                    }
                    editor.setComponents(html);
                })
                .catch(error => {
                    console.error('加载HTML失败:', error);
                    // 加载失败时使用默认模板
                    const defaultHtml = `
                        <div class="comp-matrix-wrapper"></div>
                    `;
                    editor.setComponents(defaultHtml);
                });
                
            // 加载 CSS
            fetch('../pages-source/style.css')
                .then(res => res.text())
                .then(css => {
                    editor.setStyle(css);
                })
                .catch(error => {
                    console.error('加载CSS失败:', error);
                    // 加载失败时使用默认样式
                    const defaultCss = `
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                        }
                    `;
                    editor.setStyle(defaultCss);
                });

            window.editor = editor;
        }
        
        // 设备切换逻辑
        function resizeCanvas(width, btn) {
            document.getElementById('canvas-frame').style.width = width;
            
            // 按钮高亮处理
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        
        // --- 大纲树核心逻辑 (Tree System) ---

        // 1. 渲染大纲树 (入口)
        function renderMenuTree() {
            const root = document.getElementById('structure-root');
            // 使用递归函数生成 HTML
            root.innerHTML = generateTreeHTML(menuData);
            
            // 渲染后必须重新初始化嵌套拖拽
            initNestedSortable();
        }

        // 2. 递归生成 HTML (核心)
        function generateTreeHTML(items) {
            if (!items || items.length === 0) return '';
            
            return items.map(item => {
                const hasChildren = item.children && item.children.length > 0;
                const isCollapsed = item.collapsed === true;
                const arrowClass = hasChildren ? (isCollapsed ? '' : 'expanded') : 'invisible';
                const iconClass = hasChildren ? 'fa-solid fa-folder node-icon folder' : 'fa-regular fa-file node-icon file';
                
                // --- 新增：处理文件名 ---
                // 如果没有 filename 字段，默认用 label 拼一个 (兼容旧数据)
                const filename = item.filename || (item.label.toLowerCase() + '.html');
                // 显示用的标签 (如果有文件名，显示文件名，否则显示 label)
                const displayLabel = item.label;

                return `
                <li class="tree-node-li" data-id="${item.id}" data-filename="${filename}" data-type="${hasChildren ? 'folder' : 'file'}">
                    <div class="tree-content" onclick="selectNode(this, '${item.id}', '${filename}', ${hasChildren})"><div class="toggle-icon ${arrowClass}" onclick="toggleNode(event, '${item.id}')">
                            <i class="fa-solid fa-chevron-right"></i>
                        </div>
                        <i class="${iconClass}"></i>
                        
                        <span class="node-label" title="${filename}">${displayLabel} <span style="opacity:0.3; font-size:10px;">${hasChildren ? '' : filename}</span></span>
                        
                        <div class="node-actions">
                            <div class="action-btn" onclick="addSubmenu(event, '${item.id}')" title="New Page"><i class="fa-solid fa-plus"></i></div>
                            <div class="action-btn" onclick="editMenu('${item.id}')" title="Rename"><i class="fa-solid fa-pen"></i></div>
                            <div class="action-btn" onclick="deleteMenu(event, '${item.id}')" title="Delete"><i class="fa-solid fa-trash"></i></div>
                        </div>
                    </div>
                    <ul class="tree-children ${isCollapsed ? 'collapsed' : ''}">
                        ${generateTreeHTML(item.children)}
                    </ul>
                </li>
                `;
            }).join('');
        }

        // 3. 初始化嵌套拖拽 (SortableJS Nested)
        function initNestedSortable() {
            // 获取所有的 UL (包括根目录和所有子级 UL)
            const nestedSortables = document.querySelectorAll('.tree-root, .tree-children');

            nestedSortables.forEach(el => {
                new Sortable(el, {
                    group: 'nested-tree', // 允许在不同层级间拖拽
                    animation: 150,
                    fallbackOnBody: true,
                    swapThreshold: 0.65,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    handle: '.tree-content', // 整个条目作为把手
                    
                    // 防止拖拽到自己里面导致死循环
                    onMove: function (evt) {
                        const dragged = evt.dragged;
                        const related = evt.related;
                        // 简单保护：如果目标是自己的子级，禁止拖入 (SortableJS通常会自动处理，但以防万一)
                        if (dragged.contains(related)) return false;
                    },
                    
                    // 拖拽结束：保存数据
                    onEnd: function (evt) {
                        updateTreeDataFromDOM(); // 从 DOM 反解数据
                        renderMenuTree(); // 重新渲染以更新图标状态(如变文件夹)
                    }
                });
            });
        }

        // 4. 从 DOM 反解数据 (Serialize)
        // 现在的 DOM 结构是 ul > li > ul，我们需要递归读取
        function updateTreeDataFromDOM() {
            const rootUl = document.getElementById('structure-root');
            menuData = parseUl(rootUl);
            console.log('大纲结构已更新:', menuData);
            // 这里可以触发自动保存
            saveMenu();
        }

        function parseUl(ul) {
            const items = [];
            // 获取直接子级 LI
            const lis = Array.from(ul.children).filter(el => el.tagName === 'LI');
            
            lis.forEach(li => {
                const id = li.dataset.id;
                // 为了保留原有属性(如 collapsed)，先从旧数据里找，找不到就新建
                const oldItem = findMenuItem(menuData, id) || { label: 'New Node', collapsed: false };
                
                const newItem = {
                    id: id,
                    label: oldItem.label,
                    url: oldItem.url || '#',
                    collapsed: oldItem.collapsed, // 保留折叠状态
                    children: []
                };
                
                // 查找该 LI 内部的子级 UL
                const childUl = li.querySelector(':scope > .tree-children');
                if (childUl && childUl.children.length > 0) {
                    newItem.children = parseUl(childUl);
                }
                
                items.push(newItem);
            });
            return items;
        }
        
        // --- 交互功能 ---

        // 选中节点并切换页面
        async function selectNode(el, id, filename, isFolder) {
            // 1. UI 高亮处理
            document.querySelectorAll('.tree-content').forEach(e => e.classList.remove('active'));
            el.classList.add('active');
            
            // 2. 如果是文件夹，只切换折叠状态，不加载页面
            if (isFolder) {
                toggleNode({ stopPropagation: () => {} }, id);
                return;
            }

            // 3. 如果点击的是当前页面，无需重新加载
            if (filename === currentPageFile) return;

            // 4. 切换页面流程
            if (confirm(`即将切换到 ${filename}，是否保存当前页面？`)) {
                await saveProject(); // 等待保存完成
            }

            console.log(`正在切换页面: ${currentPageFile} -> ${filename}`);
            loadPageContent(filename);
        }

        // 加载指定页面内容到编辑器
        function loadPageContent(filename) {
            const editor = window.editor;
            if (!editor) return;

            // 显示加载中...
            editor.setComponents('<div style="padding:50px; text-align:center; color:#fff;">Loading...</div>');

            fetch(`../api/get-page.php?file=${filename}`)
                .then(res => res.json())
                .then(data => {
                    // 更新当前全局变量
                    currentPageFile = filename;
                    
                    // 清除撤销历史 (防止撤销到上一个页面)
                    editor.UndoManager.clear();

                    if (data.status === 'success' || data.status === 'empty') {
                        // 如果是空文件，给个默认矩阵容器
                        const content = data.html || `
                            <div class="comp-matrix-wrapper"></div>
                        `;
                        editor.setComponents(content);
                        editor.setStyle(data.css || '');
                        
                        // 更新顶部标题
                        document.querySelector('.top-bar .brand span').innerText = `STUDIO - ${filename}`;
                    } else {
                        alert('读取页面失败');
                    }
                })
                .catch(err => console.error(err));
        }

        // 折叠/展开节点
        function toggleNode(e, id) {
            e.stopPropagation(); // 防止触发选中
            const item = findMenuItem(menuData, id);
            if (item) {
                item.collapsed = !item.collapsed; // 切换状态
                renderMenuTree(); // 重新渲染 (数据驱动视图)
            }
        }

        // 辅助：处理文件名输入
        function promptForFilename(defaultName = 'untitled.html') {
            let name = prompt('请输入页面文件名 (必须以 .html 结尾):', defaultName);
            if (name === null) return null;
            name = name.trim();
            if (name === '') return null;
            
            // 强制添加 .html 后缀
            if (!name.endsWith('.html') && !name.endsWith('.php')) {
                name += '.html';
            }
            return name;
        }

        // 添加子节点
        function addSubmenu(e, parentId) {
            e.stopPropagation();
            const parentItem = findMenuItem(menuData, parentId);
            if (parentItem) {
                const filename = promptForFilename('sub-page.html');
                if (!filename) return;
                
                const label = prompt('请输入菜单显示名称:', filename.replace('.html', ''));
                if (!label) return;

                createPhysicalFile(filename).then(success => {
                    if (success) {
                        parentItem.collapsed = false;
                        if (!parentItem.children) parentItem.children = [];
                        
                        parentItem.children.push({
                            id: 'page-' + Date.now(),
                            label: label,
                            filename: filename,
                            children: [],
                            collapsed: false
                        });
                        renderMenuTree();
                        saveMenu();
                    }
                });
            }
        }

        // 顶部添加节点
        function addTopMenu() {
            const filename = promptForFilename('new-page.html');
            if (!filename) return;

            const label = prompt('请输入菜单显示名称:', filename.replace('.html', ''));
            if (!label) return;

            // 1. 调用后端创建物理文件
            createPhysicalFile(filename).then(success => {
                if (success) {
                    // 2. 更新菜单数据结构
                    const newId = 'page-' + Date.now();
                    menuData.push({
                        id: newId,
                        label: label,
                        filename: filename, // 存入文件名
                        children: [],
                        collapsed: false
                    });
                    renderMenuTree();
                    saveMenu(); // 保存菜单结构
                }
            });
        }

        // 删除节点
        function deleteMenu(e, id) {
            e.stopPropagation();
            if (confirm('Delete this node and all its children?')) {
                menuData = removeMenuItem(menuData, id);
                renderMenuTree();
                saveMenu();
            }
        }

        // 编辑菜单 (重命名)
        function editMenu(id) {
            const menuItem = findMenuItem(menuData, id);
            if (menuItem) {
                // 1. 修改显示名称
                const newLabel = prompt('修改显示名称:', menuItem.label);
                if (newLabel !== null) menuItem.label = newLabel;

                // 2. 修改文件名 (如果是文件而不是文件夹)
                if (!menuItem.children || menuItem.children.length === 0) {
                    const currentFile = menuItem.filename || (menuItem.label + '.html');
                    const newFilename = promptForFilename(currentFile);
                    
                    if (newFilename && newFilename !== currentFile) {
                        if(confirm(`确定要将文件 ${currentFile} 重命名为 ${newFilename} 吗？(注意：你需要手动在服务器修改文件名，或者这里我们只改引用)`)) {
                            menuItem.filename = newFilename;
                            // TODO: 这里可以调用一个 rename-file.php 接口来真正修改文件名
                        }
                    }
                }
                renderMenuTree();
                saveMenu();
            }
        }

        // 调用 API 创建物理文件
        async function createPhysicalFile(filename) {
            try {
                const res = await fetch('../api/create-page.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ filename: filename })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    return true;
                } else {
                    alert('创建文件失败: ' + data.message);
                    return false;
                }
            } catch (e) {
                alert('网络错误');
                return false;
            }
        }

        // 递归查找 (辅助函数)
        function findMenuItem(list, id) {
            for (let item of list) {
                if (item.id === id) return item;
                if (item.children) {
                    const found = findMenuItem(item.children, id);
                    if (found) return found;
                }
            }
            return null;
        }

        // 递归删除 (辅助函数)
        function removeMenuItem(list, id) {
            return list.filter(item => {
                if (item.id === id) return false;
                if (item.children) {
                    item.children = removeMenuItem(item.children, id);
                }
                return true;
            });
        }
        
        // 从API加载菜单数据
        function loadMenu() {
            fetch('../api/get-menu.php')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        menuData = data.menu;
                        renderMenuTree();
                        
                        // --- 新增：自动打开第一个页面 --- 
                        if (menuData.length > 0) {
                            const firstPage = menuData[0];
                            // 模拟点击第一个节点，加载 index.html
                            // 注意：这里我们手动调用逻辑，而不是触发 click 事件，避免复杂的 DOM 查找
                            const filename = firstPage.filename || (firstPage.label.toLowerCase() + '.html');
                            
                            // 选中 UI
                            setTimeout(() => {
                                const firstNode = document.querySelector(`.tree-node-li[data-id="${firstPage.id}"] .tree-content`);
                                if(firstNode) firstNode.classList.add('active');
                            }, 100);
                            
                            // 加载内容
                            console.log('自动加载首页:', filename);
                            loadPageContent(filename);
                        }
                    } else {
                        console.error('加载菜单失败：', data.message);
                        // 加载失败时使用默认数据
                        menuData = [
                            {
                                id: 'home',
                                label: 'Home',
                                children: [],
                                collapsed: false
                            },
                            {
                                id: 'works',
                                label: 'Works',
                                children: [
                                    {
                                        id: 'works-illustrations',
                                        label: 'Illustrations',
                                        children: [],
                                        collapsed: false
                                    },
                                    {
                                        id: 'works-web-design',
                                        label: 'Web Design',
                                        children: [],
                                        collapsed: false
                                    }
                                ],
                                collapsed: false
                            },
                            {
                                id: 'contact',
                                label: 'Contact',
                                children: [],
                                collapsed: false
                            }
                        ];
                        renderMenuTree();
                    }
                })
                .catch(error => {
                    console.error('加载菜单失败：

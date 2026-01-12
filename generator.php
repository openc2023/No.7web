<?php
// generator.php - 静态页面生成脚本

// 定义目录路径
$baseDir = __DIR__;
$siteJsonPath = $baseDir . '/config/site.json';
$pagesSourceDir = $baseDir . '/pages-source';
$componentsDir = $baseDir . '/components';
$publicDir = $baseDir . '/public';

// 检查必要的目录和文件
if (!file_exists($siteJsonPath)) {
    die('Error: site.json file not found');
}

if (!is_dir($pagesSourceDir)) {
    die('Error: pages-source directory not found');
}

if (!is_dir($publicDir)) {
    mkdir($publicDir, 0777, true);
}

// 读取site.json文件
$siteContent = file_get_contents($siteJsonPath);
$siteData = json_decode($siteContent, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die('Error: Invalid site.json file - ' . json_last_error_msg());
}

// 获取全局配置和菜单数据
$global = $siteData['global'] ?? [];
$menu = $siteData['menu'] ?? [];

// 读取组件
$components = [];
scanComponents($componentsDir, $components);

// 生成导航栏HTML
$navHtml = generateNavigation($menu);

// 生成页面
$pages = scandir($pagesSourceDir);

foreach ($pages as $page) {
    if ($page === '.' || $page === '..') {
        continue;
    }
    
    $pagePath = $pagesSourceDir . '/' . $page;
    if (is_file($pagePath) && pathinfo($pagePath, PATHINFO_EXTENSION) === 'html') {
        // 读取页面内容
        $pageContent = file_get_contents($pagePath);
        
        // 生成完整的HTML页面
        $html = generateFullHtml($global, $navHtml, $pageContent, $components);
        
        // 保存到public目录
        $outputPath = $publicDir . '/' . $page;
        file_put_contents($outputPath, $html);
        
        echo "Generated page: $outputPath<br>";
    }
}

// 生成首页重定向（如果index.html不存在）
if (!file_exists($publicDir . '/index.html')) {
    $indexContent = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=index.html"></head><body></body></html>';
    file_put_contents($publicDir . '/index.html', $indexContent);
    echo "Generated redirect: index.html<br>";
}

echo "<br>✅ All pages generated successfully!";

// 扫描组件目录
function scanComponents($dir, &$components) {
    $items = scandir($dir);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        
        $itemPath = $dir . '/' . $item;
        
        if (is_dir($itemPath)) {
            // 检查是否有config.json文件
            $configPath = $itemPath . '/config.json';
            if (file_exists($configPath)) {
                // 读取组件配置
                $configContent = file_get_contents($configPath);
                $config = json_decode($configContent, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    // 读取组件模板
                    $templatePath = $itemPath . '/template.html';
                    $template = '';
                    if (file_exists($templatePath)) {
                        $template = file_get_contents($templatePath);
                    }
                    
                    // 读取组件样式
                    $stylePath = $itemPath . '/style.css';
                    $style = '';
                    if (file_exists($stylePath)) {
                        $style = file_get_contents($stylePath);
                    }
                    
                    // 添加组件信息
                    $components[] = [
                        'name' => $config['name'],
                        'template' => $template,
                        'style' => $style
                    ];
                }
            }
            
            // 递归扫描子目录
            scanComponents($itemPath, $components);
        }
    }
}

// 生成导航栏
function generateNavigation($menu) {
    $html = '<nav class="navbar">';
    $html .= '<div class="container">';
    $html .= '<div class="navbar-brand">';
    $html .= '<a href="index.html" class="navbar-logo">Logo</a>';
    $html .= '</div>';
    $html .= '<ul class="navbar-menu">';
    
    foreach ($menu as $item) {
        $html .= generateNavItem($item);
    }
    
    $html .= '</ul>';
    $html .= '</div>';
    $html .= '</nav>';
    
    return $html;
}

// 生成导航项
function generateNavItem($item) {
    $hasChildren = isset($item['children']) && is_array($item['children']) && count($item['children']) > 0;
    
    $html = '<li class="navbar-item">';
    $html .= '<a href="' . $item['url'] . '" class="navbar-link">' . $item['label'] . '</a>';
    
    if ($hasChildren) {
        $html .= '<ul class="navbar-dropdown">';
        
        foreach ($item['children'] as $child) {
            $html .= generateNavItem($child);
        }
        
        $html .= '</ul>';
    }
    
    $html .= '</li>';
    
    return $html;
}

// 生成完整的HTML页面
function generateFullHtml($global, $navHtml, $pageContent, $components) {
    $title = $global['title'] ?? 'No.7 Website';
    $description = $global['description'] ?? 'Built with No.7 Studio';
    
    // 生成CSS样式
    $css = generateCSS($components);
    
    $html = <<<HTML
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <meta name="description" content="$description">
    <style>
        /* 基础样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* 导航栏样式 */
        .navbar {
            background-color: #333;
            color: #fff;
            padding: 1rem 0;
        }
        
        .navbar-brand {
            display: inline-block;
        }
        
        .navbar-logo {
            color: #fff;
            text-decoration: none;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .navbar-menu {
            list-style: none;
            display: flex;
            margin-top: 0;
        }
        
        .navbar-item {
            position: relative;
            margin-left: 20px;
        }
        
        .navbar-link {
            color: #fff;
            text-decoration: none;
            padding: 0.5rem 1rem;
            display: block;
        }
        
        .navbar-link:hover {
            background-color: #555;
        }
        
        /* 下拉菜单 */
        .navbar-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background-color: #333;
            list-style: none;
            min-width: 150px;
            display: none;
            z-index: 1000;
        }
        
        .navbar-item:hover .navbar-dropdown {
            display: block;
        }
        
        /* 页面内容 */
        .page-content {
            background-color: #fff;
            padding: 2rem 0;
            min-height: 500px;
        }
        
        /* 页脚 */
        .footer {
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 2rem 0;
            margin-top: 2rem;
        }
        
        /* 组件样式 */
        $css
    </style>
</head>
<body>
    <!-- 导航栏 -->
    $navHtml
    
    <!-- 页面内容 -->
    <main class="page-content">
        <div class="container">
            $pageContent
        </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
        <div class="container">
            <p>&copy; " . date('Y') . " $title. Built with No.7 Studio.</p>
        </div>
    </footer>
</body>
</html>
HTML;
    
    return $html;
}

// 生成CSS样式
function generateCSS($components) {
    $css = '';
    
    foreach ($components as $component) {
        if (!empty($component['style'])) {
            $css .= $component['style'] . "\n";
        }
    }
    
    return $css;
}


?>
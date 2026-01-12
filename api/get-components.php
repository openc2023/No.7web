<?php
// get-components.php - 获取组件列表

// 设置响应头
header('Content-Type: application/json');

// 定义components目录路径
$componentsDir = '../components';

// 检查目录是否存在
if (!is_dir($componentsDir)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'components目录不存在'
    ]);
    exit;
}

// 扫描components目录
$components = [];

// 使用递归方式扫描所有组件目录
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
                        'category' => $config['category'],
                        'icon' => $config['icon'],
                        'description' => $config['description'] ?? '',
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

// 执行扫描
scanComponents($componentsDir, $components);

// 返回组件列表
echo json_encode([
    'status' => 'success',
    'components' => $components
]);
?>
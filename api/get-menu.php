<?php
// get-menu.php - 读取菜单配置

// 设置响应头
header('Content-Type: application/json');

// 定义site.json文件路径
$siteJsonPath = '../config/site.json';

// 检查文件是否存在
if (!file_exists($siteJsonPath)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'site.json文件不存在'
    ]);
    exit;
}

// 读取文件内容
$siteJsonContent = file_get_contents($siteJsonPath);

// 解析JSON
$siteData = json_decode($siteJsonContent, true);

// 检查解析是否成功
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => 'error',
        'message' => 'site.json文件解析失败: ' . json_last_error_msg()
    ]);
    exit;
}

// 检查是否存在menu字段
if (!isset($siteData['menu'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'site.json文件中缺少menu字段'
    ]);
    exit;
}

// 返回菜单数据
echo json_encode([
    'status' => 'success',
    'menu' => $siteData['menu']
]);
?>
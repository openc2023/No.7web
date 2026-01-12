<?php
// save-menu.php - 保存菜单配置

// 设置响应头
header('Content-Type: application/json');

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => '只允许POST请求'
    ]);
    exit;
}

// 读取POST数据
$postData = file_get_contents('php://input');

// 解析JSON
$requestData = json_decode($postData, true);

// 检查解析是否成功
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => 'error',
        'message' => '请求数据解析失败: ' . json_last_error_msg()
    ]);
    exit;
}

// 检查是否存在menu字段
if (!isset($requestData['menu'])) {
    echo json_encode([
        'status' => 'error',
        'message' => '请求数据中缺少menu字段'
    ]);
    exit;
}

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

// 读取现有数据
$siteJsonContent = file_get_contents($siteJsonPath);
$siteData = json_decode($siteJsonContent, true);

// 更新菜单数据
$siteData['menu'] = $requestData['menu'];

// 保存到文件
$success = file_put_contents($siteJsonPath, json_encode($siteData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($success !== false) {
    echo json_encode([
        'status' => 'success',
        'message' => '菜单保存成功'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => '菜单保存失败，可能是权限问题'
    ]);
}
?>
<?php
// admin/api/save-menu.php
header('Content-Type: application/json');
require_once '../core/Studio.php'; // 引入 SDK

// 检查请求方法是否为POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => '仅支持POST请求'
    ]);
    exit;
}

// 获取POST数据
$postData = file_get_contents('php://input');

// 解析JSON数据
$requestData = json_decode($postData, true);

// 检查JSON解析是否成功
if ($requestData === null) {
    echo json_encode([
        'status' => 'error',
        'message' => '请求数据格式错误'
    ]);
    exit;
}

// 检查菜单数据是否存在
if (!isset($requestData['menu']) || !is_array($requestData['menu'])) {
    echo json_encode([
        'status' => 'error',
        'message' => '菜单数据不存在或格式错误'
    ]);
    exit;
}

try {
    $studio = new Studio(); // 实例化
    
    if ($studio->saveMenu($requestData)) {
        echo json_encode([
            'status' => 'success',
            'message' => '菜单保存成功'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => '菜单保存失败'
        ]);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
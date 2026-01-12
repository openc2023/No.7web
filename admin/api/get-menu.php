<?php
// admin/api/get-menu.php
header('Content-Type: application/json');
require_once '../core/Studio.php'; // 引入 SDK

try {
    $studio = new Studio(); // 实例化
    $response = $studio->getMenu(); // 调用方法
    
    echo json_encode($response);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
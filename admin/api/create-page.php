<?php
// admin/api/create-page.php
header('Content-Type: application/json');
require_once '../core/Studio.php'; // 引入 SDK

$data = json_decode(file_get_contents('php://input'), true);
$filename = $data['filename'] ?? '';

if (!$filename) {
    echo json_encode(['status' => 'error', 'message' => '文件名不能为空']);
    exit;
}

$studio = new Studio(); // 实例化

if ($studio->createPage($filename)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => '文件已存在']);
}
?>
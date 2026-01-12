<?php
// admin/api/save-page.php
header('Content-Type: application/json');
require_once '../core/Studio.php'; // 引入 SDK

$data = json_decode(file_get_contents('php://input'), true);
$filename = $data['filename'] ?? 'index.html';
$html = $data['html'] ?? '';
$css = $data['css'] ?? '';

$studio = new Studio(); // 实例化

if ($studio->savePage($filename, $html, $css)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Write permission denied']);
}
?>
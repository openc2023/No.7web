<?php
// admin/api/get-page.php
header('Content-Type: application/json');
require_once '../core/Studio.php'; // 引入 SDK

$file = $_GET['file'] ?? 'index.html'; // 默认加载 index.html

$studio = new Studio(); // 实例化
$response = $studio->getPage($file); // 调用方法

echo json_encode($response);
?>
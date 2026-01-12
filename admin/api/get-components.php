<?php
// admin/api/get-components.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

function respond($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function safe_read($baseDir, $relativePath, $maxBytes = 262144) {
    $full = realpath($baseDir . DIRECTORY_SEPARATOR . $relativePath);
    if ($full === false) {
        return null;
    }

    $baseReal = realpath($baseDir);
    if ($baseReal === false || strpos($full, $baseReal) !== 0) {
        return null;
    }

    if (!is_file($full)) {
        return null;
    }

    $size = filesize($full);
    if ($size === false || $size > $maxBytes) {
        return null;
    }

    return file_get_contents($full);
}

$componentsDir = realpath(__DIR__ . '/../../components');
if ($componentsDir === false || !is_dir($componentsDir)) {
    respond(['status' => 'error', 'message' => 'components folder not found'], 500);
}

$components = [];
$iterator = new DirectoryIterator($componentsDir);

foreach ($iterator as $entry) {
    if ($entry->isDot() || !$entry->isDir()) {
        continue;
    }

    $folder = $entry->getFilename();
    if ($folder[0] === '.' || $folder[0] === '_') {
        continue;
    }

    $manifestRaw = safe_read($componentsDir, $folder . '/component.json');
    $manifest = [];

    if ($manifestRaw) {
        $decoded = json_decode($manifestRaw, true);
        if (is_array($decoded)) {
            $manifest = $decoded;
        }
    } else {
        $legacyRaw = safe_read($componentsDir, $folder . '/config.json');
        if ($legacyRaw) {
            $decoded = json_decode($legacyRaw, true);
            if (is_array($decoded)) {
                $manifest = $decoded;
            }
        }
    }

    if (isset($manifest['enabled']) && $manifest['enabled'] === false) {
        continue;
    }

    $name = $manifest['name'] ?? ucwords(str_replace(['-', '_'], ' ', $folder));
    $category = $manifest['category'] ?? '未分类';
    $icon = $manifest['icon'] ?? 'fa-cube';
    $templateFile = $manifest['template'] ?? 'template.html';
    $styleFile = $manifest['style'] ?? 'style.css';
    $fields = $manifest['fields'] ?? [];

    $template = safe_read($componentsDir, $folder . '/' . $templateFile);
    if (!$template || trim($template) === '') {
        continue;
    }

    $style = safe_read($componentsDir, $folder . '/' . $styleFile);
    if (!$style) {
        $style = '';
    }

    $components[] = [
        'id' => $folder,
        'name' => $name,
        'category' => $category,
        'icon' => $icon,
        'fields' => $fields,
        'template' => $template,
        'style' => $style
    ];
}

usort($components, function ($a, $b) {
    $cat = strcmp($a['category'], $b['category']);
    if ($cat !== 0) {
        return $cat;
    }
    return strcmp($a['name'], $b['name']);
});

respond(['status' => 'success', 'components' => $components]);
?>

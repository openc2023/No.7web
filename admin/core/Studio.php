<?php
// admin/core/Studio.php

class Studio {
    private $baseDir;
    private $componentsDir;
    private $pagesDir;
    private $configDir;
    private $menuFile;

    public function __construct() {
        // 定义基础路径，避免到处写 '../../'
        $this->baseDir = __DIR__ . '/../../';
        $this->componentsDir = $this->baseDir . 'components/';
        $this->pagesDir = $this->baseDir . 'pages-source/';
        $this->configDir = $this->baseDir . 'config/';
        $this->menuFile = $this->configDir . 'site.json'; // 菜单文件实际位置
        
        // 确保必要的文件夹存在
        if (!is_dir($this->pagesDir)) mkdir($this->pagesDir, 0777, true);
        if (!is_dir($this->configDir)) mkdir($this->configDir, 0777, true);
        if (!is_dir($this->componentsDir)) mkdir($this->componentsDir, 0777, true);
    }

    /**
     * SDK 功能 1: 扫描组件
     */
    public function getComponents() {
        $components = [];
        $dirs = glob($this->componentsDir . '*', GLOB_ONLYDIR);

        if ($dirs) {
            foreach ($dirs as $dirPath) {
                $folderName = basename($dirPath);
                $configFile = $dirPath . '/config.json';
                $templateFile = $dirPath . '/template.html';

                if (file_exists($configFile) && file_exists($templateFile)) {
                    $config = json_decode(file_get_contents($configFile), true);
                    $html = file_get_contents($templateFile);
                    
                    // 自动读取同名 CSS (如果有)
                    $css = '';
                    $cssFile = $dirPath . '/style.css';
                    if (file_exists($cssFile)) {
                        $css = file_get_contents($cssFile);
                    }
                    
                    $components[] = [
                        'id'       => $folderName,
                        'name'     => $config['name'] ?? $folderName,
                        'category' => $config['category'] ?? '其他',
                        'icon'     => $config['icon'] ?? 'fa-cube',
                        'fields'   => $config['fields'] ?? [],
                        'template' => $html,
                        'style'    => $css
                    ];
                }
            }
        }
        return $components;
    }

    /**
     * SDK 功能 2: 读取页面 (实现三明治架构)
     */
    public function getPage($filename) {
        $filename = basename($filename);
        $htmlPath = $this->pagesDir . $filename;
        $cssPath = $this->pagesDir . str_replace('.html', '.css', $filename);
        
        // 1. 读取 核心内容 (Body)
        $bodyContent = file_exists($htmlPath) ? file_get_contents($htmlPath) : '';

        // 2. 读取 全局头尾
        $layoutsDir = $this->baseDir . 'layouts/';
        if (!is_dir($layoutsDir)) mkdir($layoutsDir, 0777, true);
        
        $headerPath = $layoutsDir . 'header.html';
        $footerPath = $layoutsDir . 'footer.html';
        
        // 如果没有就给个默认占位
        $header = file_exists($headerPath) ? file_get_contents($headerPath) : '<div id="global-header">Header</div>';
        $footer = file_exists($footerPath) ? file_get_contents($footerPath) : '<div id="global-footer">Footer</div>';

        // 3. 拼装三明治 (Header + Body + Footer)
        $fullHtml = $header . '<div id="main-body">' . $bodyContent . '</div>' . $footer;

        return [
            'status' => 'success',
            'html' => $fullHtml,
            'css' => file_exists($cssPath) ? file_get_contents($cssPath) : ''
        ];
    }

    /**
     * SDK 功能 3: 保存页面 (实现三明治架构拆分)
     */
    public function savePage($filename, $html, $css) {
        $filename = basename($filename);
        $htmlPath = $this->pagesDir . $filename;
        $cssPath = $this->pagesDir . str_replace('.html', '.css', $filename);
        
        // 确保目录存在
        if (!is_dir($this->pagesDir)) mkdir($this->pagesDir, 0777, true);
        
        $layoutsDir = $this->baseDir . 'layouts/';
        if (!is_dir($layoutsDir)) mkdir($layoutsDir, 0777, true);
        
        $headerPath = $layoutsDir . 'header.html';
        $footerPath = $layoutsDir . 'footer.html';

        // 1. 使用 DOMDocument 解析 HTML (为了精准拆分)
        $dom = new DOMDocument();
        // 屏蔽 HTML5 标签警告
        libxml_use_internal_errors(true);
        // 处理编码，防止乱码
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        
        $xpath = new DOMXPath($dom);

        // 2. 提取并保存全局 Header
        $headerNodes = $xpath->query('//*[@id="global-header"]');
        if ($headerNodes->length > 0) {
            file_put_contents($headerPath, $dom->saveHTML($headerNodes->item(0)));
        }

        // 3. 提取并保存页面 Body (只保存 main-body 里面的内容)
        $bodyNodes = $xpath->query('//*[@id="main-body"]');
        $bodyContent = '';
        if ($bodyNodes->length > 0) {
            $mainBody = $bodyNodes->item(0);
            foreach ($mainBody->childNodes as $child) {
                $bodyContent .= $dom->saveHTML($child);
            }
        } else {
            // 如果没有 main-body 标签，保存整个 HTML
            $bodyContent = $html;
        }
        file_put_contents($htmlPath, $bodyContent);

        // 4. 提取并保存全局 Footer
        $footerNodes = $xpath->query('//*[@id="global-footer"]');
        if ($footerNodes->length > 0) {
            file_put_contents($footerPath, $dom->saveHTML($footerNodes->item(0)));
        }
        
        // 5. 保存 CSS
        $cssResult = file_put_contents($cssPath, $css);

        return true;
    }
    
    /**
     * SDK 功能 4: 创建新文件
     */
    public function createPage($filename) {
        $filename = basename($filename);
        $path = $this->pagesDir . $filename;
        
        if (file_exists($path)) return false;
        
        // 写入初始模板
        file_put_contents($path, '<div class="comp-matrix-wrapper"></div>');
        file_put_contents(str_replace('.html', '.css', $path), '');
        return true;
    }

    /**
     * SDK 功能 5: 读取菜单 (如果不存在则初始化默认值)
     */
    public function getMenu() {
        // 1. 检查 site.json 是否存在
        if (!file_exists($this->menuFile)) {
            $this->initDefaultProject(); // 不存在就创建默认项目
        }

        // 2. 读取并返回
        $json = file_get_contents($this->menuFile);
        $siteData = json_decode($json, true);
        
        // 兼容不同的site.json格式
        $menu = $siteData;
        if (isset($siteData['menu'])) {
            $menu = $siteData['menu'];
        }
        
        return [
            'status' => 'success',
            'menu' => $menu
        ];
    }
    
    /**
     * 私有方法：初始化默认项目 (首页 + 作品页)
     */
    private function initDefaultProject() {
        // A. 定义默认菜单结构
        $defaultMenu = [
            [
                "id" => "home",
                "label" => "首页",
                "filename" => "index.html",
                "children" => [],
                "collapsed" => false
            ],
            [
                "id" => "works",
                "label" => "作品",
                "filename" => "works.html",
                "children" => [],
                "collapsed" => false
            ]
        ];

        // B. 保存 site.json
        file_put_contents($this->menuFile, json_encode($defaultMenu, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // C. 创建 index.html (默认只有矩阵容器)
        $indexHtml = '<div class="comp-matrix-wrapper"></div>';
        file_put_contents($this->pagesDir . 'index.html', $indexHtml);
        file_put_contents($this->pagesDir . 'index.css', ''); // 空CSS

        // D. 创建 works.html (默认有一段文字)
        $worksHtml = ' 
        <div class="comp-matrix-wrapper"> 
            <div class="comp-card" style="width: 100%; height: auto; padding: 40px; text-align: center;"> 
                <h2 data-gjs-editable="true">我的作品集</h2> 
                <p data-gjs-editable="true">这里展示了我近期的一些设计与开发项目。</p> 
            </div> 
        </div>';
        file_put_contents($this->pagesDir . 'works.html', $worksHtml);
        file_put_contents($this->pagesDir . 'works.css', '');
    }

    /**
     * SDK 功能 6: 保存菜单
     */
    public function saveMenu($menuData) {
        // 确保目录存在
        $menuDir = dirname($this->menuFile);
        if (!is_dir($menuDir)) mkdir($menuDir, 0777, true);
        
        // 读取现有文件内容
        $siteData = [];
        if (file_exists($this->menuFile)) {
            $fileContent = file_get_contents($this->menuFile);
            $siteData = json_decode($fileContent, true) ?: [];
        }
        
        // 更新菜单数据
        $siteData = $menuData['menu'];
        
        // 保存回文件
        $result = file_put_contents($this->menuFile, json_encode($siteData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $result !== false;
    }
}

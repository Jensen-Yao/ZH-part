# ZH-part

Codex Desktop official Chinese i18n switch patch for Windows.

这个脚本不自带汉化包，也不替换界面文本。它只把 Codex Desktop 内置 Webview 里的官方 i18n 开关默认值从关闭改为开启，让程序优先加载自带的 `zh-CN` 语言资源。

## 文件

- `enable-official-zh.cmd`: Windows 启动入口。
- `enable-official-zh.js`: 实际补丁逻辑，支持 patch、verify、restore。

## 使用

以管理员身份打开 CMD，先关闭 Codex：

```cmd
taskkill /IM Codex.exe /F
taskkill /IM codex.exe /F
```

执行补丁：

```cmd
enable-official-zh.cmd --patch
```

验证状态：

```cmd
enable-official-zh.cmd --verify
```

如果结果里出现下面两项，表示官方中文开关已改成开启：

```json
"hasDisabledDefault": false
"hasEnabledDefault": true
```

恢复最近一次备份：

```cmd
enable-official-zh.cmd --restore
```

## 注意

Microsoft Store/MSIX 安装的 Codex 可能带有 `Application Protected` 保护。即使管理员有文件权限，系统也可能拒绝写入 `WindowsApps` 目录里的 `app.asar`。这种情况下脚本会失败，不建议强行破坏系统保护。

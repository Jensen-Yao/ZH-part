# ZH-part

Codex Desktop 简单汉化脚本。

## 文件

- `codex-ui-zh-localizer.js`：在 Codex 界面加载后，把仍然显示为英文的菜单、侧栏、按钮和常见状态文本替换为中文。

## 使用

把 `codex-ui-zh-localizer.js` 放到：

```text
C:\Users\18052\AppData\Roaming\Codex++\user_scripts\
```

并在 `C:\Users\18052\AppData\Roaming\Codex++\user_scripts.json` 中启用：

```json
{
  "enabled": true,
  "scripts": {
    "user:codex-ui-zh-localizer.js": true
  }
}
```

重启 Codex 后生效。

## 说明

这个版本不修改 `app.asar`，也不强行替换官方语言包；它只在本机界面层做轻量文本替换。Codex 更新后如果新增英文文案，继续补充 `TEXT_MAP` 即可。

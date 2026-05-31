(() => {
  const INSTALL_KEY = "__codexUiZhLocalizerInstalled";
  const API_KEY = "__codexUiZhLocalizer";
  const SCRIPT_VERSION = 5;
  const REFRESH_MS = 1500;

  const TEXT_MAP = new Map([
    ["File", "文件"],
    ["Edit", "编辑"],
    ["View", "视图"],
    ["Window", "窗口"],
    ["Help", "帮助"],
    ["New chat", "新建聊天"],
    ["New Chat", "新建聊天"],
    ["Quick Chat", "快速聊天"],
    ["Search", "搜索"],
    ["Search Chats…", "搜索聊天..."],
    ["Search Files…", "搜索文件..."],
    ["Plugins", "插件"],
    ["Plugins - Unlocked", "插件 - 已解锁"],
    ["Automations", "自动化"],
    ["Project", "项目"],
    ["Codex mobile", "Codex 移动端"],
    ["Computer", "电脑"],
    ["Computer Use", "电脑操控"],
    ["Pinned", "置顶"],
    ["Chats", "聊天"],
    ["Recent", "最近"],
    ["Unread", "未读"],
    ["More", "更多"],
    ["Create via chat", "通过聊天创建"],
    ["Paused", "已暂停"],
    ["Pause", "暂停"],
    ["Resume", "恢复"],
    ["Running", "运行中"],
    ["Active", "运行中"],
    ["Failed", "失败"],
    ["Succeeded", "已成功"],
    ["Completed", "已完成"],
    ["Next run", "下次运行"],
    ["Last run", "上次运行"],
    ["No automations", "暂无自动化"],
    ["Automation", "自动化"],
    ["Enabled", "已启用"],
    ["Disabled", "已禁用"],
    ["Manage", "管理"],
    ["Create", "创建"],
    ["Make Codex work your way", "按你的方式使用 Codex"],
    ["Built by OpenAI", "OpenAI 出品"],
    ["By OpenAI", "OpenAI 出品"],
    ["All", "全部"],
    ["Try in chat", "在聊天中试用"],
    ["Design", "设计"],
    ["Draft replies for every email I'm behind on", "为我来不及处理的每封邮件起草回复"],
    ["Draft replies for every email I’m behind on", "为我来不及处理的每封邮件起草回复"],
    ["Gmail Draft replies for every email I'm behind on", "Gmail 为我来不及处理的每封邮件起草回复"],
    ["Gmail Draft replies for every email I’m behind on", "Gmail 为我来不及处理的每封邮件起草回复"],
    ["Search plugins", "搜索插件"],
    ["Manage plugins", "管理插件"],
    ["Create plugin", "创建插件"],
    ["Installed", "已安装"],
    ["Install", "安装"],
    ["Uninstall", "卸载"],
    ["Details", "详情"],
    ["Featured", "精选"],
    ["Popular", "热门"],
    ["Newest", "最新"],
    ["Productivity", "效率"],
    ["Writing", "写作"],
    ["Research", "研究"],
    ["Education", "教育"],
    ["Developer tools", "开发者工具"],
    ["Data analysis", "数据分析"],
    ["No plugins found", "未找到插件"],
    ["Settings", "设置"],
    ["Settings…", "设置..."],
    ["Keyboard shortcuts", "键盘快捷键"],
    ["Keyboard Shortcuts", "键盘快捷键"],
    ["Check for updates", "检查更新"],
    ["Check for Updates…", "检查更新..."],
    ["Updates Unavailable", "更新不可用"],
    ["Automatic updates are unavailable right now.", "当前自动更新不可用。"],
    ["About Codex", "关于 Codex"],
    ["Quit", "退出"],
    ["Close Window", "关闭窗口"],
    ["Close", "关闭"],
    ["Reload", "重新加载"],
    ["Reload Window", "重新加载窗口"],
    ["Reload Browser Page", "重新加载浏览器页面"],
    ["Force Reload Browser Page", "强制重新加载浏览器页面"],
    ["Toggle Developer Tools", "切换开发者工具"],
    ["Zoom In", "放大"],
    ["Zoom Out", "缩小"],
    ["Actual Size", "实际大小"],
    ["Reset Zoom", "重置缩放"],
    ["Toggle Full Screen", "切换全屏"],
    ["Undo", "撤销"],
    ["Redo", "重做"],
    ["Cut", "剪切"],
    ["Copy", "复制"],
    ["Paste", "粘贴"],
    ["Select All", "全选"],
    ["&Copy", "复制"],
    ["&Paste", "粘贴"],
    ["Cu&t", "剪切"],
    ["Select &All", "全选"],
    ["Open in New Window", "在新窗口中打开"],
    ["New Window", "新建窗口"],
    ["Open command menu", "打开命令菜单"],
    ["Open Folder…", "打开文件夹..."],
    ["Open Terminal", "打开终端"],
    ["Open Browser Tab", "打开浏览器标签页"],
    ["Find", "查找"],
    ["Focus Browser Address Bar", "聚焦浏览器地址栏"],
    ["Process Manager", "进程管理器"],
    ["Toggle Sidebar", "切换侧边栏"],
    ["Toggle Bottom Panel", "切换底部面板"],
    ["Toggle Browser Panel", "切换浏览器面板"],
    ["Toggle Side Panel", "切换侧面板"],
    ["Toggle File Tree", "切换文件树"],
    ["Start Trace Recording", "开始跟踪记录"],
    ["Previous Chat", "上一个聊天"],
    ["Next Chat", "下一个聊天"],
    ["Archive chat", "归档聊天"],
    ["Pin chat", "置顶聊天"],
    ["Unpin chat", "取消置顶聊天"],
    ["Pin/unpin chat", "置顶/取消置顶聊天"],
    ["Rename chat", "重命名聊天"],
    ["Chat actions", "聊天操作"],
    ["Hide sidebar", "隐藏侧边栏"],
    ["Show sidebar", "显示侧边栏"],
    ["Back", "后退"],
    ["Forward", "前进"],
    ["Automation folders", "自动化文件夹"],
    ["Stop all background terminals", "停止所有后台终端"],
    ["Toggle summary", "切换摘要"],
    ["Toggle side panel", "切换侧面板"],
    ["User attachment", "用户附件"],
    ["Copy message", "复制消息"],
    ["Copy session id", "复制会话 ID"],
    ["Copy working directory", "复制工作目录"],
    ["Copy conversation path", "复制对话路径"],
    ["Copy deeplink", "复制深层链接"],
    ["Review changed files", "审阅已更改文件"],
    ["Review changes", "审阅更改"],
    ["Review", "审阅"],
    ["Good response", "好回复"],
    ["Bad response", "差回复"],
    ["Fork from this point", "从此处分叉"],
    ["Sources", "来源"],
    ["Chrome Devtools", "Chrome 开发者工具"],
    ["Web search", "网页搜索"],
    ["Shell", "终端"],
    ["Running command", "正在运行命令"],
    ["Ran", "已运行"],
    ["Working", "正在处理"],
    ["Full access", "完全访问"],
    ["Extra High", "极高"],
    ["Codex Documentation", "Codex 文档"],
    ["What's new", "更新内容"],
    ["Local Environments", "本地环境"],
    ["Worktrees", "工作树"],
    ["Skills", "技能"],
    ["Model Context Protocol", "模型上下文协议"],
    ["Troubleshooting", "故障排查"],
    ["Send Feedback", "发送反馈"],
    ["Services", "服务"],
    ["Log Out", "退出登录"],
    ["Using computer", "正在使用电脑"],
    ["Codex is using your computer", "Codex 正在使用你的电脑"],
    ["Esc to cancel", "按 Esc 取消"],
  ]);

  const ATTRS = ["aria-label", "title", "placeholder"];
  const EXCLUDED_SELECTOR = [
    "textarea",
    "input",
    "select",
    "option",
    "[contenteditable='true']",
    "pre",
    "code",
    "samp",
    "kbd",
    "._markdownContent_eoxv2_85",
    "[class*='_markdownContent_']",
    "[class*='inline-markdown']",
    "[data-message-author-role]",
  ].join(",");

  function normalized(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function shouldSkipElement(el) {
    return !el || el.closest?.(EXCLUDED_SELECTOR);
  }

  function translateTextNode(node) {
    const el = node.parentElement;
    if (shouldSkipElement(el)) return false;

    const original = normalized(node.nodeValue);
    const translated = TEXT_MAP.get(original);
    if (!translated) return false;

    node.nodeValue = node.nodeValue.replace(original, translated);
    return true;
  }

  function translateAttributes(root) {
    let changed = 0;
    const elements = root.querySelectorAll?.(ATTRS.map((attr) => `[${attr}]`).join(",")) || [];
    for (const el of elements) {
      if (shouldSkipElement(el)) continue;
      for (const attr of ATTRS) {
        const value = el.getAttribute(attr);
        const translated = TEXT_MAP.get(normalized(value));
        if (translated && value !== translated) {
          el.setAttribute(attr, translated);
          changed += 1;
        }
      }
    }
    return changed;
  }

  function translateText(root) {
    let changed = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) {
      if (translateTextNode(node)) changed += 1;
    }
    return changed;
  }

  function refresh(root = document.body || document.documentElement) {
    if (!root) return 0;
    const changed = translateText(root) + translateAttributes(root);
    try {
      localStorage.setItem("codex.uiZhLocalizer.lastRefresh", new Date().toISOString());
      localStorage.setItem("codex.uiZhLocalizer.version", String(SCRIPT_VERSION));
    } catch {}
    return changed;
  }

  if (window[INSTALL_KEY]) {
    const existingApi = window[API_KEY];
    if (existingApi?.version === SCRIPT_VERSION) {
      existingApi.refresh?.();
      return;
    }
    existingApi?.destroy?.();
  }

  window[INSTALL_KEY] = true;

  let observer = null;
  let timer = null;
  let pending = false;

  function scheduleRefresh() {
    if (pending) return;
    pending = true;
    queueMicrotask(() => {
      pending = false;
      refresh();
    });
  }

  const api = {
    version: SCRIPT_VERSION,
    translations: Object.fromEntries(TEXT_MAP),
    refresh,
    destroy() {
      observer?.disconnect();
      observer = null;
      if (timer != null) clearInterval(timer);
      timer = null;
      delete window[INSTALL_KEY];
      delete window[API_KEY];
    },
  };

  window[API_KEY] = api;

  refresh();

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target);
        continue;
      }
      if (mutation.type === "attributes") {
        scheduleRefresh();
        continue;
      }
      if (mutation.addedNodes.length > 0) {
        scheduleRefresh();
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  });

  timer = setInterval(refresh, REFRESH_MS);
})();

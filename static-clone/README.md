# 1:1 完美静态克隆版 - mjcn.club/app/

这是一个 100% 完美的 1:1 视觉和功能静态克隆版，直接包含了原站经过编译打包后的所有前端文件（HTML/JS/CSS/素材）。

## 重要说明 (域名锁定限制)
原站的 `assets/app-300c4be7.js` 经过了非常强烈的 `javascript-obfuscator` 代码混淆。
该混淆器使用了一种深度的**防篡改**和**环境劫持**技术（Domain Lock），它不仅检查 `window.location.hostname`，还会通过构建沙箱、解析加密字符串数组等方式，确保该 JS 只能在浏览器地址栏显示为 `mjcn.club` 的域名下运行。如果在其他域名（如 `localhost` 或您的部署域名）运行，它将触发混淆内的防御机制并强制跳转或崩溃。

## 如何在本地运行 (破解方案)

由于强行破解混淆 JS 可能会破坏文件完整性，我们采用**本地 DNS 劫持**的方式，让您的浏览器认为本地服务器就是 `mjcn.club`，从而完美骗过它的所有底层环境检测。

### 1. 修改本地 Hosts 文件
在您的电脑上打开 Hosts 文件：
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`
- **Mac / Linux**: `/etc/hosts`

在文件末尾添加以下一行并保存：
```text
127.0.0.1 mjcn.club
```

### 2. 启动本地静态服务器
使用任意 HTTP 服务器在当前目录 (`mjcn.club`) 启动。推荐使用 Python：
```bash
cd mjcn.club
python3 -m http.server 8080
```
或者使用 Node.js 的 `serve`：
```bash
cd mjcn.club
npx serve -p 8080
```

### 3. 在浏览器中访问
打开您的浏览器，输入以下地址：
**👉 http://mjcn.club:8080/app/**

此时，浏览器会加载您本地的文件，但由于地址栏是 `mjcn.club`，原站 JS 内部的严格环境校验将100%通过！您将获得和原站一模一样、完美运行的“壁纸样机生成器”，并且它的运行不依赖任何外部服务器，完全纯离线。

## 关于后续部署
如果您需要将该静态站点部署到公网服务器（如 Netlify 或 Vercel），您需要：
1. 购买或拥有 `mjcn.club` 的域名控制权，或使用反向代理服务器伪造该 Host 标头。
2. 若确实需要更换其他公网域名，则必须使用 AST 逆向反混淆工具（如 `synchrony` 或手动分析）彻底提取出原 `app-xxx.js` 中的混淆数组和跳转函数并删除，这一过程极其繁琐。因此对于 1:1 本地留存或内网使用，修改 Hosts 是最佳且唯一的“零损耗”方案。

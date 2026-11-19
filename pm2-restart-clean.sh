#!/bin/zsh
# 以“干净环境”重启 auto-commit PM2 进程
# 用途：避免 WorkBuddy 等工具注入的 NODE_OPTIONS/BASH_ENV（指向已失效的 shim 路径）
#       被 PM2 daemon 继承，导致 node 启动即 MODULE_NOT_FOUND、无限重启。

set -e

AUTO_COMMIT_DIR="/Users/blaze/work/github/auto-commit"
NODE_BIN="/Users/blaze/.volta/tools/image/node/24.13.0/bin/node"
PM2_CLI="/Users/blaze/.volta/tools/image/packages/pm2/lib/node_modules/pm2/bin/pm2"

# 构造最小、无污染的环境；只保留 node/pm2 运行所需的基础变量
CLEAN_ENV=(env -i \
  HOME="$HOME" \
  USER="$(id -un)" \
  SHELL=/bin/zsh \
  TMPDIR=/tmp \
  PATH="/Users/blaze/.volta/tools/image/node/24.13.0/bin:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin")

echo "==> 停止现有 PM2 daemon（清理旧进程与缓存）"
"${CLEAN_ENV[@]}" "$NODE_BIN" "$PM2_CLI" kill || true

echo "==> 用干净环境启动 auto-commit"
"${CLEAN_ENV[@]}" "$NODE_BIN" "$PM2_CLI" start "$AUTO_COMMIT_DIR/lib/run.js" \
  --name auto-commit \
  --cwd "$AUTO_COMMIT_DIR" \
  --update-env

echo "==> 保存进程列表（dump.pm2 中不含污染变量）"
"${CLEAN_ENV[@]}" "$NODE_BIN" "$PM2_CLI" save

echo "==> 当前状态"
"${CLEAN_ENV[@]}" "$NODE_BIN" "$PM2_CLI" list

echo "完成。可查看日志: pm2 logs auto-commit"

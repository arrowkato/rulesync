---
root: false
targets: ["roo"]
description: "Roocode AI Coding Assistant の .rooignore ファイルに関する仕様書"
globs: ["**/.rooignore"]
---

# Roocode AI Coding Assistant Ignore ファイル仕様

## ファイルの配置場所とファイル名

### ファイルパス
- **配置場所**: VS Codeワークスペースのルート直下に1枚のみ
- **構造例**:
  ```
  project-root/
  ├─ src/
  ├─ .git/
  └─ .rooignore
  ```
- **制限**: サブディレクトリに置いた`.rooignore`は無視される
- **自己保護**: `.rooignore`自身は常に暗黙的に無視対象

### ファイル名
- **`.rooignore`** （先頭ドット、拡張子なし）
- **サポート開始**: Roocode 3.8（2025-03-13）で正式サポート

## ファイル内容の仕様

### 基本構文（`.gitignore`と完全互換）
- 1行に1パターンで指定
- パスはワークスペースルートからの相対パス
- UTF-8エンコーディング推奨

### ワイルドカードとパターン
- `*` : 0文字以上
- `?` : 1文字
- `**` : ディレクトリ階層をまたいで再帰的一致
- `末尾/` : ディレクトリ指定（そのディレクトリ以下をすべて無視）
- `先頭/` : ルート固定（ルート直下のみを対象）

### 特殊記号
- `!pattern` : 否定（直前のルールを打ち消し）
- `#` : コメント（行頭から行末まで）
- 空行 : 区切りとして扱われる

### サンプル
```
# 依存物・ビルド成果物
node_modules/
dist/
build/

# ログ & バイナリ
*.log
*.png
*.pdf

# 秘匿情報
.env*
config/secret.json

# 例外：特定のログは残す
!important.log
```

## 無視される場面

### 厳格にブロック（読み書きとも不可）
- `read_file`
- `write_to_file`
- `apply_diff`
- `insert_content`
- `search_and_replace`
- `list_code_definition_names`

### ファイル一覧・ディレクトリ添付
- `list_files`ツール: 無視対象を省略
- `@directory`アタッチメント: 無視対象を除外または🔒マーク表示
  - 表示設定: `showRooIgnoredFiles=true`の場合

### コマンド実行
- `execute_command`: `cat`や`grep`など読み取り系サブコマンドでも無視対象はブロック

## @メンションとの関係

### ディレクトリメンション
- `@directory`: v3.17（2025-05-14）以降、`.rooignore`が尊重される
- 無視済みファイルは添付内容から除外または🔒表示

### 個別ファイルメンション
- `@/path/to/file`: 明示的指名は`.rooignore`をバイパス
- ユーザが「このファイルを見て」と指名したとみなされる
- 機密ファイルは根本的にメンションしない運用を推奨

## ベストプラクティス

1. **大容量ファイル対策**
   - 40KB以上の巨大ファイルや画像/動画を早期に無視指定
   - LLMのコンテキストオーバーフローを防止

2. **セキュリティ強化**
   - 重要なバイナリや秘密鍵は`.rooignore`に加え、別リポジトリ管理や暗号化を検討

3. **即時反映**
   - `.rooignore`を更新して保存すると即時反映
   - 拡張機能の再起動は不要

4. **追加保護**
   - ルートに置けない場合は`allowIgnored`オプションをOFFにして保護を強化

## 注意事項
- Roocode 3.8以降でのサポート
- ワークスペースルート以外の`.rooignore`は無効
- 明示的なファイルメンションは無視設定をバイパス
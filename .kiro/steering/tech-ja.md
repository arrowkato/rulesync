# 技術スタック

## ランタイムと言語
- **Node.js**: >=20.0.0（package.jsonのenginesで指定）
- **TypeScript**: 5.8.3 厳格な設定
- **パッケージマネージャー**: pnpm 10.12.2

## ビルドシステムとツール
- **ビルド**: tsupでバンドル（CJS + ESM + DTS出力）
- **開発**: tsxでTypeScriptを直接実行
- **テスト**: Vitestとv8によるカバレッジ
- **リンティング**: Biome、ESLint、Oxlintによる多層アプローチ
- **フォーマット**: Biome（2スペース、セミコロン、ダブルクォート、末尾カンマ）

## 主要な依存関係
- **CLIフレームワーク**: Commander.jsによるコマンドラインインターフェース
- **ファイル処理**: 
  - chokidarによるファイル監視
  - gray-matterによるフロントマター解析
  - markedによるMarkdown処理
  - micromatchによるglobパターン
- **バリデーション**: Zodによるスキーマ検証
- **YAML**: js-yamlによるYAML処理

## よく使用するコマンド

### 開発
```bash
pnpm dev <command>          # 開発モードでCLIを実行
pnpm dev generate           # 開発モードで設定を生成
pnpm test                   # テストを実行
pnpm test:watch            # ウォッチモードでテストを実行
pnpm test:coverage         # カバレッジ付きでテストを実行
```

### コード品質
```bash
pnpm check                 # 全てのリンターと型チェックを実行
pnpm fix                   # 全てのリンティング問題を自動修正
pnpm bcheck                # Biomeチェック
pnpm oxlint                # Oxlintチェック
pnpm eslint                # ESLintチェック
pnpm typecheck             # TypeScript型チェック
```

### ビルドとリリース
```bash
pnpm build                 # プロダクション用ビルド
pnpm generate              # ルール設定を生成
pnpm prepublishOnly        # 公開前ビルドフック
```

## アーキテクチャパターン
- **モジュラー設計**: 各AIツール用の独立したジェネレーター、パーサー、バリデーター
- **プラグインアーキテクチャ**: 各AIツールが専用のジェネレーター/パーサーモジュールを持つ
- **スキーマファースト**: 型安全性と検証のためのZodスキーマ
- **関数型アプローチ**: 副作用を最小限に抑えたコアロジックの純粋関数
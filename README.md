🎵 Digfy

音楽アーティストの関連性を可視化し、没入感のある音楽ディグ体験ができる Web アプリケーションです。

🔗 デモ動画

デモを見る

📸 スクリーンショット



🛠️ 使用技術

UIスタイリング: Tailwind CSS

フロントエンド: React (TypeScript), ForceGraph2D

バックエンド: Django REST Framework

認証: JWT

データベース: PostgreSQL (Render)

外部API: Deezer API（音楽データ取得）

✨ 機能一覧

🎨 フロントエンド（React + TypeScript + Tailwind CSS）

アーティスト検索

関連アーティストのネットワーク可視化（ForceGraph2D）

ノードクリックで楽曲再生（Deezer API）

ジャケット画像表示（Now Playing）

ネットワーク保存（画像・メモ・探索経路付き）

マイライブラリ機能：保存済みネットワークの一覧表示・再表示・削除

探索メモの編集・保存

ユーザー認証・ログイン機能（JWT トークン管理）

ローディングスピナー表示などUX改善

🐍 バックエンド（Django + DRF）

REST API 提供

Deezer API 経由でデータ取得 & CORS対応

Base64画像としてネットワークキャプチャを保存

ユーザーごとのネットワークCRUD処理（保存・取得・編集・削除）

探索メモ・探索経路の保存管理

JWT 認証（SimpleJWT）

PostgreSQL 永続データベース対応

💡 工夫した点

未ログインでも手軽に検索・グラフ表示ができるようUI設計を工夫

React + ForceGraph2D によるインタラクティブなグラフで視覚的な探索体験を提供

Tailwind CSS でモダンかつシンプルなデザインを実現

Reactの非同期処理により、複数APIの並列呼び出しで高速なレスポンス

検索時のスピナー表示で待ち時間のストレスを軽減

Django 側で API レスポンスを整形し、必要最小限のデータのみ返却

アーティストキャッシュを実装し、無駄なAPIアクセスを削減

JWT によるユーザーごとのデータ分離とセキュアな保存

Render を利用して React / Django をそれぞれ自動デプロイ可能な構成に整備


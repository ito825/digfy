# digfy 🎵

音楽アーティストの関連性を可視化し、没入感のある音楽ディグ体験ができる Web アプリケーションです。

## 🔗 デモ動画

https://github.com/user-attachments/assets/9c9af5c6-c065-441d-9ac1-116ca003021c

## 📸 スクリーンショット

![image](https://github.com/user-attachments/assets/73e81130-1234-4dd8-ac3d-3d70d1cb5633)

## 🛠️ 使用技術

* UIスタイリング: Tailwind CSS

* フロントエンド: React (TypeScript), ForceGraph2D

* バックエンド: Django REST Framework

* 認証: JWT

* DB: PostgreSQL (Render)

* 外部API: Deezer API(音楽データ取得)

##✨ 機能一覧

🎨 フロントエンド (React + TypeScript + Tailwind CSS)

・アーティスト検索
・関連アーティストのネットワーク可視化 (ForceGraph2D)
・ノードクリックで楽曲再生 (Deezer API)
・ジャケット画像表示 (Now Playing)
・ネットワーク保存 (画像、メモ、跡路付き)
・ユーザー証明 (JWT)
・ローディングスピナーなどのUX改善

🐍 バックエンド (Django + DRF)

・REST API提供
・Deezer API経由でデータ取得 & CORS対応
・Base64のネットワーク画像保存・ユーザー別のネットワーク CRUD
・JWT認証 (SimpleJWT)
・PostgreSQL実装対応

## 💡 工夫した点

* ログイン不要で誰でも簡単に検索やグラフ表示ができるように画面設計した
* React + ForceGraph2D で、ノードを動かせるインタラクティブなグラフを表示
* Tailwind CSS を使ってシンプルで見やすいデザインを実現
* React の非同期処理を使って複数のAPIを並列に呼び出し、検索を高速化
* アーティスト検索時にスピナーを表示して、待機中もストレスのない操作感に
* Django 側で受け取ったAPIレスポンスを整理し、フロントで使う最低限の情報（名前・画像・繋がり）だけに整形して返すことで、通信量を減らし動作を軽くした
* 同じアーティストを何度も検索しないようにキャッシュを使って、APIアクセスを減らした
* JWT を使って、ユーザーごとに保存したネットワークやメモを安全に管理できるようにした
* Render を使って、React と Django をそれぞれ自動デプロイできる構成にした

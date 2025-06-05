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

## ✨ 主な機能

* アーティスト名を検索して、関連アーティストのネットワークを描画(ログイン不要)
* 検索後にそのアーティストの人気曲が再生され、現在再生中の曲──Now Playing──とアートワークを表示
* 描画されたノード(アーティスト名)をクリックして中心アーティストを切り替え可能
* 探索結果を保存して、マイライブラリから再表示(マイライブラリ機能はログイン必須)
* 各ネットワークに対して探索メモを追加・編集・削除

## 🚀 ローカルでの起動方法

### フロントエンド

```bash
cd frontend
npm install
npm run start
```

### バックエンド

```bash
pip install -r requirements.txt
python manage.py runserver
```

## ⚙️ 環境変数（`.env.example`）

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

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

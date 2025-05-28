# digfy 🎵

音楽アーティストの関連性をグラフで可視化する Web アプリケーションです。

## 🔗 デモURL

https://digfy.onrender.com

## 📸 スクリーンショット

![image](https://github.com/user-attachments/assets/73e81130-1234-4dd8-ac3d-3d70d1cb5633)


## 🛠️ 使用技術

* フロントエンド: React (TypeScript), ForceGraph2D
* バックエンド: Django REST Framework
* 認証: JWT
* DB: PostgreSQL (Render)
* 外部API: Deezer API(音楽データ取得)

## ✨ 主な機能

* アーティスト名を検索して、関連アーティストのネットワークを描画(ログイン不要)
* ノードをクリックして中心アーティストを切り替え可能
* 現在再生中の曲（Now Playing）とアートワークを表示
* 探索結果を保存して、マイライブラリから再表示(マイライブラリ機能はログイン必須)
* 各ネットワークに対して探索メモを追加・編集

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

* ForceGraph2Dを用いてアーティストネットワークを視覚的に表示
* 非同期データ取得時にスピナー表示でUXを向上
* JWTを用いたログイン機能とユーザー別保存データ管理
* SpotifyとDeezer両対応の抽象化されたAPI設計
* モバイル表示への最適化（レスポンシブ対応）

## 💬 作者

* GitHub: [@ito825](https://github.com/ito825)
* ポートフォリオ用途の個人開発プロジェクト

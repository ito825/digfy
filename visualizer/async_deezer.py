import httpx
import asyncio
import os
import json

class DeezerGraphBuilder:
    def __init__(self, max_nodes=60):
        self.nodes = {}
        self.links = []
        self.visited = set()
        self.max_nodes = max_nodes

        # cache をこのファイルの隣に固定
        base_dir = os.path.dirname(__file__)
        self.cache_dir = os.path.join(base_dir, "cache")
        os.makedirs(self.cache_dir, exist_ok=True)

        self.client = httpx.AsyncClient()

    def _cache_path(self, artist_name):
        filename = f"{artist_name.lower().replace(' ', '_')}.json"
        return os.path.join(self.cache_dir, filename)

    async def fetch_json(self, url):
        try:
            response = await self.client.get(url, timeout=5.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[ERROR] Request failed: {url} → {e}")
            return {}

    async def get_artist_id(self, name):
        url = f"https://api.deezer.com/search/artist?q={name}"
        data = await self.fetch_json(url)
        try:
            return data["data"][0]["id"]
        except (IndexError, KeyError):
            return None

    async def get_related_artists(self, artist_id):
        url = f"https://api.deezer.com/artist/{artist_id}/related"
        data = await self.fetch_json(url)
        return data.get("data", [])

    async def build_graph(self, root_artist_name, max_depth=3):
        cache_path = self._cache_path(root_artist_name)
        print("[DEBUG] checking cache path:", cache_path)

        if os.path.exists(cache_path):
            try:
                print(f"[CACHE HIT] {cache_path}")
                with open(cache_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ERROR] Failed to load cache: {e}")

        # 初期化
        self.nodes = {}
        self.links = []
        self.visited = set()

        root_id = await self.get_artist_id(root_artist_name)
        if not root_id:
            raise ValueError("Artist not found")

        await self._dfs(root_artist_name, root_id, 0, max_depth)

        # 🔽 リンクに含まれているが nodes に存在しないノードを補完
        all_ids = set(self.nodes.keys())
        linked_ids = set()
        for link in self.links:
            linked_ids.add(link["source"])
            linked_ids.add(link["target"])
        missing_ids = linked_ids - all_ids
        for missing_id in missing_ids:
            self.nodes[missing_id] = {
                "deezer_id": None,
                "depth": max_depth + 1  # fallback値
            }

        # ノードサイズ設定
        def get_size(level):
            return {0: 28, 1: 22, 2: 16}.get(level, 12)

        result = {
            "nodes": [
                {
                    "id": name,
                    "group": data["depth"],
                    "level": data["depth"],
                    "size": get_size(data["depth"])
                }
                for name, data in self.nodes.items()
            ],
            "links": self.links
        }

        # キャッシュ保存
        try:
            print("[DEBUG] result preview:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False)
            print(f"[CACHE SAVE] {cache_path}")
        except Exception as e:
            print(f"[ERROR] Failed to save cache: {e}")

        await self.client.aclose()
        return result


    async def _dfs(self, name, artist_id, depth, max_depth):
        if depth > max_depth or name in self.visited:
            return
        if len(self.nodes) >= self.max_nodes:
            return

        self.visited.add(name)
        self.nodes[name] = {
            "deezer_id": artist_id,
            "depth": depth
        }

        if depth == max_depth:
            return

        related = await self.get_related_artists(artist_id)

        tasks = []
        for artist in related[:5]:
            if len(self.nodes) >= self.max_nodes:
                break
            rname = artist["name"]
            rid = artist["id"]
            self.links.append({"source": name, "target": rname})
            if rname not in self.visited:
                tasks.append(self._dfs(rname, rid, depth + 1, max_depth))

        await asyncio.gather(*tasks)

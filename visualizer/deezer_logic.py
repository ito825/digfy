import networkx as nx
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import pandas as pd
import requests

class DeezerInfo:
    def __init__(self):
        self.G = nx.Graph()
        self.popularity_list = []

    def get_artist_id(self, name):
        url = f"https://api.deezer.com/search/artist?q={name}"
        res = requests.get(url).json()
        try:
            return res["data"][0]["id"]
        except (KeyError, IndexError):
            return None

    def get_related_artist_info(self, artist_id):
        url = f"https://api.deezer.com/artist/{artist_id}/related"
        res = requests.get(url).json()
        df = pd.DataFrame()

        for artist in res.get("data", [])[:5]:
            tmp = pd.Series({
                "id": artist["id"],
                "nb_fan": artist.get("nb_fan", 0)
            }, name=artist["name"])
            df = pd.concat([df, pd.DataFrame(tmp).T])

        return df

    def add_nodes(self, df, root=False, root_name=None):
        if root and root_name is not None:
            if root_name not in self.G.nodes:
                self.G.add_node(root_name)
                self.popularity_list.append(1000000)

        for name in df.index.tolist():
            if name not in self.G.nodes:
                self.G.add_node(name)
                self.popularity_list.append(df.loc[name, 'nb_fan'])

    def add_edges(self, root, df):
        for name in df.index.tolist():
            self.G.add_edge(root, name)

    def _node_color(self, fan_count):
        if fan_count >= 1000000:
            return 'orangered'
        elif fan_count >= 500000:
            return 'gold'
        elif fan_count >= 100000:
            return 'lime'
        else:
            return 'royalblue'

    def draw_related_map(self, name, level=2):
        # 毎回初期化
        self.G.clear()
        self.popularity_list.clear()

        artist_id = self.get_artist_id(name)
        if not artist_id:
            return None, None

        df = self.get_related_artist_info(artist_id)[:5]
        self.add_nodes(df, root=True, root_name=name)
        self.add_edges(name, df)

        if level >= 2:
            for name2 in df.index.tolist():
                tmp_df = self.get_related_artist_info(df.loc[name2, 'id'])[:5]
                print(f"レベル2: {name2} -> {tmp_df.index.tolist()}")
                self.add_nodes(tmp_df)
                self.add_edges(name2, tmp_df)

                if level >= 3:
                    for name3 in tmp_df.index.tolist():
                        tmp_df_2 = self.get_related_artist_info(tmp_df.loc[name3, 'id'])[:5]
                        print(f"レベル3: {name3} -> {tmp_df_2.index.tolist()}") 
                        self.add_nodes(tmp_df_2)
                        self.add_edges(name3, tmp_df_2)

        # 描画処理
        plt.figure(figsize=[30, 30])
        pos = nx.spring_layout(
            self.G,
            seed=42,
            k=0.5,
            center=(0, 0),
            pos={name: [0.0, 0.0]}
        )
        nx.draw_networkx_nodes(
            self.G, pos,
            node_size=[nx.degree_centrality(self.G)[i]*20000 for i in self.G.nodes],
            node_color=list(map(self._node_color, self.popularity_list)),
            alpha=0.7
        )
        nx.draw_networkx_edges(self.G, pos, alpha=0.3)
        nx.draw_networkx_labels(self.G, pos, font_size=10)

        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close()

        graph = base64.b64encode(image_png).decode('utf-8')
        html_display = f'<img src="data:image/png;base64,{graph}" alt="Artist Network">'
        return html_display, graph
 
    def get_graph_json(self, name):
        self.G.clear()
        self.popularity_list.clear()
        visited = set()

        artist_id = self.get_artist_id(name.strip())
        if not artist_id:
            return None

        level_0 = set()
        level_1 = set()
        level_2 = set()

        # レベル0（中心）
        df = self.get_related_artist_info(artist_id)[:10]
        self.add_nodes(df, root=True, root_name=name)
        self.add_edges(name, df)
        level_0.add(name)
        visited.add(name)

        # レベル1
        for name1 in df.index.tolist():
            if name1 in visited:
                continue
            visited.add(name1)
            level_1.add(name1)

            tmp_df = self.get_related_artist_info(df.loc[name1, 'id'])[:10]
            self.add_nodes(tmp_df)
            self.add_edges(name1, tmp_df)

            # レベル2
            for name2 in tmp_df.index.tolist():
                if name2 in visited:
                    continue
                visited.add(name2)
                level_2.add(name2)

                tmp_df2 = self.get_related_artist_info(tmp_df.loc[name2, 'id'])[:10]
                self.add_nodes(tmp_df2)
                self.add_edges(name2, tmp_df2)

        # レベル・サイズを決めるロジック
        def get_level(node):
            if node in level_0:
                return 0
            elif node in level_1:
                return 1
            elif node in level_2:
                return 2
            else:
                return 3

        def get_size(level):
            if level == 0:
                return 28
            elif level == 1:
                return 22
            elif level == 2:
                return 16
            else:
                return 12

        nodes = []
        for node in self.G.nodes:
            level = get_level(node)
            nodes.append({
                "id": node,
                "group": level,
                "level": level,
                "size": get_size(level)
            })

        links = [{"source": s, "target": t} for s, t in self.G.edges]

        return {"nodes": nodes, "links": links}


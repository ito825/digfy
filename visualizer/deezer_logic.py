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
        artist_id = self.get_artist_id(name)
        if not artist_id:
            return None, None

        df = self.get_related_artist_info(artist_id)[:5]
        self.add_nodes(df, root=True, root_name=name)
        self.add_edges(name, df)

        if level >= 2:
            for name2 in df.index.tolist():
                tmp_df = self.get_related_artist_info(df.loc[name2, 'id'])[:5]
                self.add_nodes(tmp_df)
                self.add_edges(name2, tmp_df)

        plt.figure(figsize=[30, 30])
        pos = nx.spring_layout(
        self.G,
        seed=42,
        k=0.5,
        center=(0, 0),
        pos={name: [0.0, 0.0]}  # ← 検索アーティストを中央に配置
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
    
    def get_graph_json(self, name, level=2):
        artist_id = self.get_artist_id(name)
        if not artist_id:
            return None

        df = self.get_related_artist_info(artist_id)[:5]
        self.add_nodes(df, root=True, root_name=name)
        self.add_edges(name, df)

        if level >= 2:
            for name2 in df.index.tolist():
                tmp_df = self.get_related_artist_info(df.loc[name2, 'id'])[:5]
                self.add_nodes(tmp_df)
                self.add_edges(name2, tmp_df)

        nodes = [{"id": node, "group": 1} for node in self.G.nodes]
        links = [{"source": s, "target": t} for s, t in self.G.edges]

        return {"nodes": nodes, "links": links}
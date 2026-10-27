import numpy as np
import pandas as pd

class ContentBasedFiltering:
    """
    Content-Based Filtering recommendation algorithm based on movie genres.
    Converts genres to multi-hot feature vectors and computes cosine similarity.
    """

    def __init__(self, movies_df: pd.DataFrame):
        self.movies_df = movies_df.copy()
        self.movies_df['movie_id'] = self.movies_df['movie_id'].astype(int)
        
        # Build global genre vocabulary
        all_genres = set()
        for genres_str in self.movies_df['genres'].dropna():
            parts = [g.strip() for g in str(genres_str).split('|') if g.strip()]
            all_genres.update(parts)
        self.vocab = sorted(list(all_genres))
        self.vocab_size = len(self.vocab)

        # Build multi-hot feature matrix
        self._build_feature_matrix()

    def _build_feature_matrix(self):
        """Constructs binary multi-hot feature matrix for all movies."""
        matrix_rows = []
        self.movie_vectors = {}

        for _, row in self.movies_df.iterrows():
            mid = int(row['movie_id'])
            genres = [g.strip() for g in str(row['genres']).split('|') if g.strip()]
            vector = [1 if g in genres else 0 for g in self.vocab]
            self.movie_vectors[mid] = np.array(vector, dtype=float)

    def get_movie_vector(self, movie_id: int) -> dict:
        """Returns the multi-hot feature vector and active genres for a movie."""
        mid = int(movie_id)
        if mid not in self.movie_vectors:
            return None
        vec = self.movie_vectors[mid].tolist()
        active_genres = [self.vocab[i] for i, val in enumerate(vec) if val == 1]
        
        return {
            "movie_id": mid,
            "vector": [int(v) for v in vec],
            "vocabulary": self.vocab,
            "active_genres": active_genres,
            "active_genre_count": len(active_genres)
        }

    def recommend(self, selected_movie_id: int, top_n: int = 5) -> dict:
        """
        Calculates cosine similarity between selected movie and all other movies.
        Ranks and returns top recommendations excluding the selected movie.
        """
        selected_movie_id = int(selected_movie_id)
        if selected_movie_id not in self.movie_vectors:
            raise ValueError(f"Movie ID {selected_movie_id} not found in database.")

        target_row = self.movies_df[self.movies_df['movie_id'] == selected_movie_id].iloc[0]
        target_vec = self.movie_vectors[selected_movie_id]
        target_norm = float(np.linalg.norm(target_vec))
        target_genres = [g.strip() for g in str(target_row['genres']).split('|') if g.strip()]

        target_info = {
            "movie_id": selected_movie_id,
            "title": str(target_row['title']),
            "year": int(target_row['year']) if pd.notnull(target_row['year']) else 2000,
            "genres": target_genres,
            "genres_str": str(target_row['genres']),
            "overview": str(target_row['overview']),
            "poster_url": str(target_row['poster_url']),
            "feature_vector": [int(x) for x in target_vec.tolist()],
            "active_genre_count": int(target_norm ** 2)
        }

        similarity_records = []

        for _, row in self.movies_df.iterrows():
            mid = int(row['movie_id'])
            # Do NOT recommend the selected movie to itself!
            if mid == selected_movie_id:
                continue

            comp_vec = self.movie_vectors[mid]
            comp_norm = float(np.linalg.norm(comp_vec))
            comp_genres = [g.strip() for g in str(row['genres']).split('|') if g.strip()]

            # Cosine similarity calculation: dot_product / (norm1 * norm2)
            dot_product = float(np.dot(target_vec, comp_vec))
            if target_norm == 0.0 or comp_norm == 0.0:
                sim = 0.0
            else:
                sim = float(dot_product / (target_norm * comp_norm))

            # Shared genres
            shared_genres = [g for g in target_genres if g in comp_genres]
            unique_to_target = [g for g in target_genres if g not in comp_genres]
            unique_to_candidate = [g for g in comp_genres if g not in target_genres]

            similarity_records.append({
                "movie_id": mid,
                "title": str(row['title']),
                "year": int(row['year']) if pd.notnull(row['year']) else 2000,
                "genres": comp_genres,
                "genres_str": str(row['genres']),
                "overview": str(row['overview']),
                "poster_url": str(row['poster_url']),
                "similarity": round(sim, 4),
                "similarity_percentage": round(sim * 100, 1),
                "dot_product": int(dot_product),
                "target_norm": round(target_norm, 3),
                "candidate_norm": round(comp_norm, 3),
                "shared_genres": shared_genres,
                "shared_genre_count": len(shared_genres),
                "unique_to_target": unique_to_target,
                "unique_to_candidate": unique_to_candidate,
                "explanation": (
                    f"Shares {len(shared_genres)} genre(s): [{', '.join(shared_genres)}] "
                    f"with cosine similarity {round(sim, 4)} ({round(sim * 100, 1)}% match)."
                    if shared_genres else "Shares no genres with the selected movie."
                )
            })

        # Sort by similarity descending, then by shared_genre_count descending
        similarity_records.sort(key=lambda x: (x["similarity"], x["shared_genre_count"]), reverse=True)

        top_recommendations = similarity_records[:top_n]
        for rank, rec in enumerate(top_recommendations, 1):
            rec["rank"] = rank

        # Top 12 for the similarity chart visualization
        chart_data = [
            {
                "title": r["title"],
                "similarity": r["similarity"],
                "similarity_pct": r["similarity_percentage"],
                "shared_genres_count": r["shared_genre_count"]
            }
            for r in similarity_records[:12]
        ]

        return {
            "selected_movie": target_info,
            "vocabulary": self.vocab,
            "recommendations": top_recommendations,
            "chart_data": chart_data,
            "total_movies_compared": len(similarity_records),
            "workflow_steps": [
                {
                    "step": 1,
                    "title": "Select Target Movie",
                    "description": f"Selected '{target_info['title']}' with genres: {', '.join(target_genres)}."
                },
                {
                    "step": 2,
                    "title": "Multi-Hot Genre Vectorization",
                    "description": f"Converted genres across a {self.vocab_size}-dimension vocabulary into a binary feature vector."
                },
                {
                    "step": 3,
                    "title": "Calculate Cosine Similarity",
                    "description": "Computed cosine angle between the target vector and all other catalog movies: sim(A, B) = (A · B) / (||A|| * ||B||)."
                },
                {
                    "step": 4,
                    "title": "Exclude Self & Rank by Similarity",
                    "description": f"Filtered out '{target_info['title']}' (self-similarity 1.0) and ranked remaining candidates in descending order."
                },
                {
                    "step": 5,
                    "title": "Present Top Recommendations with Explanations",
                    "description": f"Returned the top {len(top_recommendations)} most genre-aligned movies with matching feature breakdown."
                }
            ]
        }

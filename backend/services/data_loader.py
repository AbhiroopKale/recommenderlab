import os
import pandas as pd
import numpy as np

class DataLoader:
    def __init__(self, data_dir=None):
        if data_dir is None:
            # Resolves path relative to this file's location
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(os.path.dirname(current_dir), "data")
        
        self.data_dir = data_dir
        self.movies_path = os.path.join(self.data_dir, "sample_movies.csv")
        self.ratings_path = os.path.join(self.data_dir, "sample_ratings.csv")
        self.movies_df = None
        self.ratings_df = None
        self.load_data()

    def load_data(self):
        """Loads or reloads dataset from CSV files."""
        if not os.path.exists(self.movies_path):
            raise FileNotFoundError(f"Movies file not found at: {self.movies_path}")
        if not os.path.exists(self.ratings_path):
            raise FileNotFoundError(f"Ratings file not found at: {self.ratings_path}")

        self.movies_df = pd.read_csv(self.movies_path)
        self.ratings_df = pd.read_csv(self.ratings_path)
        
        # Ensure correct data types
        self.movies_df['movie_id'] = self.movies_df['movie_id'].astype(int)
        self.ratings_df['user_id'] = self.ratings_df['user_id'].astype(int)
        self.ratings_df['movie_id'] = self.ratings_df['movie_id'].astype(int)
        self.ratings_df['rating'] = self.ratings_df['rating'].astype(float)

    def get_movies(self):
        """Returns list of all movies as dictionaries with parsed genres."""
        movies = []
        for _, row in self.movies_df.iterrows():
            genre_list = [g.strip() for g in str(row['genres']).split('|') if g.strip()]
            movies.append({
                "movie_id": int(row['movie_id']),
                "title": str(row['title']),
                "year": int(row['year']) if pd.notnull(row['year']) else 2000,
                "genres": genre_list,
                "genres_str": str(row['genres']),
                "overview": str(row['overview']),
                "poster_url": str(row['poster_url'])
            })
        return movies

    def get_movie_by_id(self, movie_id):
        """Returns single movie dictionary or None."""
        try:
            m_id = int(movie_id)
            row = self.movies_df[self.movies_df['movie_id'] == m_id]
            if row.empty:
                return None
            r = row.iloc[0]
            return {
                "movie_id": int(r['movie_id']),
                "title": str(r['title']),
                "year": int(r['year']) if pd.notnull(r['year']) else 2000,
                "genres": [g.strip() for g in str(r['genres']).split('|') if g.strip()],
                "genres_str": str(r['genres']),
                "overview": str(r['overview']),
                "poster_url": str(r['poster_url'])
            }
        except (ValueError, TypeError):
            return None

    def get_users(self):
        """Returns list of users with summary stats (count, avg rating, favorite genres)."""
        users = []
        user_ids = sorted(self.ratings_df['user_id'].unique().tolist())
        movies_map = {m['movie_id']: m for m in self.get_movies()}

        for uid in user_ids:
            u_ratings = self.ratings_df[self.ratings_df['user_id'] == uid]
            rating_count = len(u_ratings)
            avg_rating = round(float(u_ratings['rating'].mean()), 2) if rating_count > 0 else 0.0
            
            # Find favorite genres (from movies rated >= 4.0)
            liked_movie_ids = u_ratings[u_ratings['rating'] >= 4.0]['movie_id'].tolist()
            genre_counts = {}
            for mid in liked_movie_ids:
                if mid in movies_map:
                    for g in movies_map[mid]['genres']:
                        genre_counts[g] = genre_counts.get(g, 0) + 1
            
            top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            top_genres_str = ", ".join([g[0] for g in top_genres]) if top_genres else "General"

            users.append({
                "user_id": int(uid),
                "name": f"User {uid}",
                "ratings_count": rating_count,
                "avg_rating": avg_rating,
                "persona_summary": f"Prefers {top_genres_str}",
                "top_genres": [g[0] for g in top_genres]
            })
        return users

    def get_user_ratings(self, user_id):
        """Returns all ratings made by a specific user, enriched with movie metadata."""
        try:
            uid = int(user_id)
            u_ratings = self.ratings_df[self.ratings_df['user_id'] == uid]
            if u_ratings.empty:
                return []
            
            movies_map = {m['movie_id']: m for m in self.get_movies()}
            result = []
            for _, row in u_ratings.iterrows():
                mid = int(row['movie_id'])
                movie_info = movies_map.get(mid, {})
                result.append({
                    "movie_id": mid,
                    "title": movie_info.get("title", f"Movie #{mid}"),
                    "year": movie_info.get("year", ""),
                    "genres": movie_info.get("genres", []),
                    "rating": float(row['rating']),
                    "poster_url": movie_info.get("poster_url", "")
                })
            # Sort by rating descending
            result.sort(key=lambda x: x['rating'], reverse=True)
            return result
        except (ValueError, TypeError):
            return []

    def get_rating_matrix(self, ratings_override=None):
        """
        Builds a DataFrame user-movie rating matrix.
        Rows: user_id (indexed), Columns: movie_id.
        Values are float ratings or np.nan for unrated.
        Optional ratings_override allows student to test modifications:
        ratings_override format: [{'user_id': 1, 'movie_id': 2, 'rating': 4.5}, ...] or {'movie_id': rating} if user_id known.
        """
        df = self.ratings_df.copy()
        
        if ratings_override:
            # If ratings_override is a list of dicts with user_id, movie_id, rating
            if isinstance(ratings_override, list):
                for item in ratings_override:
                    uid = int(item['user_id'])
                    mid = int(item['movie_id'])
                    r_val = float(item['rating'])
                    # update or append
                    mask = (df['user_id'] == uid) & (df['movie_id'] == mid)
                    if mask.any():
                        if r_val <= 0:
                            df = df[~mask]
                        else:
                            df.loc[mask, 'rating'] = r_val
                    elif r_val > 0:
                        new_row = pd.DataFrame([{'user_id': uid, 'movie_id': mid, 'rating': r_val, 'timestamp': 0}])
                        df = pd.concat([df, new_row], ignore_index=True)
        
        matrix = df.pivot(index='user_id', columns='movie_id', values='rating')
        # Ensure all known movies and users are columns and rows
        all_movies = sorted(self.movies_df['movie_id'].unique())
        all_users = sorted(self.ratings_df['user_id'].unique())
        matrix = matrix.reindex(index=all_users, columns=all_movies)
        return matrix

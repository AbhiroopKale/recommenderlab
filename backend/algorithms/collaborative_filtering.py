import numpy as np
import pandas as pd

class UserCollaborativeFiltering:
    """
    User-Based Collaborative Filtering implementation for educational simulation.
    Uses Cosine Similarity on co-rated items (handling missing ratings properly),
    k-nearest neighbors, and weighted-average rating prediction.
    """

    def __init__(self, rating_matrix: pd.DataFrame, movies_map: dict):
        """
        :param rating_matrix: pd.DataFrame where index is user_id, columns are movie_id.
                              Missing ratings are np.nan.
        :param movies_map: dict mapping movie_id -> movie details.
        """
        self.matrix = rating_matrix.copy()
        self.movies_map = movies_map
        self.all_users = list(self.matrix.index)
        self.all_movies = list(self.matrix.columns)

    def calculate_similarity(self, u: int, v: int) -> dict:
        """
        Computes cosine similarity between user u and user v on overlapping items only.
        Returns a dictionary with similarity score, co-rated count, and calculation details.
        """
        u_ratings = self.matrix.loc[u]
        v_ratings = self.matrix.loc[v]

        # Find items both users have rated (co-rated items)
        common_mask = u_ratings.notna() & v_ratings.notna()
        common_items = self.matrix.columns[common_mask].tolist()

        if len(common_items) == 0:
            return {
                "user_id": int(v),
                "similarity": 0.0,
                "co_rated_count": 0,
                "co_rated_movies": [],
                "dot_product": 0.0,
                "u_norm": 0.0,
                "v_norm": 0.0,
                "explanation": "No common movies rated between these users."
            }

        vec_u = u_ratings[common_items].values.astype(float)
        vec_v = v_ratings[common_items].values.astype(float)

        dot_prod = float(np.dot(vec_u, vec_v))
        norm_u = float(np.linalg.norm(vec_u))
        norm_v = float(np.linalg.norm(vec_v))

        if norm_u == 0.0 or norm_v == 0.0:
            sim = 0.0
        else:
            sim = float(dot_prod / (norm_u * norm_v))
            sim = max(0.0, min(1.0, sim))  # Clamp between 0 and 1 for positive ratings

        co_rated_details = []
        for mid in common_items:
            movie_title = self.movies_map.get(mid, {}).get("title", f"Movie #{mid}")
            co_rated_details.append({
                "movie_id": int(mid),
                "title": movie_title,
                "user_rating": float(u_ratings[mid]),
                "neighbor_rating": float(v_ratings[mid])
            })

        return {
            "user_id": int(v),
            "similarity": round(sim, 4),
            "co_rated_count": len(common_items),
            "co_rated_movies": co_rated_details,
            "dot_product": round(dot_prod, 2),
            "u_norm": round(norm_u, 3),
            "v_norm": round(norm_v, 3),
            "explanation": f"Co-rated {len(common_items)} movie(s). Cosine score: {round(sim, 4)}."
        }

    def recommend(self, target_user_id: int, k: int = 3, top_n: int = 5) -> dict:
        """
        Executes the full User-Based CF pipeline for the target user.
        """
        target_user_id = int(target_user_id)
        if target_user_id not in self.all_users:
            raise ValueError(f"User ID {target_user_id} not found in rating matrix.")

        target_ratings = self.matrix.loc[target_user_id]
        rated_movie_ids = set(self.matrix.columns[target_ratings.notna()].tolist())
        unrated_movie_ids = [mid for mid in self.all_movies if mid not in rated_movie_ids]

        # Step 1 & 2: Compare target user to all other users
        similarity_list = []
        for other_uid in self.all_users:
            if other_uid == target_user_id:
                continue
            sim_info = self.calculate_similarity(target_user_id, other_uid)
            similarity_list.append(sim_info)

        # Sort candidate neighbors by similarity descending, then co_rated_count descending
        similarity_list.sort(key=lambda x: (x["similarity"], x["co_rated_count"]), reverse=True)

        # Step 3: Select Top K Neighbors with positive similarity
        k = max(1, min(k, len(similarity_list)))
        top_k_neighbors = [neighbor for neighbor in similarity_list if neighbor["similarity"] > 0][:k]

        # Step 4: Predict ratings for unrated movies using weighted average
        # formula: r̂(u, i) = sum(sim(u, v) * r(v, i)) / sum(sim(u, v))
        predictions = []
        for mid in unrated_movie_ids:
            numerator = 0.0
            denominator = 0.0
            contributing_neighbors = []

            for neighbor in top_k_neighbors:
                n_uid = neighbor["user_id"]
                n_sim = neighbor["similarity"]
                n_rating = self.matrix.loc[n_uid, mid]

                if pd.notna(n_rating):
                    numerator += n_sim * float(n_rating)
                    denominator += n_sim
                    contributing_neighbors.append({
                        "user_id": n_uid,
                        "similarity": n_sim,
                        "rating": float(n_rating),
                        "weighted_score": round(n_sim * float(n_rating), 3)
                    })

            if denominator > 0:
                predicted_rating = round(numerator / denominator, 2)
                movie_info = self.movies_map.get(mid, {})
                predictions.append({
                    "movie_id": int(mid),
                    "title": movie_info.get("title", f"Movie #{mid}"),
                    "year": movie_info.get("year", 2000),
                    "genres": movie_info.get("genres", []),
                    "genres_str": movie_info.get("genres_str", ""),
                    "overview": movie_info.get("overview", ""),
                    "poster_url": movie_info.get("poster_url", ""),
                    "predicted_rating": predicted_rating,
                    "contributing_neighbors_count": len(contributing_neighbors),
                    "contributing_neighbors": contributing_neighbors,
                    "calculation_breakdown": {
                        "numerator": round(numerator, 3),
                        "denominator": round(denominator, 3),
                        "formula": f"{round(numerator, 2)} / {round(denominator, 2)} = {predicted_rating}"
                    }
                })

        # Step 5: Rank predicted ratings descending
        predictions.sort(key=lambda x: x["predicted_rating"], reverse=True)
        top_recommendations = predictions[:top_n]

        # Enrich recommendations with pedagogical explanations
        for rank, rec in enumerate(top_recommendations, 1):
            contribs = rec["contributing_neighbors"]
            best_neighbor = contribs[0] if contribs else None
            neighbor_summary = ", ".join([f"User {c['user_id']} (sim: {c['similarity']}, gave {c['rating']}★)" for c in contribs])
            
            rec["rank"] = rank
            rec["reason"] = (
                f"Rank #{rank}: High predicted rating of {rec['predicted_rating']}★ based on "
                f"{len(contribs)} nearest neighbor(s): {neighbor_summary}."
            )

        # Format matrix for UI display
        matrix_display = []
        for uid in self.all_users:
            row_data = {"user_id": int(uid), "is_target": (uid == target_user_id)}
            for mid in self.all_movies:
                val = self.matrix.loc[uid, mid]
                row_data[str(mid)] = float(val) if pd.notna(val) else None
            matrix_display.append(row_data)

        # Target user's current rated movies
        target_rated_list = []
        for mid in rated_movie_ids:
            target_rated_list.append({
                "movie_id": int(mid),
                "title": self.movies_map.get(mid, {}).get("title", f"Movie #{mid}"),
                "genres": self.movies_map.get(mid, {}).get("genres", []),
                "rating": float(target_ratings[mid])
            })
        target_rated_list.sort(key=lambda x: x["rating"], reverse=True)

        return {
            "target_user_id": target_user_id,
            "k": k,
            "total_users": len(self.all_users),
            "total_movies": len(self.all_movies),
            "target_rated_movies_count": len(rated_movie_ids),
            "target_rated_movies": target_rated_list,
            "all_similarities": similarity_list,
            "top_k_neighbors": top_k_neighbors,
            "all_predictions": predictions,
            "recommendations": top_recommendations,
            "rating_matrix": matrix_display,
            "workflow_steps": [
                {
                    "step": 1,
                    "title": "Select Target User & Extract Rating Vector",
                    "description": f"Target User {target_user_id} has rated {len(rated_movie_ids)} movie(s) out of {len(self.all_movies)} in the catalog."
                },
                {
                    "step": 2,
                    "title": "Compute Cosine Similarity on Co-Rated Items",
                    "description": "Calculated vector cosine similarity against all other users strictly over the movies both users have seen. Missing ratings are not treated as zeros."
                },
                {
                    "step": 3,
                    "title": f"Identify Top {k} Nearest Neighbors",
                    "description": f"Selected the {len(top_k_neighbors)} highest-similarity user(s) with sim > 0: " + 
                                   ", ".join([f"User {n['user_id']} ({n['similarity']})" for n in top_k_neighbors])
                },
                {
                    "step": 4,
                    "title": "Predict Unrated Movies via Weighted Average",
                    "description": f"Evaluated {len(unrated_movie_ids)} unrated movies. {len(predictions)} could be predicted using weights proportional to neighbor similarity."
                },
                {
                    "step": 5,
                    "title": "Rank & Filter Recommendations",
                    "description": f"Extracted the top {len(top_recommendations)} highest-predicted movies."
                }
            ]
        }

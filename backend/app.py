import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from services.data_loader import DataLoader
from algorithms.collaborative_filtering import UserCollaborativeFiltering
from algorithms.content_based import ContentBasedFiltering

def create_app():
    app = Flask(__name__)

    # Configure CORS - allow origins from env or default to all
    allowed_origin = os.environ.get("CORS_ORIGIN", "*")
    CORS(app, resources={r"/*": {"origins": allowed_origin}}, supports_credentials=True)

    # Initialize data loader and algorithms
    data_loader = DataLoader()

    @app.route('/api/health', methods=['GET'])
    def health_check():
        movies = data_loader.get_movies()
        users = data_loader.get_users()
        return jsonify({
            "status": "healthy",
            "service": "RecommenderLab Backend",
            "version": "1.0.0",
            "movies_count": len(movies),
            "users_count": len(users)
        }), 200

    @app.route('/api/movies', methods=['GET'])
    def get_movies():
        try:
            movies = data_loader.get_movies()
            return jsonify({
                "count": len(movies),
                "movies": movies
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/users', methods=['GET'])
    def get_users():
        try:
            users = data_loader.get_users()
            return jsonify({
                "count": len(users),
                "users": users
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/users/<user_id>/ratings', methods=['GET'])
    def get_user_ratings(user_id):
        try:
            uid = int(user_id)
            ratings = data_loader.get_user_ratings(uid)
            if not ratings:
                # Check if user actually exists
                users = [u['user_id'] for u in data_loader.get_users()]
                if uid not in users:
                    return jsonify({"error": f"User with ID {user_id} was not found."}), 404
            return jsonify({
                "user_id": uid,
                "ratings_count": len(ratings),
                "ratings": ratings
            }), 200
        except ValueError:
            return jsonify({"error": "Invalid user ID format. Must be an integer."}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/recommendations/collaborative', methods=['POST'])
    def get_collaborative_recommendations():
        try:
            data = request.get_json(silent=True) or {}
            if 'user_id' not in data:
                return jsonify({"error": "Missing required field: 'user_id'."}), 400

            user_id = int(data['user_id'])
            k = int(data.get('k', 3))
            top_n = int(data.get('top_n', 5))

            # ratings_updates can be a list of {movie_id, rating} or {user_id, movie_id, rating}
            ratings_override = []
            raw_updates = data.get('ratings_updates', [])
            if isinstance(raw_updates, list):
                for item in raw_updates:
                    ratings_override.append({
                        "user_id": int(item.get('user_id', user_id)),
                        "movie_id": int(item['movie_id']),
                        "rating": float(item['rating'])
                    })
            elif isinstance(raw_updates, dict):
                for mid_str, r_val in raw_updates.items():
                    ratings_override.append({
                        "user_id": user_id,
                        "movie_id": int(mid_str),
                        "rating": float(r_val)
                    })

            # Check user existence
            users = [u['user_id'] for u in data_loader.get_users()]
            if user_id not in users:
                return jsonify({"error": f"User with ID {user_id} was not found."}), 404

            # Build matrix with optional student overrides
            matrix = data_loader.get_rating_matrix(ratings_override=ratings_override)
            movies_map = {m['movie_id']: m for m in data_loader.get_movies()}

            cf = UserCollaborativeFiltering(rating_matrix=matrix, movies_map=movies_map)
            result = cf.recommend(target_user_id=user_id, k=k, top_n=top_n)

            return jsonify(result), 200

        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": f"Collaborative filtering calculation error: {str(e)}"}), 500

    @app.route('/api/recommendations/content', methods=['POST'])
    def get_content_recommendations():
        try:
            data = request.get_json(silent=True) or {}
            if 'movie_id' not in data:
                return jsonify({"error": "Missing required field: 'movie_id'."}), 400

            movie_id = int(data['movie_id'])
            top_n = int(data.get('top_n', 5))

            movies_df = data_loader.movies_df
            if movie_id not in movies_df['movie_id'].values:
                return jsonify({"error": f"Movie with ID {movie_id} was not found."}), 404

            cb = ContentBasedFiltering(movies_df)
            result = cb.recommend(selected_movie_id=movie_id, top_n=top_n)

            return jsonify(result), 200

        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": f"Content-based filtering calculation error: {str(e)}"}), 500

    @app.route('/api/experiments/compare', methods=['POST'])
    def compare_algorithms():
        try:
            data = request.get_json(silent=True) or {}
            if 'user_id' not in data or 'movie_id' not in data:
                return jsonify({"error": "Missing required fields: 'user_id' and 'movie_id'."}), 400

            user_id = int(data['user_id'])
            movie_id = int(data['movie_id'])
            k = int(data.get('k', 3))
            top_n = int(data.get('top_n', 5))

            # 1. Collaborative Filtering
            matrix = data_loader.get_rating_matrix()
            movies_map = {m['movie_id']: m for m in data_loader.get_movies()}
            cf = UserCollaborativeFiltering(rating_matrix=matrix, movies_map=movies_map)
            cf_result = cf.recommend(target_user_id=user_id, k=k, top_n=top_n)
            cf_recs = cf_result['recommendations']

            # 2. Content-Based Filtering
            cb = ContentBasedFiltering(data_loader.movies_df)
            cb_result = cb.recommend(selected_movie_id=movie_id, top_n=top_n)
            cb_recs = cb_result['recommendations']

            # 3. Analyze Overlap and Differences
            cf_ids = {r['movie_id']: r for r in cf_recs}
            cb_ids = {r['movie_id']: r for r in cb_recs}

            shared_ids = set(cf_ids.keys()) & set(cb_ids.keys())
            cf_only_ids = set(cf_ids.keys()) - shared_ids
            cb_only_ids = set(cb_ids.keys()) - shared_ids

            shared_movies = [
                {
                    "movie_id": mid,
                    "title": cf_ids[mid]['title'],
                    "genres": cf_ids[mid]['genres'],
                    "poster_url": cf_ids[mid]['poster_url'],
                    "collaborative_rank": cf_ids[mid]['rank'],
                    "collaborative_predicted_rating": cf_ids[mid]['predicted_rating'],
                    "content_rank": cb_ids[mid]['rank'],
                    "content_similarity": cb_ids[mid]['similarity']
                }
                for mid in shared_ids
            ]

            cf_only_movies = [cf_ids[mid] for mid in cf_only_ids]
            cb_only_movies = [cb_ids[mid] for mid in cb_only_ids]

            target_movie = cb_result['selected_movie']

            comparison_summary = {
                "user_id": user_id,
                "selected_movie": target_movie,
                "collaborative_recommendations": cf_recs,
                "content_recommendations": cb_recs,
                "overlap_count": len(shared_movies),
                "overlap_movies": shared_movies,
                "collaborative_only_count": len(cf_only_movies),
                "collaborative_only_movies": cf_only_movies,
                "content_only_count": len(cb_only_movies),
                "content_only_movies": cb_only_movies,
                "pedagogical_insights": [
                    {
                        "category": "Data Source & Signal",
                        "collaborative": "Relies on social proof: opinions and ratings from like-minded users in the community.",
                        "content_based": "Relies strictly on item metadata: matching genre tags and feature vector similarity.",
                        "takeaway": "Collaborative filtering can recommend movies outside the user's usual genres if similar people like them (serendipity)."
                    },
                    {
                        "category": "Cold Start Problem",
                        "collaborative": "Suffers when a new movie or user has few or no ratings (the 'cold-start' dilemma).",
                        "content_based": "Works immediately for brand-new movies as long as metadata (genres) is provided.",
                        "takeaway": "In real-world systems, hybrid recommenders combine both to get the best of both worlds."
                    },
                    {
                        "category": "Diversity & Novelty",
                        "collaborative": "Discovers unexpected cross-genre favorites based on shared taste clusters.",
                        "content_based": "Can create a 'filter bubble' or over-specialization by recommending only close genre clones.",
                        "takeaway": f"Notice how Content-Based focuses closely on {', '.join(target_movie['genres'])}, whereas Collaborative adapts to User {user_id}'s neighbors."
                    }
                ]
            }

            return jsonify(comparison_summary), 200

        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": f"Comparison calculation error: {str(e)}"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

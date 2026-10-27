import os
import sys
import pytest
import pandas as pd
import numpy as np

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from services.data_loader import DataLoader
from algorithms.collaborative_filtering import UserCollaborativeFiltering
from algorithms.content_based import ContentBasedFiltering

@pytest.fixture
def data_loader():
    return DataLoader()

def test_data_loader_movies_and_users(data_loader):
    movies = data_loader.get_movies()
    users = data_loader.get_users()

    assert len(movies) >= 20, "Should load at least 20 sample movies"
    assert len(users) >= 8, "Should load at least 8 sample users"
    
    # Check movie properties
    sample_movie = movies[0]
    assert "movie_id" in sample_movie
    assert "title" in sample_movie
    assert "genres" in sample_movie
    assert isinstance(sample_movie["genres"], list)
    assert len(sample_movie["genres"]) > 0

    # Check user properties
    sample_user = users[0]
    assert "user_id" in sample_user
    assert "ratings_count" in sample_user
    assert sample_user["ratings_count"] > 0

def test_collaborative_filtering_basic(data_loader):
    matrix = data_loader.get_rating_matrix()
    movies_map = {m['movie_id']: m for m in data_loader.get_movies()}
    cf = UserCollaborativeFiltering(rating_matrix=matrix, movies_map=movies_map)

    # User 1 is a Sci-Fi fan
    res = cf.recommend(target_user_id=1, k=3, top_n=5)
    
    assert res["target_user_id"] == 1
    assert len(res["top_k_neighbors"]) <= 3
    assert len(res["recommendations"]) <= 5
    assert len(res["recommendations"]) > 0

    # Ensure none of the recommendations are already rated by User 1
    rated_mids = {m["movie_id"] for m in res["target_rated_movies"]}
    for rec in res["recommendations"]:
        assert rec["movie_id"] not in rated_mids, f"Movie {rec['movie_id']} was already rated by target user!"
        assert 1.0 <= rec["predicted_rating"] <= 5.0
        assert "calculation_breakdown" in rec
        assert "reason" in rec

def test_collaborative_filtering_k_parameter_effect(data_loader):
    matrix = data_loader.get_rating_matrix()
    movies_map = {m['movie_id']: m for m in data_loader.get_movies()}
    cf = UserCollaborativeFiltering(rating_matrix=matrix, movies_map=movies_map)

    res_k1 = cf.recommend(target_user_id=1, k=1, top_n=5)
    res_k5 = cf.recommend(target_user_id=1, k=5, top_n=5)

    assert len(res_k1["top_k_neighbors"]) == 1
    assert len(res_k5["top_k_neighbors"]) > 1

def test_collaborative_filtering_rating_change_reactivity(data_loader):
    movies_map = {m['movie_id']: m for m in data_loader.get_movies()}
    
    # Original recommendations
    matrix_orig = data_loader.get_rating_matrix()
    cf_orig = UserCollaborativeFiltering(rating_matrix=matrix_orig, movies_map=movies_map)
    res_orig = cf_orig.recommend(target_user_id=1, k=3, top_n=5)
    
    # Modify User 7's rating on Inception (mid=1) or Endgame (mid=23)
    # User 7 is strongly similar to User 1. If User 7 changes rating of movie 23 from 5.0 to 1.0:
    override = [{"user_id": 7, "movie_id": 23, "rating": 1.0}]
    matrix_mod = data_loader.get_rating_matrix(ratings_override=override)
    cf_mod = UserCollaborativeFiltering(rating_matrix=matrix_mod, movies_map=movies_map)
    res_mod = cf_mod.recommend(target_user_id=1, k=3, top_n=5)

    # Find predicted rating for movie 23 in both
    orig_pred = next((r["predicted_rating"] for r in res_orig["all_predictions"] if r["movie_id"] == 23), None)
    mod_pred = next((r["predicted_rating"] for r in res_mod["all_predictions"] if r["movie_id"] == 23), None)

    if orig_pred is not None and mod_pred is not None:
        assert orig_pred > mod_pred, f"Prediction should drop when neighbor's rating drops: orig={orig_pred}, mod={mod_pred}"

def test_content_based_filtering_basic(data_loader):
    cb = ContentBasedFiltering(data_loader.movies_df)

    # Inception is movie_id=1 (Action|Adventure|Sci-Fi|Thriller)
    res = cb.recommend(selected_movie_id=1, top_n=5)

    assert res["selected_movie"]["movie_id"] == 1
    assert len(res["recommendations"]) == 5

    # Target movie must be excluded from recommendations
    rec_ids = [r["movie_id"] for r in res["recommendations"]]
    assert 1 not in rec_ids, "Selected movie must not recommend itself"

    # All recommended movies must have valid similarity scores between 0 and 1
    for rec in res["recommendations"]:
        assert 0.0 <= rec["similarity"] <= 1.0
        assert "shared_genres" in rec
        assert "explanation" in rec

def test_content_based_filtering_different_movies(data_loader):
    cb = ContentBasedFiltering(data_loader.movies_df)

    # Movie 1: Inception (Sci-Fi/Action)
    res_scifi = cb.recommend(selected_movie_id=1, top_n=3)
    # Movie 10: Toy Story (Animation/Family)
    res_anim = cb.recommend(selected_movie_id=10, top_n=3)

    scifi_rec_ids = [r["movie_id"] for r in res_scifi["recommendations"]]
    anim_rec_ids = [r["movie_id"] for r in res_anim["recommendations"]]

    # They should have completely different top recommendations
    assert scifi_rec_ids != anim_rec_ids

    # Finding Nemo (11) or Coco (21) should be in Toy Story recommendations
    anim_titles = [r["title"] for r in res_anim["recommendations"]]
    assert any("Nemo" in t or "Coco" in t or "Spirited" in t for t in anim_titles)

def test_edge_cases_and_invalid_inputs(data_loader):
    matrix = data_loader.get_rating_matrix()
    movies_map = {m['movie_id']: m for m in data_loader.get_movies()}
    cf = UserCollaborativeFiltering(rating_matrix=matrix, movies_map=movies_map)
    cb = ContentBasedFiltering(data_loader.movies_df)

    # Invalid user ID in CF
    with pytest.raises(ValueError):
        cf.recommend(target_user_id=99999)

    # Invalid movie ID in CB
    with pytest.raises(ValueError):
        cb.recommend(selected_movie_id=99999)

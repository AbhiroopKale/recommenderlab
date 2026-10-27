import os
import sys
import pytest
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert data['movies_count'] >= 20
    assert data['users_count'] >= 8

def test_get_movies(client):
    res = client.get('/api/movies')
    assert res.status_code == 200
    data = res.get_json()
    assert 'movies' in data
    assert len(data['movies']) >= 20

def test_get_users(client):
    res = client.get('/api/users')
    assert res.status_code == 200
    data = res.get_json()
    assert 'users' in data
    assert len(data['users']) >= 8

def test_get_user_ratings(client):
    # Valid user
    res = client.get('/api/users/1/ratings')
    assert res.status_code == 200
    data = res.get_json()
    assert data['user_id'] == 1
    assert 'ratings' in data
    assert len(data['ratings']) > 0

    # Non-existent user
    res_404 = client.get('/api/users/9999/ratings')
    assert res_404.status_code == 404

    # Invalid ID format
    res_400 = client.get('/api/users/abc/ratings')
    assert res_400.status_code == 400

def test_collaborative_recommendations_endpoint(client):
    # Valid call
    payload = {"user_id": 1, "k": 3, "top_n": 5}
    res = client.post('/api/recommendations/collaborative', 
                      data=json.dumps(payload), 
                      content_type='application/json')
    assert res.status_code == 200
    data = res.get_json()
    assert data['target_user_id'] == 1
    assert len(data['recommendations']) <= 5
    assert len(data['recommendations']) > 0
    assert 'workflow_steps' in data
    assert 'rating_matrix' in data

    # Missing user_id
    res_bad = client.post('/api/recommendations/collaborative', 
                          data=json.dumps({"k": 3}), 
                          content_type='application/json')
    assert res_bad.status_code == 400

    # Non-existent user_id
    res_not_found = client.post('/api/recommendations/collaborative', 
                                data=json.dumps({"user_id": 9999}), 
                                content_type='application/json')
    assert res_not_found.status_code == 404

def test_content_recommendations_endpoint(client):
    # Valid call
    payload = {"movie_id": 1, "top_n": 5}
    res = client.post('/api/recommendations/content', 
                      data=json.dumps(payload), 
                      content_type='application/json')
    assert res.status_code == 200
    data = res.get_json()
    assert data['selected_movie']['movie_id'] == 1
    assert len(data['recommendations']) == 5
    assert 'workflow_steps' in data
    assert 'chart_data' in data

    # Missing movie_id
    res_bad = client.post('/api/recommendations/content', 
                          data=json.dumps({}), 
                          content_type='application/json')
    assert res_bad.status_code == 400

    # Non-existent movie_id
    res_not_found = client.post('/api/recommendations/content', 
                                data=json.dumps({"movie_id": 9999}), 
                                content_type='application/json')
    assert res_not_found.status_code == 404

def test_compare_endpoint(client):
    # Valid call
    payload = {"user_id": 1, "movie_id": 1, "k": 3}
    res = client.post('/api/experiments/compare', 
                      data=json.dumps(payload), 
                      content_type='application/json')
    assert res.status_code == 200
    data = res.get_json()
    assert 'collaborative_recommendations' in data
    assert 'content_recommendations' in data
    assert 'overlap_movies' in data
    assert 'pedagogical_insights' in data
    assert len(data['pedagogical_insights']) >= 3

    # Missing parameters
    res_bad = client.post('/api/experiments/compare', 
                          data=json.dumps({"user_id": 1}), 
                          content_type='application/json')
    assert res_bad.status_code == 400

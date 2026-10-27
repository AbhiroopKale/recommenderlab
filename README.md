# RecommenderLab — Interactive Recommendation System Simulation Lab

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**RecommenderLab** is an educational simulation laboratory designed to help students, developers, and educators explore and master how recommendation algorithms work under the hood. Through interactive visual simulations, students can manipulate inputs, modify user ratings live, tune hyperparameters like $K$, inspect high-dimensional multi-hot genre vectors, and analyze why two algorithms produce fundamentally different recommendations.

---

## 🌟 Key Features

### 1. User-Based Collaborative Filtering Simulator
- **Interactive Rating Matrix**: Visualizes all users across all movies with color-coded ratings (1★ to 5★). Students can click and edit any cell live to immediately see how predictions dynamically adapt.
- **True Cosine Similarity on Overlapping Items**: Calculates user taste correlation exclusively over co-rated movies. Missing ratings are handled as unobserved values ($\text{NaN}$), avoiding artificial zero-rating biases.
- **Adjustable Neighborhood ($K$)**: Slider allows adjusting the number of nearest neighbors ($K \in [1, 10]$) with instant recalculation.
- **Weighted-Average Rating Predictions**: Calculates predicted ratings for unseen movies weighted by neighbor similarity.
- **Step-by-Step Educational Stepper**: Shows the full mathematical trace with actual plugged-in values.

### 2. Content-Based Filtering Simulator
- **Multi-Hot Feature Vector Representation**: Encodes catalog genres into binary feature vectors across a multi-dimensional genre vocabulary.
- **Cosine Angle in Feature Space**: Calculates geometric cosine similarity between movie feature vectors:
  $$\text{sim}(\mathbf{m}_1, \mathbf{m}_2) = \frac{\mathbf{v}_1 \cdot \mathbf{v}_2}{\|\mathbf{v}_1\|_2 \|\mathbf{v}_2\|_2}$$
- **Similarity Spectrum Chart**: Horizontal bar chart visualizing the top catalog matches.
- **Transparent Match Explanations**: Highlights shared genres and calculates match percentages.
- **Strict Self-Exclusion**: Guarantees the query movie is excluded from its own recommendation rankings.

### 3. Algorithm Comparison Lab
- **Side-by-Side Dual Column Benchmarking**: Select a user and one of their highly rated movies to directly compare Collaborative Filtering (social signal) against Content-Based Filtering (genre metadata).
- **Consensus & Disparity Metrics**: Highlights shared overlapping recommendations versus algorithm-unique discoveries.
- **Pedagogical Insights**: In-depth explanations covering Social Proof vs. Metadata, Cold-Start dilemmas, and Serendipity vs. Filter Bubbles.

---

## 📐 Mathematical Foundations

### Cosine Similarity (Co-Rated Items)
For target user $u$ and neighbor $v$ over common co-rated movies $I_{uv} = \{i \mid r_{u,i} \neq \text{NaN} \land r_{v,i} \neq \text{NaN}\}$:
$$\text{sim}(u, v) = \frac{\sum_{i \in I_{uv}} r_{u,i} \cdot r_{v,i}}{\sqrt{\sum_{i \in I_{uv}} r_{u,i}^2} \cdot \sqrt{\sum_{i \in I_{uv}} r_{v,i}^2}}$$

### Weighted Average Rating Prediction
For unseen movie $j$, using top $K$ neighbors $N_K(u)$ with $\text{sim}(u, v) > 0$:
$$\hat{r}(u, j) = \frac{\sum_{v \in N_K(u)} \text{sim}(u, v) \cdot r_{v, j}}{\sum_{v \in N_K(u)} \text{sim}(u, v)}$$

### Content-Based Binary Cosine Similarity
For movies $A$ and $B$ with binary genre vectors $\mathbf{a}, \mathbf{b} \in \{0, 1\}^D$:
$$\text{sim}(A, B) = \frac{|G_A \cap G_B|}{\sqrt{|G_A|} \cdot \sqrt{|G_B|}}$$

---

## 📁 Project Architecture

```
recommenderlab/
├── backend/
│   ├── algorithms/
│   │   ├── collaborative_filtering.py  # User-based CF, cosine similarity, KNN
│   │   └── content_based.py            # Multi-hot vectorizer & cosine similarity
│   ├── data/
│   │   ├── sample_movies.csv           # Curated catalog of 25 popular movies
│   │   └── sample_ratings.csv          # Realistic ratings from 10 distinct user personas
│   ├── services/
│   │   └── data_loader.py              # Dynamic data handling & rating matrix pivot
│   ├── app.py                          # Flask REST API endpoints & CORS setup
│   ├── requirements.txt                # Python dependencies (Flask, pandas, scikit-learn, etc.)
│   └── .env.example                    # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExplanationPanel.jsx    # Step-by-step workflow stepper
│   │   │   ├── MovieCard.jsx           # Movie card with scores & breakdowns
│   │   │   ├── Navbar.jsx              # Navigation & live backend health status
│   │   │   ├── PosterImage.jsx         # Image renderer with SVG gradient fallback
│   │   │   └── RatingMatrix.jsx        # Interactive matrix table with inline editing
│   │   ├── pages/
│   │   │   ├── OverviewPage.jsx        # Lab introduction & formula cheat sheet
│   │   │   ├── CollaborativePage.jsx   # Collaborative filtering simulation lab
│   │   │   ├── ContentBasedPage.jsx    # Content-based genre simulation lab
│   │   │   └── ComparisonPage.jsx      # Side-by-side comparative analysis
│   │   ├── services/
│   │   │   └── api.js                  # Axios client configured with VITE_API_URL
│   │   ├── App.jsx                     # Top-level state and layout
│   │   ├── main.jsx                    # React root entrypoint
│   │   └── index.css                   # Tailwind CSS styling and theme
│   ├── package.json
│   ├── vite.config.js                  # Vite configuration with local proxy
│   ├── vercel.json                     # Vercel SPA routing rewrites
│   └── .env.example                    # Frontend environment template
├── tests/
│   ├── test_algorithms.py              # Unit tests for CF, CB, and edge cases
│   └── test_api.py                     # Integration tests for Flask endpoints
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### Step 1: Start the Backend (Flask)
```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```
Backend will start on `http://localhost:5000`. Test it by opening `http://localhost:5000/api/health`.

### Step 2: Start the Frontend (React + Vite)
In a new terminal window:
```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
Frontend will start at `http://localhost:5173`. Open it in your browser to start the simulation lab.

---

## 📡 REST API Documentation

### 1. Backend Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "RecommenderLab Backend",
  "version": "1.0.0",
  "movies_count": 25,
  "users_count": 10
}
```

### 2. Catalog Movies
- **Endpoint**: `GET /api/movies`
- **Response**: List of all available movies with title, genres, release year, overview, and poster URL.

### 3. Sample Users
- **Endpoint**: `GET /api/users`
- **Response**: List of users with ratings count, average rating, and taste persona summary.

### 4. User Rating History
- **Endpoint**: `GET /api/users/<user_id>/ratings`
- **Response**: All movies rated by `<user_id>` with their given scores.

### 5. Collaborative Filtering Recommendations
- **Endpoint**: `POST /api/recommendations/collaborative`
- **Request Body**:
```json
{
  "user_id": 1,
  "k": 3,
  "top_n": 5,
  "ratings_updates": [
    {"user_id": 1, "movie_id": 23, "rating": 5.0}
  ]
}
```
- **Response**: Top 5 recommendations with predicted ratings, contributing neighbors, workflow steps, and complete rating matrix.

### 6. Content-Based Filtering Recommendations
- **Endpoint**: `POST /api/recommendations/content`
- **Request Body**:
```json
{
  "movie_id": 1,
  "top_n": 5
}
```
- **Response**: Seed movie profile, multi-hot feature vector, ranked similarity chart data, and top recommendations with matching genre explanations.

### 7. Algorithm Comparison
- **Endpoint**: `POST /api/experiments/compare`
- **Request Body**:
```json
{
  "user_id": 1,
  "movie_id": 1,
  "k": 3,
  "top_n": 5
}
```
- **Response**: Overlapping movies, unique recommendations per algorithm, and educational insight breakdown.

---

## 🧪 Automated Testing

Automated tests verify that both algorithms calculate mathematically authentic results from input data, that rating adjustments dynamically change output predictions, and that edge cases (missing ratings, zero norms, invalid IDs) are safely handled.

To run the test suite:
```bash
pytest -v tests/
```

### Test Coverage Summary:
- `test_data_loader_movies_and_users`: Verifies dataset parsing and persona extraction.
- `test_collaborative_filtering_basic`: Verifies cosine similarity on co-rated items, neighbor ranking, and prediction formula.
- `test_collaborative_filtering_k_parameter_effect`: Confirms changing $K$ alters the neighbor pool.
- `test_collaborative_filtering_rating_change_reactivity`: Validates that modifying ratings directly changes predictions.
- `test_content_based_filtering_basic`: Confirms multi-hot encoding, cosine similarity, and strict self-exclusion.
- `test_content_based_filtering_different_movies`: Validates genre sensitivity across distinct genres.
- `test_edge_cases_and_invalid_inputs`: Checks non-existent users, non-existent movies, and bad inputs.
- `test_api.py`: Validates all 7 Flask endpoints with HTTP status codes and error schemas.

---

## 🌐 Deployment Instructions

### 1. Frontend Deployment (Vercel)
1. Fork or push the repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository and configure the project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://recommenderlab-backend.onrender.com`).
5. Click **Deploy**. Vercel will build and deploy the React application.

### 2. Backend Deployment (Render)
1. Sign in to [Render](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. In **Environment Variables**, add:
   - `CORS_ORIGIN`: Your deployed Vercel frontend URL (e.g., `https://recommenderlab.vercel.app` or `*` for initial setup).
   - `PORT`: `5000` (Render binds automatically).
5. Click **Create Web Service**.

---

## 📦 Git Push Commands

To push this project to a new GitHub repository:

```bash
# Initialize git repository (if not already initialized)
git init

# Add all project files
git add .

# Commit files
git commit -m "feat: complete RecommenderLab interactive simulation lab"

# Add remote repository (replace with your repository URL)
git remote add origin https://github.com/<your-username>/recommenderlab.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## 💡 Educational Takeaway

| Aspect | User-Based Collaborative Filtering | Content-Based Filtering |
| :--- | :--- | :--- |
| **Primary Input** | User-item rating matrix | Item metadata (genres) |
| **Similarity Metric** | Cosine similarity on co-rated items | Cosine angle between binary feature vectors |
| **Cold-Start Handling** | Struggles with brand-new users/items | Works immediately for new items with genres |
| **Recommendation Flavor** | Serendipitous (cross-genre discoveries) | Conservative (genre-consistent clones) |
| **Real-World Standard** | Spotify Discover Weekly, Amazon "Customers Also Bought" | Netflix genre rows, Pandora music genome |

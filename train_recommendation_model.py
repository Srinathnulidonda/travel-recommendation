import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Sample data (in a real scenario, this would come from your database)
data = {
    'name': ['Paris', 'New York', 'Tokyo', 'London', 'Rome'],
    'features': [
        'romantic city art culture food',
        'bustling city shopping food culture',
        'technology modern food culture tradition',
        'history culture shopping food',
        'history art food culture ancient'
    ]
}

# Create a DataFrame
df = pd.DataFrame(data)

# Create TF-IDF Vectorizer
tfidf = TfidfVectorizer(stop_words='english')

# Fit and transform the features
tfidf_matrix = tfidf.fit_transform(df['features'])

# Compute cosine similarity
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Create a simple recommendation function
def get_recommendations(title, cosine_sim=cosine_sim):
    idx = df.index[df['name'] == title].tolist()[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:6]  # Top 5 similar items
    destination_indices = [i[0] for i in sim_scores]
    return df['name'].iloc[destination_indices]

# Create a dictionary to store the model components
model = {
    'tfidf_vectorizer': tfidf,
    'cosine_sim_matrix': cosine_sim,
    'destination_data': df
}

# Save the model
joblib.dump(model, 'recommendation_model.joblib')

print("Model saved as recommendation_model.joblib")
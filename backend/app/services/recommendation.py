from sqlalchemy.orm import Session, joinedload
from app.models.idea import Idea
from app.models.saved_idea import SavedIdea
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def _idea_text(idea: Idea) -> str:
    tags = " ".join(idea.tags or [])
    return f"{idea.title} {idea.problem_statement} {idea.solution} {idea.target_market} {tags}"


def get_recommendations_for_user(db: Session, user_id: int, limit: int = 6) -> list[Idea]:
    """Return ideas similar to the user's saved ideas using TF-IDF cosine similarity."""
    saved = db.query(SavedIdea).filter(SavedIdea.user_id == user_id).all()
    saved_ids = {s.idea_id for s in saved}

    if not saved_ids:
        # Cold start: return highest-feasibility ideas
        ideas = (
            db.query(Idea)
            .options(joinedload(Idea.category))
            .order_by(Idea.feasibility_score.desc())
            .limit(limit)
            .all()
        )
        for i in ideas:
            i.is_saved = False
        return ideas

    all_ideas = db.query(Idea).options(joinedload(Idea.category)).all()
    if len(all_ideas) < 2:
        return []

    corpus = [_idea_text(idea) for idea in all_ideas]
    vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
    tfidf_matrix = vectorizer.fit_transform(corpus)

    idea_index = {idea.id: idx for idx, idea in enumerate(all_ideas)}
    saved_indices = [idea_index[sid] for sid in saved_ids if sid in idea_index]

    if not saved_indices:
        return []

    saved_vectors = tfidf_matrix[saved_indices]
    profile_vector = np.asarray(saved_vectors.mean(axis=0))

    similarities = cosine_similarity(profile_vector, tfidf_matrix)[0]

    scored = sorted(
        [(all_ideas[i], float(similarities[i])) for i in range(len(all_ideas)) if all_ideas[i].id not in saved_ids],
        key=lambda x: x[1],
        reverse=True,
    )

    results = [idea for idea, _ in scored[:limit]]
    for r in results:
        r.is_saved = False
    return results

import pandas as pd
from .models import Grade
from django.db.models import F

def calculate_course_statistics(course_id):
    """
    Calculates statistics for a course using Pandas Vectorization.
    """
    # Fetch data efficiently
    # We want student ID and their grade details/final score
    grades_qs = Grade.objects.filter(course_id=course_id).values('student__username', 'details', 'final_score')
    
    if not grades_qs.exists():
        return None

    df = pd.DataFrame(list(grades_qs))
    
    # Expand JSONB 'details' into columns
    # Assuming details is like {'quiz1': 10, 'midterm': 50}
    details_df = pd.json_normalize(df['details'])
    df = pd.concat([df.drop(['details'], axis=1), details_df], axis=1)
    
    # Calculate stats
    stats = {
        'count': len(df),
        'mean_final': df['final_score'].mean(),
        'std_final': df['final_score'].std(),
        'max_final': df['final_score'].max(),
        'min_final': df['final_score'].min(),
    }
    
    # Example: Calculate average for each assignment (vectorized)
    # We iterate over columns that are not metadata
    assignment_cols = [c for c in df.columns if c not in ['student__username', 'final_score']]
    for col in assignment_cols:
         stats[f'mean_{col}'] = df[col].mean()

    return stats

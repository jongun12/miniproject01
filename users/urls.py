from django.urls import path
from .views import UserRegistrationView, UserMeView, UserStatsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('me/', UserMeView.as_view(), name='me'),
    path('stats/', UserStatsView.as_view(), name='user_stats'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

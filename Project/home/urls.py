from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('police/login/', views.police_login, name='police_login'),
    path('tourist/login/', views.tourist_login, name='tourist_login'),
    path('tourist/dashboard/', views.tourist_dashboard, name='tourist_dashboard'),
    path('police/dashboard/', views.police_dashboard, name='police_dashboard'),
    path('logout/', views.logout_view, name='logout'),
]
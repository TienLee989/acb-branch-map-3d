from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BranchViewSet

router = DefaultRouter()
router.register(r'branchs', BranchViewSet, basename='branchs')

urlpatterns = [
    path('', include(router.urls)),
]
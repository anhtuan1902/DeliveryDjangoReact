from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register('posts', views.PostViewSet, 'post')
router.register('discounts', views.DiscountViewSet, 'discount')
router.register('rate', views.RateViewSet, 'rate')
router.register('shippers', views.ShipperViewSet, 'shipper')
router.register('customers', views.CustomerViewSet, 'customer')
router.register('admins', views.AdminViewSet, 'admin')
router.register('users', views.UserViewSet, 'user')
router.register('orders', views.OrderViewSet, 'order')
router.register('auctions', views.AuctionViewSet, 'auction')
router.register('comments', views.CommentViewSet, 'comment')

urlpatterns = [
    path('', include(router.urls)),
    path('oauth2-info/', views.AuthInfo.as_view())
]

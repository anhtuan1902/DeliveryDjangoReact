from rest_framework import viewsets, generics, status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Shipper, Discount, Order, Post, Auction, Comment, Rating, Admin, Customer, User
from .serializers import DiscountSerializer, UserSerializer, OrderSerializer, PostSerializer, \
    AuctionSerializer, CommentSerializer, RatingSerializer, AdminSerializer, CustomerSerializer, ShipperDetailSerializer
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView

from django.conf import settings


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView,
                  generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, ]

    def get_queryset(self):
        post = Post.objects.filter(active=True)

        q = self.request.query_params.get('q')
        if q is not None:
            post = post.filter(product_name__icontains=q)

        return post

    def create(self, request, *args, **kwargs):
        if request.user.user_role == "CUSTOMER_ROLE":
            return super().create(request, *args, **kwargs)
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(methods=['post'], detail=True, url_path='add-auction')
    def add_auction(self, request, pk):
        if request.user.user_role == "SHIPPER_ROLE":
            content = request.data.get('content')
            price = request.data.get('price')
            shipper = Shipper.objects.filter(user__is_active=True)

            if content and price:
                auc = Auction.objects.create(content=content, price=price, delivery=shipper.filter(user=request.user)[0],
                                             post=self.get_object())

                return Response(AuctionSerializer(auc).data, status=status.HTTP_201_CREATED)

            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().customer.user:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class AuctionViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView, generics.CreateAPIView):
    queryset = Auction.objects.filter(active=True)
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().customer:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class DiscountViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView,
                      generics.CreateAPIView):
    queryset = Discount.objects.filter(active=True)
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.user_role == "ADMIN_ROLE":
            return super().create(request, *args, **kwargs)
        return Response(status=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().admin:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class CommentViewSet(viewsets.ViewSet, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().creator:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class OrderViewSet(viewsets.ViewSet, generics.UpdateAPIView):
    queryset = Order.objects.filter(active=True)
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().shipper:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, generics.RetrieveAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action == 'current_user' or self.action == 'list':
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'put'], detail=False, url_path='current-user')
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('PUT'):
            for k, v in request.data.items():
                if k.__eq__('password'):
                    u.set_password(k)
                else:
                    setattr(u, k, v)
            u.save()

        return Response(UserSerializer(u, context={'request': request}).data)


class ShipperViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = Shipper.objects.filter(user__is_active=True, user__user_role__icontains='SHIPPER_ROLE')
    serializer_class = ShipperDetailSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action == 'get_comment' or self.action == 'add_comment' \
                or self.action == 'get_rate' or self.action == 'rate':
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    def filter_queryset(self, queryset):
        CMND = self.request.query_params.get('q')
        if CMND:
            queryset = queryset.filter(CMND__icontains=CMND)

        userid = self.request.query_params.get('userid')
        if userid:
            queryset = queryset.filter(user__id__icontains=userid)
        return queryset

    @action(methods=['get'], detail=True, url_path='get-comment')
    def get_comment(self, request, pk):
        shipper_id = Shipper.objects.get(pk=pk)
        comments = shipper_id.comments_shipper.filter()

        return Response(CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='add-comment')
    def add_comment(self, request, pk):
        content = request.data.get('content')
        if content:
            c = Comment.objects.create(content=content, creator=request.user, shipper=self.get_object())

            return Response(CommentSerializer(c).data, status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=True, url_path='get-rate')
    def get_rate(self, request, pk):
        shipper_id = Shipper.objects.get(pk=pk)
        rates = shipper_id.rating.filter()

        return Response(RatingSerializer(rates, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='rating')
    def rate(self, request, pk):
        rating = request.data.get('rate')
        if rating:
            try:
                rating = Rating.objects.update_or_create(creator=request.user, book=self.get_object(), defaults={
                    'rate': rating
                })
            except:
                rate = Rating.objects.get(creator=request.user, book=self.get_object())
                rate.rate = rating
                rate.save()
                return Response(RatingSerializer(rate).data, status=status.HTTP_200_OK)
            else:
                return Response(RatingSerializer(rating).data, status=status.HTTP_200_OK)


class AdminViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Admin.objects.filter(user__is_active=True, user__user_role__icontains='ADMIN_ROLE')
    serializer_class = AdminSerializer
    parser_classes = [MultiPartParser, ]

    def filter_queryset(self, queryset):
        userid = self.request.query_params.get('userid')
        if userid:
            queryset = queryset.filter(user__id__icontains=userid)
        return queryset

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]


class CustomerViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Customer.objects.filter(user__is_active=True, user__user_role__icontains='CUSTOMER_ROLE')
    serializer_class = CustomerSerializer
    parser_classes = [MultiPartParser, ]

    def filter_queryset(self, queryset):
        userid = self.request.query_params.get('userid')
        if userid:
            queryset = queryset.filter(user__id__icontains=userid)
        return queryset

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]


class AuthInfo(APIView):
    def get(self, request):
        return Response(settings.OAUTH2_INFO, status=status.HTTP_200_OK)

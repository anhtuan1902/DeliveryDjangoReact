from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Shipper, Discount, Order, Post, Auction, Comment, Rating, Admin, Customer, User
from .serializers import DiscountSerializer, ShipperSerializer, UserSerializer, OrderSerializer, PostSerializer, \
    AuctionSerializer, CommentSerializer, RatingSerializer, AdminSerializer, CustomerSerializer, ShipperDetailSerializer
from rest_framework import permissions
import cloudinary.uploader


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView,
                  generics.CreateAPIView):
    queryset = Post.objects.filter(active=True)
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post = Post.objects.filter(active=True)

        q = self.request.query_params.get('q')
        if q is not None:
            post = post.filter(product_name__icontains=q)

        post_id = self.request.query_params.get('id')
        if post_id is not None:
            post = post.filter(id=post_id)

        return post

    @action(methods='get', detail=True, url_path='get-auction')
    def get_auction(self, request, pk):
        post_id = Post.objects.get(pk=pk)
        auctions = post_id.auctions_post.filter(active=True)

        return Response(AuctionSerializer(auctions, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='add-auction')
    def add_auction(self, request, pk):
        content = request.data.get('content')
        if content:
            auc = Auction.objects.create(content=content, delivery=request.user, post=self.get_object())

            return Response(AuctionSerializer(auc).data, status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().customer:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class AuctionViewSet(viewsets.ModelViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
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


class UserViewSet(viewsets.ViewSet, generics.UpdateAPIView, generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer

    @action(methods=['get'], detail=False, url_path='current-user')
    def get_current_user(self, request):
        return Response(self.serializer_class(request.user).data,
                        status=status.HTTP_200_OK)


class ShipperViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    serializer_class = ShipperDetailSerializer

    def get_queryset(self):
        shippers = Shipper.objects.filter(user__is_active=True, user__user_role__icontains='SHIPPER_ROLE')

        CMND = self.request.query_params.get('q')
        if CMND is not None:
            shippers = shippers.filter(CMND__icontains=CMND)

        shipper_id = self.request.query_params.get('shipper_id')
        if shipper_id is not None:
            shippers = shippers.filter(user__id=shipper_id)
        return shippers

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


class AdminViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Admin.objects.filter(user__is_active=True, user__user_role__icontains='ADMIN_ROLE')
    serializer_class = AdminSerializer


class CustomerViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Customer.objects.filter(user__is_active=True, user__user_role__icontains='CUSTOMER_ROLE')
    serializer_class = CustomerSerializer

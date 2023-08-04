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
from django.core.mail import send_mail
from django.conf import settings


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView,
                  generics.CreateAPIView):
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, ]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post = Post.objects.all()

        q = self.request.query_params.get('q')
        if q is not None:
            post = post.filter(product_name__icontains=q)

        return post

    def create(self, request, *args, **kwargs):
        if request.user.user_role == "CUSTOMER_ROLE":
            return super().create(request, *args, **kwargs)
        return Response(status=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().customer.user:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(methods=['post'], detail=True, url_path='auctions')
    def auctions(self, request, pk):
        if request.user.user_role == 'SHIPPER_ROLE':
            post = Post.objects.get(pk=pk)
            delivery = Shipper.objects.get(user=request.user.id)
            a, _ = Auction.objects.get_or_create(post=post, delivery=delivery)
            if _:
                a.content = request.data['content']
                a.price = request.data['price']
            elif not a.active:
                    a.content = request.data['content']
                    a.price = request.data['price']
                    a.active = True
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
            a.save()
            return Response(AuctionSerializer(a, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_403_FORBIDDEN)


class AuctionViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView):
    queryset = Auction.objects.filter(active=True)
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=True, url_path='orders')
    def orders(self, request, pk):
        if request.user.user_role == 'CUSTOMER_ROLE':
            auction = Auction.objects.get(pk=pk)
            delivery = Shipper.objects.get(pk=request.data['delivery'])
            customer = Customer.objects.get(pk=request.data['customer'])
            o = Order.objects.create(auction=auction, shipper=delivery, customer=customer)
            o.amount = request.data['amount']
            o.active = True
            o.save()

            subject = 'XÁc NHẬN ĐƠN HÀNG'
            message = f'Chào {delivery.user.last_name},\nĐơn hàng bạn đấu giá đã được xác nhận vui lòng thực hiện đơn hàng.\nCám ơn,\n{customer.user.last_name}'
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [delivery.user.email, ]
            send_mail(subject, message, email_from, recipient_list)

            return Response(OrderSerializer(o, context={'request': request}).data, status=status.HTTP_201_CREATED)
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
        if request.user == self.get_object().admin.user:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class CommentViewSet(viewsets.ViewSet, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().creator.user:
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class RateViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Rating.objects.filter()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView):
    queryset = Order.objects.filter(active=True)
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        if request.user == self.get_object().shipper.user or request.user.user_role == "ADMIN_ROLE":
            o = Order.objects.get(pk=self.kwargs['pk'])

            c = Customer.objects.get(pk=o.customer_id)

            subject = 'CẬP NHẬT ĐƠN HÀNG'
            message = f'Chào {c.user.last_name},\nĐơn hàng của bạn đã được cập nhật mới vui lòng kiểm tra.\nTrạng thái hiện tại là {request.data["status_order"]}\nCám ơn'
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [c.user.email, ]
            send_mail(subject, message, email_from, recipient_list)
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, generics.RetrieveAPIView,
                  generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer

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


class ShipperViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView,
                     generics.RetrieveAPIView):
    queryset = Shipper.objects.filter(user__is_active=True, user__user_role__icontains='SHIPPER_ROLE')
    serializer_class = ShipperDetailSerializer
    parser_classes = [MultiPartParser, ]

    def filter_queryset(self, queryset):
        CMND = self.request.query_params.get('q')
        if CMND:
            queryset = queryset.filter(CMND__icontains=CMND)

        userid = self.request.query_params.get('userid')
        if userid:
            queryset = queryset.filter(user__id__icontains=userid)
        return queryset

    def partial_update(self, request, *args, **kwargs):
        if request.user.user_role == "ADMIN_ROLE":
            return super().partial_update(request, *args, **kwargs)

        return Response(status=status.HTTP_403_FORBIDDEN)

    def get_permissions(self):
        if self.action in ['get_comment', 'comments', 'get_rate', 'rate']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], detail=True, url_path='get-comment')
    def get_comment(self, request, pk):
        shipper_id = Shipper.objects.get(pk=pk)
        comments = shipper_id.comments_shipper.filter(active=True)

        return Response(CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='comments')
    def comments(self, request, pk):
        if request.user.user_role == 'CUSTOMER_ROLE':
            shipper = Shipper.objects.get(pk=pk)
            customer = Customer.objects.get(user=request.user.id)
            c = Comment(content=request.data['content'], shipper=shipper, creator=customer)
            c.save()
            return Response(CommentSerializer(c, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(methods=['get'], detail=True, url_path='get-rate')
    def get_rate(self, request, pk):
        shipper_id = Shipper.objects.get(pk=pk)
        rates = shipper_id.rating.filter()

        return Response(RatingSerializer(rates, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='rating')
    def rate(self, request, pk):
        if request.user.user_role == 'CUSTOMER_ROLE':
            shipper = Shipper.objects.get(pk=pk)
            customer = Customer.objects.get(user=request.user.id)
            r, _ = Rating.objects.get_or_create(shipper=shipper, creator=customer)
            r.rate = request.data['rate']
            r.save()

            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_403_FORBIDDEN)


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

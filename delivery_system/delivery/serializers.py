from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Discount, Post, Order, Admin, Auction, User, Rating, Customer, Comment, Shipper


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'user_role', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': 'true'}
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()

        return user


class ShipperSerializer(ModelSerializer):
    class Meta:
        model = Shipper
        fields = ['id', 'avatar', 'CMND', 'already_verify', 'user']
        extra_kwargs = {
            'already_verify': {'write_only': 'true'}
        }

    def create(self, validated_data):
        shipper = Shipper(**validated_data)
        shipper.save()

        return shipper


class AdminSerializer(ModelSerializer):

    class Meta:
        model = Admin
        fields = ['id', 'avatar', 'user']

    def create(self, validated_data):
        admin = Admin(**validated_data)
        admin.save()

        return admin


class CustomerSerializer(ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'avatar', 'user']

    def create(self, validated_data):
        customer = Customer(**validated_data)
        customer.save()

        return customer


class ShipperDetailSerializer(ShipperSerializer):
    rate = serializers.SerializerMethodField()

    def get_rate(self, shipper):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            r = shipper.rating.filter(creator=request.user).first()
            if r:
                return r.rate
        return -1

    class Meta:
        model = ShipperSerializer.Meta.model
        fields = ShipperSerializer.Meta.fields + ['rate']


class DiscountSerializer(ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'discount_title', 'discount_percent', 'admin', 'active', 'created_date']


class PostSerializer(ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'product_name', 'product_img', 'from_address', 'to_address', 'description',
                  'discount', 'customer', 'active', 'created_date', 'updated_date']


class AuctionSerializer(ModelSerializer):
    post = PostSerializer()
    delivery = ShipperSerializer()

    class Meta:
        model = Auction
        fields = ['id', 'content', 'delivery', 'post', 'had_accept', 'price']


class CommentSerializer(ModelSerializer):
    creator = CustomerSerializer()
    shipper = ShipperSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'shipper', 'creator']


class RatingSerializer(ModelSerializer):
    creator = CustomerSerializer()
    shipper = ShipperSerializer()

    class Meta:
        model = Rating
        fields = ['id', 'rate', 'shipper', 'creator']


class OrderSerializer(ModelSerializer):
    shipper = ShipperSerializer()
    auction = AuctionSerializer()

    class Meta:
        model = Order
        fields = ['id', 'status_order', 'auction', 'shipper', 'created_date', 'updated_date']


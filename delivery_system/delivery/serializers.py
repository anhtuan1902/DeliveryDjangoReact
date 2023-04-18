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
    user = UserSerializer()

    class Meta:
        model = Shipper
        fields = ['id', 'avatar', 'CMND', 'already_verify', 'user']
        extra_kwargs = {
            'already_verify': {'write_only': 'true'}
        }

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User(**user_data)
        user.set_password(user_data['password'])
        user.save()
        shipper = Shipper(user=user, **validated_data)
        shipper.save()

        return shipper


class AdminSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Admin
        fields = ['id', 'avatar', 'user']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User(**user_data)
        user.set_password(user_data['password'])
        user.save()
        admin = Admin(user=user, **validated_data)
        admin.save()

        return admin


class CustomerSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Customer
        fields = ['id', 'avatar', 'user']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User(**user_data)
        user.set_password(user_data['password'])
        user.save()
        customer = Customer(user=user, **validated_data)
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
    admin = AdminSerializer()

    class Meta:
        model = Discount
        fields = ['id', 'discount_title', 'discount_percent', 'admin', 'active', 'created_date']


class PostSerializer(ModelSerializer):
    customer = CustomerSerializer()
    discount = DiscountSerializer()

    class Meta:
        model = Post
        fields = ['id', 'product_name', 'img', 'from_address', 'to_address', 'description',
                  'discount', 'customer', 'active']


class AuctionSerializer(ModelSerializer):
    post = PostSerializer()

    class Meta:
        model = Auction
        fields = ['id', 'content', 'delivery', 'post', 'had_accept']


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


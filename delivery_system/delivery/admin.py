from django.contrib import admin
from .models import Discount, Post, Order, Admin, Auction, User, Rating, Customer, Comment, Shipper


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'password', 'first_name', 'last_name', 'email', 'user_role', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['CMND__startswith', 'username__startswith', 'first_name__startswith', 'last_name__startswith']


@admin.register(Shipper)
class ShipperAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_img', 'CMND', 'already_verify', 'user']
    list_filter = ['already_verify', 'user__is_active']
    search_fields = ['CMND', 'user__username_startswith']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_img', 'user']
    list_filter = ['user__is_active']
    search_fields = ['user__username__startswith']


@admin.register(Admin)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_img', 'user']
    list_filter = ['user__is_active']
    search_fields = ['username__startswith']


@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    fields = ['discount_title', 'discount_percent', 'admin', 'active']
    list_display = ['id', 'discount_title', 'discount_percent', 'admin', 'active', 'created_date']
    list_filter = ['active', 'created_date']
    search_fields = ['discount_title__startswith']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'status_order', 'shipper', 'auction', 'created_date', 'updated_date']
    list_filter = ['status_order', 'created_date', 'updated_date']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_name', 'img', 'from_address', 'to_address', 'description',
                    'discount', 'customer', 'active', 'created_date']
    list_filter = ['created_date', 'active']
    search_fields = ['title__startswith', 'product_name__startswith']


@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'delivery', 'post', 'had_accept', 'created_date']
    list_filter = ['created_date', 'had_accept']
    search_fields = ['content__startswith']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'shipper', 'creator', 'created_date']
    list_filter = ['created_date']


@admin.register(Rating)
class RateAdmin(admin.ModelAdmin):
    list_display = ['id', 'rate', 'shipper', 'creator', 'created_date']
    list_filter = ['created_date']

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.safestring import mark_safe


class User(AbstractUser):
    ROLE = (
        ("ADMIN_ROLE", 'ADMIN_ROLE'),
        ("CUSTOMER_ROLE", "CUSTOMER_ROLE"),
        ("SHIPPER_ROLE", 'SHIPPER_ROLE')
    )

    email = models.EmailField(max_length=254, unique=True, null=False)
    user_role = models.CharField(max_length=50, choices=ROLE, default='CUSTOMER_ROLE')
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.FileField(upload_to='delivery-system-image')

    class Meta:
        unique_together = ('id', 'user')

    def user_img(self):
        return mark_safe('<img src="{}" width="100" alt="avatar"/>'.format(self.avatar.url))


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.FileField(upload_to='delivery-system-image')

    class Meta:
        unique_together = ('id', 'user')

    def user_img(self):
        return mark_safe('<img src="{}" width="100" alt="avatar"/>'.format(self.avatar.url))


class Shipper(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.FileField(upload_to='delivery-system-image')
    CMND = models.CharField(max_length=50, null=False, unique=True)
    already_verify = models.BooleanField(default=False)

    class Meta:
        unique_together = ('id', 'user')

    def user_img(self):
        return mark_safe('<img src="{}" width="100" alt="avatar"/>'.format(self.avatar.url))


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True )

    class Meta:
        abstract = True
        # Sắp xếp theo thứ tự giảm dần theo id
        ordering = ['-id']


class Discount(BaseModel):
    discount_title = models.CharField(max_length=50, null=False)
    discount_percent = models.IntegerField(null=False)
    admin = models.ForeignKey(Admin, related_name='discounts', on_delete=models.CASCADE)

    def __str__(self):
        return self.discount_title


class Order(BaseModel):
    STATUS = (
        ("CANCEL", 'CANCEL'),
        ("CONFIRM", "CONFIRM"),
        ("DELIVERING", 'DELIVERING'),
        ('RECEIVED', 'RECEIVED')
    )
    amount = models.FloatField(null=False, default=0)
    status_order = models.CharField(max_length=12, choices=STATUS, default='CONFIRM')
    auction = models.ForeignKey('Auction', related_name='order_auction', on_delete=models.CASCADE)
    shipper = models.ForeignKey(Shipper, related_name='order_shipper', on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, related_name='order_customer', on_delete=models.SET_DEFAULT, default=None)


class Post(BaseModel):
    product_name = models.CharField(max_length=100, null=False)
    product_img = models.FileField(upload_to='delivery-system-image', null=False)
    from_address = models.CharField(max_length=150, null=False)
    to_address = models.CharField(max_length=150, null=False)
    description = models.CharField(max_length=255, null=True)
    discount = models.ForeignKey(Discount, related_name='order_discount', on_delete=models.SET_DEFAULT, default=None)
    customer = models.ForeignKey(Customer, related_name='posts_customer', on_delete=models.CASCADE)

    def __str__(self):
        return self.product_name

    def img(self):
        return mark_safe('<img src="{}" width="100" alt="product_img"/>'.format(self.product_img.url))


class Auction(BaseModel):
    content = models.CharField(max_length=525)
    price = models.FloatField(default=0, null=False)
    delivery = models.ForeignKey(Shipper, related_name='auctions_delivery', on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='auctions_post', on_delete=models.CASCADE)
    had_accept = models.BooleanField(default=False)

    class Meta:
        unique_together = ('delivery', 'post')


class Comment(BaseModel):
    content = models.TextField(max_length=525)
    shipper = models.ForeignKey(Shipper, related_name="comments_shipper", on_delete=models.CASCADE)
    creator = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="comments_creator")

    def __str__(self):
        return self.content


class Rating(BaseModel):
    rate = models.PositiveSmallIntegerField(default=0)
    shipper = models.ForeignKey(Shipper, related_name="rating", on_delete=models.CASCADE)
    creator = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="rating_creator")

    def __str__(self):
        return self.rate

    class Meta:
        unique_together = ('creator', 'shipper')

# Generated by Django 4.2 on 2023-05-06 06:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('delivery', '0003_order_customer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status_order',
            field=models.CharField(choices=[('CANCEL', 'CANCEL'), ('CONFIRM', 'CONFIRM'), ('DELIVERING', 'DELIVERING'), ('RECEIVED', 'RECEIVED')], default='CONFIRM', max_length=12),
        ),
    ]
# Generated by Django 5.0.4 on 2024-10-28 22:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("logs", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="eventlog",
            name="object_id",
            field=models.CharField(),
        ),
    ]

# Generated by Django 5.0.4 on 2025-06-09 13:08

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("file_transfer", "0005_remove_filereference_fleeting_note"),
    ]

    operations = [
        migrations.AddField(
            model_name="filereference",
            name="timestamp",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]

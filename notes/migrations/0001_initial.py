# Generated by Django 5.0.4 on 2024-07-03 15:26

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("entries", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArchivedNote",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("content", models.CharField()),
                ("timestamp", models.DateTimeField()),
                ("publishable", models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name="Note",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("content", models.CharField()),
                ("publishable", models.BooleanField(default=False)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("entries", models.ManyToManyField(to="entries.entry")),
            ],
        ),
    ]

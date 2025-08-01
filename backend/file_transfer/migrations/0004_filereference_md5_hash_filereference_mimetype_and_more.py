# Generated by Django 5.0.4 on 2025-05-05 18:10

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("file_transfer", "0003_filereference_digest_filereference_report"),
    ]

    operations = [
        migrations.AddField(
            model_name="filereference",
            name="md5_hash",
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
        migrations.AddField(
            model_name="filereference",
            name="mimetype",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="filereference",
            name="sha1_hash",
            field=models.CharField(blank=True, max_length=40, null=True),
        ),
        migrations.AddField(
            model_name="filereference",
            name="sha256_hash",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]

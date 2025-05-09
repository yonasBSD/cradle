# Generated by Django 5.0.4 on 2024-11-29 18:03

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0005_alter_cradleuser_catalyst_api_key_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="cradleuser",
            name="email_confirmation_token",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="cradleuser",
            name="email_confirmation_token_expiry",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="cradleuser",
            name="email_confirmed",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="cradleuser",
            name="password_reset_token",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="cradleuser",
            name="password_reset_token_expiration",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="cradleuser",
            name="is_active",
            field=models.BooleanField(default=False),
        ),
    ]

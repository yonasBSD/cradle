# Generated by Django 5.0.4 on 2025-06-02 11:17

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("intelio", "0012_catalystmapping_link_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="catalystmapping",
            name="level",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]

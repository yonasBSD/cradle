# Generated by Django 5.0.4 on 2025-04-10 19:25

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0047_alter_relation_reason"),
    ]

    operations = [
        migrations.AlterField(
            model_name="relation",
            name="reason",
            field=models.CharField(
                choices=[
                    ("digest", "Digest"),
                    ("enrichment", "Enrichment"),
                    ("contains", "Contains"),
                    ("alias", "Alias"),
                    ("encounter", "Encounter"),
                    ("note", "Note"),
                ],
                max_length=255,
            ),
        ),
    ]

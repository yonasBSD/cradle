# Generated by Django 5.0.4 on 2025-03-29 20:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0030_edge_alter_entry_options_alter_relation_options_and_more"),
        ("intelio", "0004_association_details_alter_falconmapping_type"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="basedigest",
            name="entity",
        ),
        migrations.AddField(
            model_name="basedigest",
            name="entities",
            field=models.ManyToManyField(
                related_name="owned_relations", to="entries.entry"
            ),
        ),
        migrations.DeleteModel(
            name="Association",
        ),
    ]

# Generated by Django 5.0.4 on 2025-04-02 08:53

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0042_remove_entry_aliases"),
    ]

    operations = [
        migrations.AddField(
            model_name="entry",
            name="aliases",
            field=models.ManyToManyField(
                blank=True,
                help_text="Entries that are equivalent to this one",
                related_name="aliased_by",
                to="entries.entry",
            ),
        ),
    ]

# Generated by Django 5.0.4 on 2025-03-24 22:10

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0023_relation_relation_unique_src_dst_object"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="entryclass",
            name="catalyst_type",
        ),
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
        migrations.AddField(
            model_name="entry",
            name="related_entries",
            field=models.ManyToManyField(
                through="entries.Relation", to="entries.entry"
            ),
        ),
        migrations.AddField(
            model_name="entryclass",
            name="children",
            field=models.ManyToManyField(
                blank=True,
                help_text="Possible children of this entry class",
                related_name="parents",
                to="entries.entryclass",
            ),
        ),
        migrations.AddField(
            model_name="relation",
            name="created_at",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]

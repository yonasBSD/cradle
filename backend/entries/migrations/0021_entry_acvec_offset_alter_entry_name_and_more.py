# Generated by Django 5.0.4 on 2025-03-07 21:48

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0020_entryclass_generative_regex"),
    ]

    operations = [
        migrations.AddField(
            model_name="entry",
            name="acvec_offset",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="entry",
            name="name",
            field=models.CharField(max_length=255),
        ),
        migrations.AddConstraint(
            model_name="entry",
            constraint=models.UniqueConstraint(
                condition=models.Q(("acvec_offset", 0), _negated=True),
                fields=("acvec_offset",),
                name="unique_non_zero_acvec_offset",
            ),
        ),
    ]

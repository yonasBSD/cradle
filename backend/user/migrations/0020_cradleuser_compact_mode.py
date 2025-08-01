# Generated by Django 5.0.4 on 2025-07-17 10:53

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0019_cradleuser_default_note_template_cradleuser_vim_mode"),
    ]

    operations = [
        migrations.AddField(
            model_name="cradleuser",
            name="compact_mode",
            field=models.BooleanField(
                default=False, help_text="Whether to use compact mode in the UI"
            ),
        ),
    ]

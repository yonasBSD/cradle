# Generated by Django 5.0.4 on 2025-05-19 14:52

from django.db import migrations, models


def set_format_based_on_fields(apps, schema_editor):
    EntryClass = apps.get_model("entries", "EntryClass")
    for entry_class in EntryClass.objects.all():
        if entry_class.regex:
            entry_class.format = "regex"
        elif entry_class.options:
            entry_class.format = "options"
        else:
            entry_class.format = None
        entry_class.save()


class Migration(migrations.Migration):
    dependencies = [
        ("entries", "0051_delete_entryaccessvectors"),
    ]

    operations = [
        migrations.AddField(
            model_name="entryclass",
            name="format",
            field=models.CharField(
                choices=[("regex", "Regex"), ("options", "Options")],
                default=None,
                max_length=20,
                null=True,
            ),
        ),
        migrations.RunPython(
            set_format_based_on_fields, reverse_code=migrations.RunPython.noop
        ),
    ]

# Generated by Django 5.0.4 on 2025-03-24 21:56

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("publish", "0007_alter_publishedreport_options_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="publishedreport",
            name="report_location",
        ),
    ]

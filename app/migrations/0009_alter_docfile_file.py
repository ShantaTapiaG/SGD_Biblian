# Generated by Django 4.2.17 on 2025-03-04 01:44

import app.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_alter_docfile_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='docfile',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to=app.models.unique_filename, verbose_name='Archivo PDF'),
        ),
    ]

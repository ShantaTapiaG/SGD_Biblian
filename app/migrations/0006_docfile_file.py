# Generated by Django 4.2.17 on 2025-03-04 01:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_alter_docfile_options_alter_filetype_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='docfile',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='documents/pdfs/', verbose_name='Archivo PDF'),
        ),
    ]

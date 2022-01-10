# Generated by Django 4.0 on 2021-12-26 16:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_serverdata_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='serverdata',
            name='max_workers',
            field=models.IntegerField(default=2),
        ),
        migrations.AlterField(
            model_name='serverdata',
            name='group_name',
            field=models.CharField(default='', max_length=25, unique=True),
        ),
        migrations.CreateModel(
            name='Training',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_alpha', models.CharField(default='', max_length=200)),
                ('start_beta', models.CharField(default='', max_length=200)),
                ('end_alpha', models.CharField(default='', max_length=200)),
                ('end_beta', models.CharField(default='', max_length=200)),
                ('workers_participated', models.IntegerField(default=2)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('server', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.serverdata')),
            ],
        ),
    ]
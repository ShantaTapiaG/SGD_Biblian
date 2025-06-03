from django.contrib import admin
from django.contrib.auth.models import Permission
from .models import Municipality, Section, FileType, DocFile, Subsection, Box, DocumentalSerie, DocumentalSubserie, EducationDegree, Manager

admin.site.register(Permission)
admin.site.site_header = 'GAD Municipal del Cantón Biblián'
admin.site.site_title = 'Sistema de Gestión de Archivos'
admin.site.index_title = 'Panel de Control Principal'

@admin.register(Municipality)
class MunicipalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'description')
    search_fields = ('name', 'description', 'address')
    list_per_page = 10

@admin.register(FileType)
class FileTypeAdmin(admin.ModelAdmin):
    list_display = ('type',)
    search_fields = ('type',)
    list_per_page = 10

@admin.register(DocFile)
class DocFileAdmin(admin.ModelAdmin):
    # Método que devuelve la concatenación de 'abrevitura' y 'first_name'
    search_fields = [
        'name', 
        'description', 
        'type__type', 
        'box__number', 
        'box__section__name',
        'box__section__manager__first_name',
        'box__section__manager__education_degree__name',
        'box__section__manager__education_degree__abbreviation',
    ]
    list_display = ('name', 'type', 'description', 'box',)
    list_per_page = 10

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = (
        'first_name', 
        'last_name', 
        'email', 
        'phone', 
        'address', 
        'education_degree', 
        'created_at'
    )
    search_fields = (
        'first_name', 
        'last_name', 
        'email', 
        'phone', 
        'address', 
        'education_degree__name', 
        'education_degree__abbreviation'
    )
    list_per_page = 10

@admin.register(EducationDegree)
class EducationDegreeAdmin(admin.ModelAdmin):
    list_display = ('name', 'abbreviation')
    search_fields = ('name', 'abbreviation')
    list_per_page = 10

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'manager',
        'description', 
        'municipality', 
        'created_at', 
        'updated_at'
    )
    search_fields = (
        'name', 
        'description', 
        'municipality__name', 
        'manager__first_name',
        'manager__education_degree__name',
        'manager__education_degree__abbreviation',
        'created_at', 
        'updated_at',
    )
    list_per_page = 10

@admin.register(Subsection)
class SubsectionAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'manager',
        'description', 
        'section', 
        'created_at', 
        'updated_at'
    )
    search_fields = (
        'name', 
        'manager', 
        'description', 
        'section__name', 
        'created_at', 
        'updated_at'
    )
    list_per_page = 10

@admin.register(DocumentalSerie)
class DocumentalSerieAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    list_per_page = 10

@admin.register(DocumentalSubserie)
class DocumentalSubserieAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    list_per_page = 10

from django import forms

class BoxForm(forms.ModelForm):
    class Meta:
        model = Box
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(BoxForm, self).__init__(*args, **kwargs)
        self.fields['serie'].widget = forms.SelectMultiple()
        self.fields['subserie'].widget = forms.SelectMultiple()

@admin.register(Box)
class BoxAdmin(admin.ModelAdmin):
    list_display = (
        'number', 'section', 'subsection',
        'serie_display', 'subserie_display',
        'initial_date', 'final_date', 'file_number',
        'created_at', 'updated_at'
    )
    search_fields = (
        'number', 'section__name', 'subsection__name',
        'serie__name', 'subserie__name',
        'initial_date', 'final_date', 'file_number',
        'created_at', 'updated_at'
    )
    list_per_page = 10

    def serie_display(self, obj):
        return ", ".join(serie.name for serie in obj.serie.all())

    serie_display.short_description = 'Series'

    def subserie_display(self, obj):
        return ", ".join(subserie.name for subserie in obj.subserie.all())

    subserie_display.short_description = 'Subseries'

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "serie":
            kwargs['widget'] = forms.CheckboxSelectMultiple()
        elif db_field.name == "subserie":
            kwargs['widget'] = forms.CheckboxSelectMultiple()
        return super().formfield_for_manytomany(db_field, request, **kwargs)
    
    


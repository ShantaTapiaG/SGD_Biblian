from django.db import models # type: ignore
import datetime

class Municipality(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre del Municipio", null=False, blank=False)
    address = models.CharField(max_length=250, verbose_name="Dirección", null=True, blank=True)
    description = models.TextField(verbose_name="Descripción", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")

    class Meta:
        verbose_name = "Municipio"
        verbose_name_plural = "Municipios"

    def __str__(self):
        return self.name
    
class EducationDegree(models.Model):
    name = models.CharField(max_length=100, verbose_name="Grado de Educación")
    abbreviation = models.CharField(max_length=10, verbose_name="Siglas", unique=True)

    class Meta:
        verbose_name = "Título"
        verbose_name_plural = "Títulos"

    def __str__(self):
        return self.name
    
class Manager(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="Nombre")
    last_name = models.CharField(max_length=100, verbose_name="Apellido")
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=15, null=True, blank=True, verbose_name="Teléfono")
    address = models.TextField(null=True, blank=True, verbose_name="Dirección")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Agregado")
    education_degree = models.ForeignKey(
        EducationDegree, 
        on_delete=models.RESTRICT, 
        related_name="managers",
        verbose_name="Educación"
    )

    class Meta:
        verbose_name = "Encargado"
        verbose_name_plural = "Encargados"

    def __str__(self):
        return f"{self.education_degree.abbreviation} {self.first_name} {self.last_name}"

class Section(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre", unique=True)
    description = models.TextField(verbose_name="Descripción", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")
    municipality = models.ForeignKey(
        Municipality,
        on_delete=models.RESTRICT,
        related_name="sections",
        verbose_name="Municipio"
    )
    manager = models.ForeignKey(
        Manager,
        on_delete=models.RESTRICT,
        related_name="sections",
        verbose_name="Encargado"
    )

    class Meta:
        verbose_name = "Sección"
        verbose_name_plural = "Secciones"

    def __str__(self):
        return f"{self.name} - {self.municipality.name}"
    
class Subsection(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(verbose_name="Descripción", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")
    section = models.ForeignKey(
        Section,
        on_delete=models.RESTRICT,
        related_name="subsections",
        verbose_name="Sección"
    )
    manager = models.ForeignKey(
        Manager,
        on_delete=models.RESTRICT,
        related_name="subsections",
        verbose_name="Responsable"
    )

    class Meta:
        verbose_name = "Subsección"
        verbose_name_plural = "Subsecciones"

    def __str__(self):
        return f"{self.name} - {self.section.name}"
    
class DocumentalSerie(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre", unique=True)
    description = models.TextField(verbose_name="Descripción", null=True, blank=True)
    class Meta:
        verbose_name = "Serie Documental"
        verbose_name_plural = "Series Documentales"

    def __str__(self):
        return f"{self.name}"
    
class DocumentalSubserie(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre", unique=True)
    description = models.TextField(verbose_name="Descripción", null=True, blank=True)
    class Meta:
        verbose_name = "Subserie Documental"
        verbose_name_plural = "Subseries Documentales"

    def __str__(self):
        return f"{self.name}"
    
class Box(models.Model):
    number = models.IntegerField(verbose_name="Número", null=False, blank=False)
    section = models.ForeignKey(
        Section,
        on_delete=models.RESTRICT,
        related_name="boxes",  # Relación inversa para acceder a cajas desde una sección
        verbose_name="Sección"
    )
    subsection = models.ForeignKey(
        Subsection,
        on_delete=models.RESTRICT,
        related_name="boxes",  # Relación inversa para acceder a cajas desde una subsección
        verbose_name="Subsección"
    )
    serie = models.ManyToManyField(
        DocumentalSerie,
        related_name="boxes",  # Relación inversa para acceder a cajas desde una serie documental
        verbose_name="Serie Documental"
    )
    subserie = models.ManyToManyField(
        DocumentalSubserie,
        related_name="boxes",  # Relación inversa para acceder a cajas desde una subserie documental
        verbose_name="Subserie Documental"
    )
    file_number = models.IntegerField(verbose_name="Número de Expediente", null=False, blank=False)
    initial_date = models.DateField(verbose_name="Fecha Inicio", null=False, blank=False)
    final_date = models.DateField(verbose_name="Fecha Fin", null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")

    class Meta:
        verbose_name = "Caja"
        verbose_name_plural = "Cajas"

    def __str__(self):
        manager = self.section.manager.education_degree.abbreviation + " " + self.section.manager.first_name + " " + self.section.manager.last_name
        return f"SECCIÓN: {self.section.name}  ADMIN: {manager}  SUBSECCIÓN: {self.subsection.name}  CAJA N°:{self.number}"
    
class FileType(models.Model):
    type = models.CharField(max_length=100, verbose_name="Tipo", unique=True)
    class Meta:
        verbose_name = "Tipo archivos"
        verbose_name_plural = "Tipos archivos"
    def __str__(self):
        return f"{self.type}"
    

#Creamos una función que le genere un nombre unico y no haya conflicto de nombres
import os
import uuid
def unique_filename(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('documents/pdfs/', new_filename)
    
class DocFile(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre", unique=True)
    type = models.ForeignKey(FileType, on_delete=models.RESTRICT, verbose_name="Tipo archivo")
    description = models.TextField(verbose_name="Descripción", default='No hay descripción', null=False, blank=False)
    box = models.ForeignKey(Box,on_delete=models.RESTRICT, verbose_name="Caja")
    file = models.FileField(upload_to=unique_filename, verbose_name="Archivo PDF", null=True, blank=True)
    created_date = models.DateField(verbose_name="Fecha de elaboración", default=datetime.date.today,  blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")
    class Meta:
        verbose_name = "Archivo"
        verbose_name_plural = "Archivos"
    def __str__(self):
        return f"{self.name} - {self.type.type}"

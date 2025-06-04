from app.models import Box
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserChangeForm

def is_integer(valor):
  try:
      int(valor)
      return True
  except ValueError:
      return False

""" # Se realizan adapaciones en los datos de las cajas para mostrar en la tabla
def updateBox(box):
  # Obtenemos el id de cada caja
  box_id = box["id"]
  # Obtener la instancia real de Box
  box_obj = Box.objects.get(id=box_id)  

  # Obtener nombres de series y subseries como listas de strings
  series = ", ".join(box_obj.serie.values_list("name", flat=True)) or "Sin Serie"
  subseries = ", ".join(box_obj.subserie.values_list("name", flat=True)) or "Sin Subserie"

  # Formatear fechas
  box["created_at"] = box["created_at"].strftime("%Y-%m-%d %H:%M:%S") if box["created_at"] else None
  box["updated_at"] = box["updated_at"].strftime("%Y-%m-%d %H:%M:%S") if box["updated_at"] else None

  # Reemplazar el ID de la sección con su nombre
  box["section"] = box_obj.section.name if box_obj.section else "Sin Sección"
  # Remover el ID de la sección
  del box["section_id"]

  # Reemplazar el ID de la sección con su nombre
  box["subsection"] = box_obj.subsection.name if box_obj.section else "Sin Sección"
  # Remover el ID de la subsección
  del box["subsection_id"]

  # Agregar al diccionario de la caja
  box["series"] = series
  box["subseries"] = subseries """

def updateBox(box):
  """ Modifica el diccionario de una caja antes de enviarlo a la plantilla """
  if isinstance(box, Box):  
    # Si `box` es un objeto Django, lo convertimos en diccionario
    box_dict = {
      "id": box.id,
      "number": box.number,
      "section": box.section.name if box.section else "Sin Sección",
      "subsection": box.subsection.name if box.subsection else "Sin Subsección",
      "file_number": box.file_number,
      "initial_date": box.initial_date.strftime("%Y-%m-%d") if box.initial_date else None,
      "final_date": box.final_date.strftime("%Y-%m-%d") if box.final_date else None,
      "created_at": box.created_at.strftime("%Y-%m-%d %H:%M:%S") if box.created_at else None,
      "updated_at": box.updated_at.strftime("%Y-%m-%d %H:%M:%S") if box.updated_at else None,
      "series": ", ".join(box.serie.values_list("name", flat=True)) or "Sin Serie",
      "subseries": ", ".join(box.subserie.values_list("name", flat=True)) or "Sin Subserie",
    }
  else:
    # Si `box` ya es un diccionario
    box_obj = Box.objects.get(id=box["id"])
    
    box["created_at"] = box["created_at"].strftime("%Y-%m-%d %H:%M:%S") if box["created_at"] else None
    box["updated_at"] = box["updated_at"].strftime("%Y-%m-%d %H:%M:%S") if box["updated_at"] else None
    box["section"] = box_obj.section.name if box_obj.section else "Sin Sección"
    box["subsection"] = box_obj.subsection.name if box_obj.subsection else "Sin Subsección"
    box["series"] = ", ".join(box_obj.serie.values_list("name", flat=True)) or "Sin Serie"
    box["subseries"] = ", ".join(box_obj.subserie.values_list("name", flat=True)) or "Sin Subserie"

    # Eliminar los IDs innecesarios
    box.pop("section_id", None)
    box.pop("subsection_id", None)

    box_dict = box
  return box_dict


class CustomUserChangeForm(UserChangeForm):
  class Meta:
      model = User
      fields = ['username', 'email', 'first_name', 'last_name']  # Excluir date_joined

  def __init__(self, *args, **kwargs):
      super().__init__(*args, **kwargs)
      # Excluir el campo 'date_joined' del formulario
      if 'date_joined' in self.fields:
          del self.fields['date_joined']
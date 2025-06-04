from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.db.models.deletion import RestrictedError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from app.resources.methods import is_integer, updateBox, CustomUserChangeForm
from app.models import Box, DocumentalSerie, Section, FileType, Subsection, DocFile, DocumentalSubserie, Manager
from django.http import HttpResponseForbidden, FileResponse
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import update_session_auth_hash
import os
import json
import uuid
from django.db.models import Q
from django.conf import settings
from django.core.files.storage import default_storage

def protected_media_view(request, file_info):
    # Verifica si el usuario está autenticado
    if not request.user.is_authenticated:
        return render(request, 'access_denied.html')
    
    # Validar que el archivo tenga la extensión .pdf
    if not file_info.endswith('.pdf'):
        return render(request, 'file_not_found.html', {'error':'El archivo debe ser un PDF.'})
    
    # Extraer el UUID del nombre del archivo (sin la extensión .pdf)
    file_name = file_info[:-4]  # Elimina '.pdf' de la cadena
    try:
        # Verificar si el nombre del archivo es un UUID válido
        file_uuid = uuid.UUID(file_name)
    except ValueError:
        return render(request, 'file_not_found.html', {'error':f'El archivo: {file_name} no es un UUID válido.'})
    
    # Construir la ruta completa al archivo
    file_path = os.path.join(settings.MEDIA_ROOT, 'documents/pdfs', file_info)

    # Verificar si el archivo existe
    if not os.path.exists(file_path):
        return render(request, 'file_not_found.html', {'error':f'El archivo: {file_info} no fue encontrado'})
    
    # Intentar abrir y servir el archivo
    try:
        response = FileResponse(open(file_path, 'rb'))
        return response
    except FileNotFoundError:
        return HttpResponseForbidden("Archivo no encontrado.")

def home(request):
    return HttpResponse("¡Hola, mundo desde Django!")

def login_view(request):
    if request.method == 'POST':
        request._messages = request._messages.__class__(request)
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            if user.has_perm('auth.can_load'): 
                return redirect('home_data') 
            else:
                messages.error(request, 'No tienes los permisos necesarios para acceder.')
        else:
            messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})

@login_required
def load_files(request):
  user = {
      "username": request.user.username
    } 
  return render(request,'home.html', user)

@login_required
def logout_user(request):
    logout(request)
    return redirect('login')

@login_required
def user_data(request):
    # Crear un formulario vacío con los datos actuales del usuario para la solicitud GET
    if request.method == "GET":
        form = CustomUserChangeForm(instance=request.user)
        return render(request, "user.html", {"form": form})

    if request.method == "POST":
        try:
            # Crear un formulario con los datos del POST
            form = CustomUserChangeForm(request.POST, instance=request.user)
            
            # Verificar si se envió una nueva contraseña
            new_password = request.POST.get('password', '').strip()  # Usar strip para eliminar espacios vacíos

            if new_password:  # Si se envió una nueva contraseña
                if form.is_valid():
                    # Actualizar el usuario con los nuevos campos
                    form.save()
                    # Actualizar la contraseña
                    request.user.set_password(new_password)
                    request.user.save()
                    # Mantener la sesión activa
                    update_session_auth_hash(request, request.user)
                    messages.success(request, 'Tu contraseña y/o datos se han actualizado correctamente.')
                    return redirect("user_data")
                else:
                    # Si el formulario tiene errores, no actualizar nada
                    messages.error(request, 'Por favor, corrige los errores en el formulario.')
            else:
                # Si la contraseña está vacía, solo actualizamos los otros campos
                if form.is_valid():
                    form.save()
                    messages.success(request, 'Tus datos se han actualizado correctamente.')
                    return redirect("user_data")
                else:
                    messages.error(request, 'Por favor, corrige los errores en el formulario.')
        except Exception as e:
            messages.error(request, f"Error al actualizar: {e}") 
    errors = {field: form.errors.get(field) for field in form.errors}
    print(errors)
    # Pasar el formulario al contexto si se envió una solicitud POST
    return render(request, "user.html", {"form": form})

@login_required
def boxes(request):
    return render(request, "boxes.html")

@login_required
def boxes_files(request, box_id):
    if request.method == "GET":
        if not is_integer(box_id):
            return render(request, "404.html", status=404)

        # Obtenemos el objeto
        box = get_object_or_404(Box, id=int(box_id))
        # Si necesitas modificar algo en la caja antes de enviarla, hazlo aquí
        box = updateBox(box)
        return render(request, "boxes_files.html", {"box": box})

@login_required
def get_all_boxes(request):
    if request.method == 'GET':
        boxes = list(Box.objects.values())  
        # Agregar series y subseries manualmente
        for box in boxes:
            # Modificamos la consulta para recuperar solo los datos que deseamos
            updateBox(box)          
        return JsonResponse(boxes, safe=False)
    return render(request, "404.html", status=404)

@login_required
def get_box_by_id(request, box_id):
    if request.method == 'POST':
        try:
            # Recuperamos la caja por su ID
            box = Box.objects.get(id=box_id)
            
            # Modificamos la caja si es necesario
            box_data = {
                "id": box.id,
                "number": box.number,
                "section": box.section.id if box.section else "" ,
                "subsection": box.subsection.id if box.subsection else "",
                "file_number": box.file_number,
                "initial_date": box.initial_date.strftime("%Y-%m-%d") if box.initial_date else None,
                "final_date": box.final_date.strftime("%Y-%m-%d") if box.final_date else None,
                "created_at": box.created_at.strftime("%Y-%m-%d %H:%M:%S") if box.created_at else None,
                "updated_at": box.updated_at.strftime("%Y-%m-%d %H:%M:%S") if box.updated_at else None,
                "series": [{"id": serie.id, "name": serie.name} for serie in box.serie.all()],
                "subseries": [{"id": subserie.id, "name": subserie.name} for subserie in box.subserie.all()],
            }
            # Devolvemos los datos de la caja como JSON
            return JsonResponse(box_data, safe=False)
        except Box.DoesNotExist:
            return JsonResponse({'error': 'Caja no encontrada'}, status=404)

    return render(request, "404.html", status=404)

@login_required
def update_box(request, box_id):
    # Recuperamos la caja por su ID
    if request.method == 'POST':
        try:
            # Recuperamos la caja por su ID
            box = get_object_or_404(Box, id=box_id)
            data = json.loads(request.body.decode('utf-8'))
            box_number = data['number']
            section_id = data['section']  # ID de la sección
            subsection_id = data['subsection']  # ID de la subsección
            series_ids = data['series']  # IDs de las series seleccionadas
            subseries_ids = data['subseries']  # IDs de las subseries seleccionadas
            file_number = data['file_number']
            initial_date = data['initial_date']
            final_date = data['final_date']

            # Actualizamos los campos de la caja
            box.number = box_number
            box.section = Section.objects.get(id=section_id) if section_id else box.section
            box.subsection = Subsection.objects.get(id=subsection_id) if subsection_id else box.subsection
            box.file_number = file_number if file_number else box.file_number
            box.initial_date = initial_date if initial_date else box.initial_date
            box.final_date = final_date if final_date else box.final_date
            
            # Actualizamos las relaciones ManyToMany
            box.serie.set(DocumentalSerie.objects.filter(id__in=series_ids))  # Asignar las series
            box.subserie.set(DocumentalSubserie.objects.filter(id__in=subseries_ids))  # Asignar las subseries
            # Guardamos los cambios en la caja
            box.save()
            # Devuelvo una respuesta JSON para indicar que la actualización fue exitosa
            return JsonResponse({"response": True, "message": "Caja actualizada correctamente" }, safe=False)
        except Exception as e:
            print(e)
            return JsonResponse({"error": e}, safe=True)


@login_required
def countRegisters(request):
    if request.method == 'GET':
        total_boxes = Box.objects.count()  # Cuenta todas las cajas
        total_doc_series =DocumentalSerie.objects.count()
        total_sections =Section.objects.count()
        total_subsections =Subsection.objects.count()
        total_doc_subseries =DocumentalSubserie.objects.count()
        total_files = DocFile.objects.count()
        data = {
            "boxes": total_boxes,
            "series": total_doc_series,
            "sections": total_sections,
            "subsections": total_subsections,
            "subseries": total_doc_subseries,
            "files": total_files
        }
        return JsonResponse(data)
    return render(request, "404.html", status=404)

@login_required
def get_all_files(request, box_id):
    if request.method == 'GET':
        files = DocFile.objects.filter(box_id=box_id)
        data = []
        for file in files:
            data.append({
                "id": file.id,
                "name": file.name,
                "type": file.type.type,
                "description": file.description, 
                "filename": file.file.name,
                "created": file.created_date
            })
        return JsonResponse(data, safe=False)
    
@login_required
def get_all_types(request):
    if request.method == 'GET':
        types = list(FileType.objects.values())
        return JsonResponse(types, safe=False)

@login_required
def get_data_new_box(request):
      if request.method == 'GET':
        data = {
        "sections": list(Section.objects.values()),
        "series": list(DocumentalSerie.objects.values()),
        "subseries": list(DocumentalSubserie.objects.values())
        }

        return JsonResponse(data, safe=False)

# Obtener las subsecciones por id      
@login_required
def get_subsections_by_id(request, section_id):
    if request.method == 'GET':
        section = get_object_or_404(Section, id=section_id)
        subsections = Subsection.objects.filter(section=section).values()
        return JsonResponse(list(subsections), safe=False)
    
# Obtener las series y subseries documentales
@login_required
def get_series_and_subseries(request):
    if request.method == 'GET':
        data = {
            "series": DocumentalSerie.objects.values(),
            "subseries": DocumentalSubserie.objects.values()
        }
        return JsonResponse(data, safe=False)


def not_found(request):
    return render(request, "404.html", status=404)

# Vista para crear una caja
@login_required
def create_box(request):
    if request.method == 'POST':
        form = json.loads(request.body)
        print(form)
        try:
            number = form.get('number')
            section_id = form.get('section')
            subsection_id = form.get('subsection')
            serie_ids = form.get('series')
            subserie_ids = form.get('subseries')
            file_number = form.get('file_number')
            initial_date = form.get('initial_date')
            final_date = form.get('final_date')

            if not all([number, section_id, subsection_id, file_number, initial_date, final_date]):
                return HttpResponseForbidden("Faltan datos requeridos.")

            # Crear una nueva caja
            box = Box(
                number=number,
                section_id=section_id,
                subsection_id=subsection_id,
                file_number=file_number,
                initial_date=initial_date,
                final_date=final_date
            )
            # Guardar la caja
            box.save()

            # Agregar las relaciones ManyToMany
            box.serie.set(serie_ids)
            box.subserie.set(subserie_ids)

            # Cambiar por retornar mensaje de confirmacion
            return JsonResponse({"response" : True, "message": "Caja creada correctamente"}, safe=False)
        except Exception as e:
            return JsonResponse({"response" : False, "message": e}, safe=False)
    
    return HttpResponseForbidden("Only POST method")


# Vista para editar la caja
@login_required
def delete_box(request, box_id):
    if request.method == "POST":
        try:
            box = Box.objects.get(id=box_id)
            box.delete()
            print('se ejecuta')
            return JsonResponse({"response": True, "message": "Caja eliminada exitosamente"})
        except Box.DoesNotExist:
            return JsonResponse({"error": "Caja no encontrada"})
        except RestrictedError as e:
            return JsonResponse({"error": "No se puede eliminar la caja porque tiene referencias en otros registros."})
        except Exception as e:
            return JsonResponse({"error": f"Error inesperado: {str(e)}"})
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)
    
@login_required
def save_docfile(request):
    if request.method == "POST":
        try:
            # Extraer los datos del formulario
            name = request.POST.get("name")
            file_type_id = request.POST.get("file-types")
            description = request.POST.get("description")
            created_date = request.POST.get("created-date")
            box_id = request.POST.get("box-id") 
            pdf_file = request.FILES.get("file-upload")
            # Verificar que los campos obligatorios no estén vacíos
            if not name or not file_type_id or not box_id or not created_date:
                return JsonResponse({"error": "Faltan datos obligatorios"})

            # Validar si el nombre ya existe
            if DocFile.objects.filter(name__iexact=name).exists():
                return JsonResponse({"error": "Ya existe un archivo con ese nombre"})

            # Obtener las instancias de FileType y Box
            try:
                file_type = FileType.objects.get(id=file_type_id)
                box = Box.objects.get(id=box_id)
            except (FileType.DoesNotExist, Box.DoesNotExist):
                return JsonResponse({"error": "El tipo de archivo o la caja no existen"})

            # Guardar en la base de datos
            DocFile.objects.create(
                name=name,
                type=file_type,
                description=description,
                box=box,
                created_date=created_date,
                file=pdf_file  # Puede ser None si no se envió un archivo
            )

            return JsonResponse({
                "response": True,
                "message": "Archivo guardado correctamente",
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)

@login_required
def delete_file(request, file_id):
    if request.method == 'POST':
        try:
            # Obtener el archivo a través de su ID
            file_to_delete = get_object_or_404(DocFile, id=file_id)
            
            # Eliminar el archivo físico si existe
            if file_to_delete.file:
                file_to_delete.file.delete()

            # Eliminar el registro de la base de datos
            file_to_delete.delete()

            return JsonResponse({
                "response": True,
                "message": "Archivo eliminado correctamente",
            }, status=200)
        
        except Exception as e:
            print(e)
            return JsonResponse({
                "error": str(e),
            })
@login_required
def get_docfile_by_id(request, file_id):
    if request.method == 'POST':
        try:
            # Obtener el archivo a través de su ID
            doc_file = get_object_or_404(DocFile, id=file_id)

            # Retornar los datos del archivo como JSON
            return JsonResponse({
                "name": doc_file.name,
                "type": doc_file.type.id,  # Suponiendo que 'type' es una relación con FileType
                "description": doc_file.description,
                "created": doc_file.created_date,
                "file_url": doc_file.file.url if doc_file.file else None,  # URL del archivo si existe
            }, status=200)
        
        except DocFile.DoesNotExist:
            return JsonResponse({"error": "El archivo con ese ID no existe"})
        
@login_required
def update_docfile(request, file_id):
    if request.method == "POST":
        try:
            # Obtener la instancia del documento
            docfile = get_object_or_404(DocFile, id=file_id)

            # Extraer los datos del formulario
            name = request.POST.get("name", "").strip()
            file_type_id = request.POST.get("file-types")
            description = request.POST.get("description")
            box_id = request.POST.get("box-id")
            created_date = request.POST.get("created-date")
            file = request.FILES.get("file-upload")  # Puede ser None si no se envió

            # Validar si el nombre ya existe en otro archivo
            if DocFile.objects.filter(name__iexact=name).exclude(id=file_id).exists():
                return JsonResponse({"error": "Ya existe un archivo con ese nombre"})

            # Obtener las instancias de FileType y Box si fueron proporcionadas
            if file_type_id:
                try:
                    docfile.type = FileType.objects.get(id=file_type_id)
                except FileType.DoesNotExist:
                    return JsonResponse({"error": "El tipo de archivo no existe"})

            if box_id:
                try:
                    docfile.box = Box.objects.get(id=box_id)
                except Box.DoesNotExist:
                    return JsonResponse({"error": "La caja no existe"})

            # Actualizar los campos opcionales
            if name:
                docfile.name = name
            if description:
                docfile.description = description
            if created_date:
                docfile.created_date = created_date
            if file:  # Solo actualiza si se envió un nuevo archivo
                last_file = docfile.file
                docfile.file = file
            # Eliminar el archivo antiguo si existe y es diferente
                if last_file and last_file != docfile.file:
                    if default_storage.exists(last_file.path):
                        default_storage.delete(last_file.path)

            # Guardar los cambios
            docfile.save()

            return JsonResponse({
                "response": True,
                "message": "Archivo actualizado correctamente",
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)})

@login_required     
def get_docfile_details(request, file_id):
    if request.method == "GET":
        try:
            # Obtener el archivo junto con su caja relacionada
            docfile = get_object_or_404(DocFile, id=file_id)
            box = docfile.box  # Acceder a la caja relacionada
            # Obtener series documentales y subseries en una sola línea separada por comas
            series = ", ".join(box.serie.values_list("name", flat=True))
            subseries = ", ".join(box.subserie.values_list("name", flat=True))

            # Estructurar los datos para la respuesta
            data = {
                "docfile": {
                    "name": docfile.name,
                    "type": docfile.type.type,
                    "description": docfile.description,
                    "created_date": docfile.created_date.strftime("%Y-%m-%d")
                },
                "box": {
                    "number": box.number,
                    "section": box.section.name,
                    "subsection": box.subsection.name,
                    "series": series,
                    "subseries": subseries,
                    "file_number": box.file_number,
                    "initial date": box.initial_date,
                    "final date": box.final_date,
                }
            }

            return JsonResponse(data, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)})
        

@login_required
def search_document(request):
    try:
        if request.method == 'POST':
            # Recuperar los datos del formulario
            filename = request.POST.get('filename')
            file_type_id = request.POST.get('file-types')
            created_at = request.POST.get('created_at')
            description = request.POST.get('description')
            
            box_number = request.POST.get('box-number')
            section_id = request.POST.get('section')
            subsection_id = request.POST.get('subsection')
            initial_date = request.POST.get('initial_date')
            final_date = request.POST.get('final_date')

            # Inicializar la consulta con Q() vacía
            query = Q()

            # Buscar el texto correspondiente al file_type_id
            if file_type_id and file_type_id != '':
                try:
                    file_type = FileType.objects.get(id=file_type_id)
                    query &= Q(type=file_type)  # Agregar el filtro con el tipo de archivo
                except FileType.DoesNotExist:
                    file_type = None  # Si no se encuentra, no agregar el filtro

            # Buscar el texto correspondiente a la section
            if section_id and section_id != '':
                try:
                    section = Section.objects.get(id=section_id)
                    query &= Q(box__section=section)  # Agregar el filtro con la sección
                except Section.DoesNotExist:
                    section = None  # Si no se encuentra, no agregar el filtro

            # Buscar el texto correspondiente a la subsection
            if subsection_id and subsection_id != '':
                try:
                    subsection = Subsection.objects.get(id=subsection_id)
                    query &= Q(box__subsection=subsection)  # Agregar el filtro con la subsección
                except Subsection.DoesNotExist:
                    subsection = None  # Si no se encuentra, no agregar el filtro

            # Otros filtros de búsqueda, como se mostró antes
            if filename and filename != '':
                query &= Q(name__icontains=filename)
            if created_at and created_at != '':
                query &= Q(created_date__icontains=created_at)
            if description and description != '':
                query &= Q(description__icontains=description)
            if box_number and box_number != '':
                query &= Q(box__number=box_number)
            if initial_date and initial_date != '':
                query &= Q(box__initial_date__gte=initial_date)
            if final_date and final_date != '':
                query &= Q(box__final_date__lte=final_date)           # Realizar la consulta usando el filtro combinado
            results = DocFile.objects.filter(query)


            # Si no hay resultados, se puede devolver un mensaje personalizado
            if not results:
                return JsonResponse({'results': []})

            # Formatear los resultados para enviar como JSON
            data = []
            for result in results:
                data.append({
                    'id': result.id,
                    'filename': result.name,
                    "file_url": result.file.url if result.file else None,
                    'file_type': result.type.type,
                    'created_at': result.created_date,
                    'description': result.description,
                    'box_number': result.box.number,
                    'section': result.box.section.name,
                    'subsection': result.box.subsection.name,
                    'initial_date': result.box.initial_date,
                    'final_date': result.box.final_date,
                })

            # Enviar los resultados al cliente
            return JsonResponse({'results': data})

    except Exception as e:
        # En caso de que ocurra un error, devolver un mensaje de error
        return JsonResponse({'error': f'Hubo un problema al procesar la solicitud: {str(e)}'})

@login_required
def search(request):
   return render(request, 'search.html')
    

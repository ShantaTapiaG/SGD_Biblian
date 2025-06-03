from django.contrib import admin
from django.urls import path
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.login_view, name='login'),
    path('', views.login_view, name='login'),
    path('logout-user/', views.logout_user, name='logout_user'),
    path('gad/home', views.load_files, name='home_data'),
    path('gad/user', views.user_data, name='user_data'),
    path('gad/boxes', views.boxes, name='boxes_data'),
    path('gad/all-boxes', views.get_all_boxes, name='all_boxes'),
    path('gad/counter', views.countRegisters, name='counter'),
    path('gad/types', views.get_all_types, name='types'),
    path('gad/subsections/<int:section_id>', views.get_subsections_by_id, name='get_subsections_by_id'),
    path('gad/box-data-form', views.get_data_new_box, name='box_data_form'),
    path('gad/boxes/<int:box_id>', views.boxes_files, name='box_files'),
    path('gad/box/new', views.create_box, name='box_new'),
    path('gad/files/<int:box_id>', views.get_all_files, name='files'),
    path('gad/search-box/<int:box_id>', views.get_box_by_id, name='get_box_by_id'),
    path('gad/update-box/<int:box_id>', views.update_box, name='update_box'),
    path('gad/delete-box/<int:box_id>', views.delete_box, name='delete_box'),
    path('gad/docfile-new', views.save_docfile, name='docfile_new'),
    path('gad/docfile-delete/<int:file_id>', views.delete_file, name='docfile_delete'),
    path('gad/docfile-search/<int:file_id>', views.get_docfile_by_id, name='docfile_search'),
    path('gad/docfile-update/<int:file_id>', views.update_docfile, name='docfile_update'),
    path('gad/data-to-print/<int:file_id>', views.get_docfile_details, name='data_to_print'),
    path('gad/search', views.search, name='search'),
    path('gad/search-any', views.search_document, name='search_any'),
    path('media/documents/pdfs/<str:file_info>', views.protected_media_view, name='protected_media'),
    path('*', views.not_found, name='not_found'),
]

"""
 usuarios:
 usuario: @gad_2025
 clave: @superadmin

 usuario: @user_2025
 clave: Gad_2025

 usuario: @usuario2
 clave: Miclave_2025
"""
from django import forms

class Login(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={"placeholder": "Usuario", "class": "input"}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={"placeholder": "Contraseña", "class": "input"}))
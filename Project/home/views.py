from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def index(request):
    if request.user.is_authenticated:
        if request.user.groups.filter(name='Tourist').exists():
            return redirect('tourist_dashboard')
        elif request.user.groups.filter(name='Police').exists():
            return redirect('police_dashboard')
    return render(request, 'index.html')

@login_required(login_url='tourist_login')
def tourist_dashboard(request):
    if not request.user.groups.filter(name='Tourist').exists():
        messages.error(request, 'Unauthorized access.')
        return redirect('tourist_login')
    return render(request, 'tourist_dashboard.html')

@login_required(login_url='police_login')
def police_dashboard(request):
    if not request.user.groups.filter(name='Police').exists():
        messages.error(request, 'Unauthorized access.')
        return redirect('police_login')
    return render(request, 'police_dashboard.html')

def tourist_login(request):
    if request.user.is_authenticated:
        return redirect('tourist_dashboard')
        
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None and user.groups.filter(name='Tourist').exists():
            login(request, user)
            return redirect('tourist_dashboard')
        else:
            messages.error(request, 'Invalid tourist credentials.')

    return render(request, 'registration/tourist_login.html')

def police_login(request):
    if request.user.is_authenticated:
        return redirect('police_dashboard')
        
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None and user.groups.filter(name='Police').exists():
            login(request, user)
            return redirect('police_dashboard')
        else:
            messages.error(request, 'Invalid police credentials.')
            
    return render(request, 'registration/police_login.html')

def logout_view(request):
    logout(request)
    return redirect('index')
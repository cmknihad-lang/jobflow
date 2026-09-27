from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Business

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class BusinessSerializer(serializers.ModelSerializer):
    owner = UserSerializer()

    class Meta:
        model = Business
        fields = ['id', 'name', 'owner']

from django.db import models
from core.models import Business

class Customer(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"

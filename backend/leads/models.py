from django.db import models
from core.models import Business
from customers.models import Customer

class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('quotation', 'Quotation'),
        ('accepted', 'Accepted'),
        ('converted', 'Converted to Job'),
        ('lost', 'Lost'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='leads')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='leads')
    service = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    requirement = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    preferred_date = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Lead {self.id} - {self.customer.name}"

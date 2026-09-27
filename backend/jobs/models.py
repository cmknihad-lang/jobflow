from django.db import models
from core.models import Business
from billing.models import Quotation

class Job(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='jobs')
    lead = models.ForeignKey('leads.Lead', on_delete=models.CASCADE, related_name='jobs')
    quotation = models.ForeignKey(Quotation, on_delete=models.SET_NULL, null=True, blank=True, related_name='job')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.id} for {self.lead.customer.name}"

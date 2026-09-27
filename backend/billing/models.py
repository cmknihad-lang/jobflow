from django.db import models
from core.models import Business
from leads.models import Lead

class Quotation(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='quotations')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='quotations')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quote {self.id} for {self.lead.customer.name}"

class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.description} - {self.total_price}"

class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='payments')
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, default='completed')
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} - {self.amount} for Job {self.job.id}"

from rest_framework import serializers
from leads.models import Lead
from customers.models import Customer

class LeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Lead
        fields = ['id', 'customer', 'customer_name', 'service', 'location', 'requirement', 'status', 'preferred_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

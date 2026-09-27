from rest_framework import serializers
from jobs.models import Job

class JobSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='lead.customer.name', read_only=True)
    service = serializers.CharField(source='lead.service', read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'lead', 'quotation', 'customer_name', 'service', 'status', 'scheduled_date', 'completed_date', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

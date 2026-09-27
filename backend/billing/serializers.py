from rest_framework import serializers
from billing.models import Quotation, QuotationItem, Payment

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price']

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='lead.customer.name', read_only=True)

    class Meta:
        model = Quotation
        fields = ['id', 'lead', 'customer_name', 'total_amount', 'status', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='job.lead.customer.name', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'job', 'customer_name', 'amount', 'method', 'status', 'payment_date']
        read_only_fields = ['id', 'payment_date']

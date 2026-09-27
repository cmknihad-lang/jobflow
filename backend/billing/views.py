from rest_framework import viewsets, permissions
from billing.models import Quotation, Payment
from billing.serializers import QuotationSerializer, PaymentSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quotation.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(business=self.request.user.business)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(business=self.request.user.business)

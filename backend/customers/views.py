from rest_framework import viewsets, permissions
from customers.models import Customer
from customers.serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Tenant isolation: Only return customers belonging to the user's business
        return Customer.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the customer to the user's business
        serializer.save(business=self.request.user.business)
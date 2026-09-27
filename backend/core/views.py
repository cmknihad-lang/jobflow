from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from core.models import Business
from core.serializers import BusinessSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class BusinessViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Tenant Isolation: Only return the business owned by the current user
        return Business.objects.filter(owner=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        business_name = request.data.get('business_name')

        if not username or not email or not password or not business_name:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            business = Business.objects.create(name=business_name, owner=user)

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': BusinessSerializer(business).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from leads.models import Lead
from leads.serializers import LeadSerializer
from leads.ai_service import extract_lead_info

class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(business=self.request.user.business)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def extract_from_conversation(self, request):
        """
        Extract lead information from a customer conversation.

        Request body:
        {
            "conversation": "Rahul: Bro my AC is not cooling..."
        }

        Response:
        {
            "customer_name": "Rahul",
            "phone": null,
            "service": "AC Repair",
            "location": "Kannur",
            "preferred_date": "Tomorrow",
            "requirement": "AC not cooling properly"
        }
        """
        conversation = request.data.get('conversation', '')

        if not conversation.strip():
            return Response(
                {'error': 'Conversation text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            extracted_data = extract_lead_info(conversation)
            return Response(extracted_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Failed to extract information: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


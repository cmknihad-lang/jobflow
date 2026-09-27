from rest_framework import viewsets, permissions
from jobs.models import Job
from jobs.serializers import JobSerializer

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(business=self.request.user.business)

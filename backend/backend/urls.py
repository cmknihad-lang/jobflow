from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from core.views import BusinessViewSet
from customers.views import CustomerViewSet
from leads.views import LeadViewSet
from jobs.views import JobViewSet
from billing.views import QuotationViewSet, PaymentViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'business', BusinessViewSet, basename='business')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

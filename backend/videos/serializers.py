from rest_framework import serializers
from .models import MentoringVideo

class MentoringVideoSerializer(serializers.ModelSerializer):
    class Meta:
        
        model = MentoringVideo
        # Expose all essential fields for the API
        fields = ['id', 'user', 'title', 'description', 'video_file', 'uploaded_at']
            
        # 'user' is always set from request context, and 'uploaded_at' is auto-generated
        read_only_fields = ['user', 'uploaded_at']

import os
from dotenv import load_dotenv
from django.template.loader import render_to_string
from django.http import HttpResponse
from xhtml2pdf import pisa

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from openai import OpenAI, OpenAIError

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)


class ResumeGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_input = request.data.get("details") or request.data.get("content")

        if not user_input:
            return Response({"error": "Resume details required"}, status=400)

        prompt = f"Generate a professional resume based on the following:\n{user_input}"

        # Model fallback list
        models_to_try = ["gpt-4", "gpt-4o-mini", "gpt-3.5-turbo"]

        for model_name in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000,
                    temperature=0.7
                )
                resume_text = response.choices[0].message.content.strip()
                return Response({"resume": resume_text, "model_used": model_name})

            except OpenAIError as e:
                error_str = str(e)
                if "model_not_found" in error_str or "does not exist" in error_str:
                    continue  # Try next model
                return Response({"error": error_str}, status=500)

        return Response({"error": "No available models for your API key"}, status=403)

class ResumePDFDownloadView(APIView):
    def get(self, request):
        pdf_path = os.path.join("generated_resumes", "resume.pdf")  # Adjust path as per your generation logic

        if not os.path.exists(pdf_path):
            return Response({"error": "Resume not generated yet. Please generate it first."}, status=status.HTTP_400_BAD_REQUEST)

        with open(pdf_path, "rb") as pdf_file:
            response = HttpResponse(pdf_file.read(), content_type="application/pdf")
            response["Content-Disposition"] = 'attachment; filename="resume.pdf"'
            return response

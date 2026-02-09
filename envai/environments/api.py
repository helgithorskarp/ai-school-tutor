from ninja import NinjaAPI
from ninja import NinjaAPI, Body
from environments.models import Environment
api = NinjaAPI()

@api.get("/rag")
def hello(request, code: str):

    course = Environment.objects.get(code=code)

    return {"msg": "hello", "prompt": course.system_prompt}







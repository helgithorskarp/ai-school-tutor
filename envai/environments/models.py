from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Environment(models.Model):
       name = models.CharField(max_length=200)
       code = models.CharField(max_length=20, unique=True)  ### COURSE CODE

       description = models.TextField()
       project_type = models.CharField(max_length=200)
       system_prompt = models.TextField()
       ai_tone = models.TextField()
       do_rules = models.TextField()
       dont_rules = models.TextField()
       response_style = models.TextField()
       color_hex_theme = models.TextField()
       icon = models.CharField(max_length=50)

       def __str__(self):
           return self.name


class EnvironmentUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    environment = models.ForeignKey(Environment, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("user", "environment")

    def __str__(self):
        return f'{self.user.username} {self.environment.name}'

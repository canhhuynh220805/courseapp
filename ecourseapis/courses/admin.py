from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import mark_safe

from courses.models import Category, Course, Lesson, Tag, Comment


#Register your models here.
class CourseAdmin(admin.ModelAdmin):
    list_display = ["id", "subject", "description", "image", "created_date", "active"]
    search_fields = ['subject']
    list_filter = ["id", "subject", "category"]
    readonly_fields = ["image_view"]

    def image_view(self, course):
        if course.image:
            return mark_safe(f'<img src="/static/{course.image.name}" width: "200"/>')

    class Media:
        css = {
            'all': ('/static/css/styles.css',)
        }
        js = ('/static/js/script.js',)


class MyAdminSite(admin.AdminSite):
    site_header = 'Course App'
    def get_urls(self):
        return [path('stats-view/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        stats = Category.objects.annotate(count=Count('course')).values('id', 'name', 'count')

        return TemplateResponse(request, 'admin/stats.html', {'stats': stats})

admin_site = MyAdminSite()

admin_site.register(Category)
admin_site.register(Tag)
admin_site.register(Comment)
admin_site.register(Course, CourseAdmin)
admin_site.register(Lesson)
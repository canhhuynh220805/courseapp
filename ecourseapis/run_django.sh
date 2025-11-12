echo "=== cài đặt thư viện từ requirements.txt ==="
pip install -r requirements.txt

echo "=== Thực thi migrate cơ sở dữ liệu ==="
python manage.py migrate

echo "=== Tạo superuser ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123

python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== Chèn dữ liệu mẫu ==="
python manage.py shell  <<EOF
from courses.models import Category, Course

c1, _ = Category.objects.get_or_create(name='Software Engineering')
c2, _ = Category.objects.get_or_create(name='Artificial Intelligence')
c3, _ = Category.objects.get_or_create(name='Data Sciences')

Course.objects.create(subject='Introduction to SE', description='demo', image='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', category=c1)
Course.objects.create(subject='Software Testing', description='demo', image='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', category=c1)
Course.objects.create(subject='Introduction to AI', description='demo', image='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', category=c2)
Course.objects.create(subject='Machine Learning', description='demo', image='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', category=c1)
Course.objects.create(subject='Deep Learning', description='demo', image='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', category=c1)
Course.objects.create(subject='Python Programming', description='demo', image='https://res.cloudinary.com/dxxwcby8l/image/upload/v1709565062/rohn1l6xtpxedyqgyncs.png', category=c3)

EOF

echo "=== Chạy server Django ==="
python manage.py runserver
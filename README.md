# Zealthy Challenge


## Front End

- React/NextJS, TypeScript
- Shadcn/UI, TailwindCSS
- React Query, Axios

```bash
cd client
bun install
bun dev
```

## Back End

- Django
- Django Ninja
- Postgres

```bash
createdb username=postgres zealthy_db # update username to your username
cd server
# python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

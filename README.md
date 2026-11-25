# Patient Admission Management App

A full-stack dashboard for hospital staff to admit, search, filter, edit, discharge and delete patients. No login required: the app opens straight to the dashboard.

## Tech stack
- **Frontend:** React 18 + Vite, plain CSS (responsive; table becomes cards below 768px)
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic validation
- **Database:** SQLite locally, PostgreSQL in production via `DATABASE_URL`

## Run the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API: http://127.0.0.1:8000 (interactive docs at `/docs`). Data is saved in `patients.db`.

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:5173

## Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Optional. PostgreSQL URL, e.g. `postgresql://user:pass@host:5432/db`. Defaults to `sqlite:///./patients.db`. |
| `VITE_API_URL` | frontend | Backend base URL. Defaults to `http://127.0.0.1:8000`. Set at build time for production. |

## API
`GET /patients` · `POST /patients` · `PUT /patients/{id}` · `PATCH /patients/{id}/discharge` · `DELETE /patients/{id}`

`GET /` returns `{"status": "ok"}` as a health check. Validation errors return HTTP 400 with a readable `detail` string; unknown ids return 404.

## Live link
_Add your deployed URL here._

## Screenshots
_Add dashboard, add-patient form and mobile view screenshots here._

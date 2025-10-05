# backend/workflows/weather.py
# Minimal Python Workflow example. Cloudflare will discover/export WorkflowEntrypoint classes.

from workers import WorkflowEntrypoint

class Weather(WorkflowEntrypoint):
    async def run(self, event, step):
        city = (event or {}).get("city", "San Francisco")
        @step.do("fetchWeather")
        async def fetch_weather():
            # public API: wttr.in simple JSON
            res = await fetch(f"https://wttr.in/{city}?format=j1")
            return await res.json()
        data = await fetch_weather()
        return {"city": city, "data": data}

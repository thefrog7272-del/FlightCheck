# FlightCheck MSFS Panel Addon (Offline)

Detachable toolbar panel for FlightCheck inside MSFS 2024. Works **fully offline** with all shared aircraft and checklists bundled.

## Install

1. Copy the `flightcheck-panel` folder into your MSFS **Community** folder:
   - Steam: `%AppData%\Microsoft Flight Simulator\Packages\Community\`
   - MS Store / Game Pass: `%LocalAppData%\Packages\Microsoft.FlightSimulator_8wekyb3d8bbwe\LocalCache\Packages\Community\`
   - MSFS 2024 (Xbox app): `%LocalAppData%\Packages\Microsoft.Limitless_8wekyb3d8bbwe\LocalCache\Packages\Community\`

2. Launch MSFS. The FlightCheck toolbar button should appear in the top toolbar (the row of icons across the top of the screen while flying).

3. Click it to open the panel. The panel can be undocked and moved like any other instrument panel.

## Features

✅ **Offline** — no internet required; all 67+ aircraft and 150+ checklists bundled  
✅ **Full functionality** — browse, search, import planes, run checklists  
✅ **Voice callouts** — TTS reads checklist items aloud  
✅ **Progress sync** — checklist state saved between flights  
✅ **Custom planes** — create/import custom aircraft locally  

## Build Instructions (for developers)

To build the addon with latest data from Supabase:

```bash
npm run build:addon
```

This will:
- Build the React app
- Export all shared aircraft + checklists from Supabase
- Bundle everything into the addon's `FlightCheck` folder

The addon is self-contained after that and requires no internet.

## Requirements

- MSFS 2020 or 2024
- No internet required (fully offline)

## Custom Aircraft & Syncing

Custom aircraft/checklists created in the addon are stored in your browser's local storage. To sync them to the web version:

1. Open https://flightcheck.thefrog7272.workers.dev in your browser
2. Log in
3. Navigate to **Manage** → your custom aircraft will show; if prompted, **Submit** them for admin review

## Troubleshooting

- **Panel doesn't appear**: Make sure the folder is directly inside Community (not nested). Check the MSFS Content Manager.
- **Blank screen**: Try toggling the panel off and on, or restart the sim.
- **Data seems old**: Run `npm run build:addon` to refresh the bundled data from the server.
- **Voice not working**: MSFS's browser has limited TTS support; check audio settings.

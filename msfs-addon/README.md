# FlightCheck MSFS Panel Addon

Opens the FlightCheck web app in a detachable toolbar panel inside MSFS 2024.

## Install

1. Copy the `flightcheck-panel` folder into your MSFS **Community** folder:
   - Steam: `%AppData%\Microsoft Flight Simulator\Packages\Community\`
   - MS Store / Game Pass: `%LocalAppData%\Packages\Microsoft.FlightSimulator_8wekyb3d8bbwe\LocalCache\Packages\Community\`
   - MSFS 2024 (Xbox app): `%LocalAppData%\Packages\Microsoft.Limitless_8wekyb3d8bbwe\LocalCache\Packages\Community\`

2. Launch MSFS. The FlightCheck toolbar button should appear in the top toolbar (the row of icons across the top of the screen while flying).

3. Click it to open the panel. The panel can be undocked and moved like any other instrument panel.

## Requirements

- Internet connection (the panel loads https://flightcheck.thefrog7272.workers.dev/)
- MSFS 2020 or 2024

## Updating

When a new version of FlightCheck is released, no addon update is needed — the panel always loads the latest live version from the web.

## Troubleshooting

- **Panel doesn't appear**: Make sure the folder is directly inside Community (not nested inside another folder). Check the MSFS Content Manager.
- **Blank screen / error**: The sim may be blocking the iframe. Try toggling the panel off and on, or check your internet connection.
- **Microphone not working**: MSFS's browser has limited microphone support. Voice features may not work inside the panel.

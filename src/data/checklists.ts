import type { PlaneChecklist } from './types';

export const checklists: Record<string, PlaneChecklist> = {
  c172: {
    planeId: 'c172',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start Inspection',
        items: [
          { id: 'preflight', label: 'Preflight Inspection', expectedState: 'COMPLETE' },
          { id: 'pass-brief', label: 'Passenger Briefing', expectedState: 'COMPLETE' },
          { id: 'seats-belts', label: 'Seats & Seat Belts', expectedState: 'ADJUSTED & LOCKED' },
          { id: 'brakes', label: 'Brakes', expectedState: 'TEST & SET' },
          { id: 'circuit-breakers', label: 'Circuit Breakers', expectedState: 'CHECK IN' },
          { id: 'elec-equip', label: 'Electrical Equipment', expectedState: 'OFF' },
          { id: 'avionics', label: 'Avionics Master Switch', expectedState: 'OFF' },
          { id: 'fuel-selector', label: 'Fuel Selector Valve', expectedState: 'BOTH' },
          { id: 'fuel-shutoff', label: 'Fuel Shutoff Valve', expectedState: 'ON' },
        ],
      },
      {
        id: 'start',
        title: 'Engine Start',
        items: [
          { id: 'throttle', label: 'Throttle', expectedState: 'OPEN 1/4 INCH' },
          { id: 'mixture', label: 'Mixture', expectedState: 'IDLE CUTOFF' },
          { id: 'prop-area', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'master-switch', label: 'Master Switch', expectedState: 'ON' },
          { id: 'beacon', label: 'Beacon Light', expectedState: 'ON' },
          { id: 'fuel-pump', label: 'Auxiliary Fuel Pump', expectedState: 'ON' },
          { id: 'ignition', label: 'Ignition Switch', expectedState: 'START' },
          { id: 'oil-pressure', label: 'Oil Pressure', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'flaps', label: 'Flaps', expectedState: 'UP' },
          { id: 'transponder', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'taxi-light', label: 'Taxi Light', expectedState: 'ON' },
          { id: 'brakes-test', label: 'Brakes', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'runup',
        title: 'Before Takeoff (Runup)',
        items: [
          { id: 'parking-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'seats', label: 'Seats / Belts', expectedState: 'CHECK' },
          { id: 'doors', label: 'Doors / Windows', expectedState: 'CLOSED / LOCKED' },
          { id: 'controls', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'instruments', label: 'Flight Instruments', expectedState: 'CHECK & SET' },
          { id: 'fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'mixture-best', label: 'Mixture', expectedState: 'RICH' },
          { id: 'fuel-selector-recheck', label: 'Fuel Selector', expectedState: 'RECHECK BOTH' },
          { id: 'throttle-1800', label: 'Throttle', expectedState: '1800 RPM' },
          { id: 'mags', label: 'Magnetos', expectedState: 'CHECK (MAX DROP 150)' },
          { id: 'vacuum', label: 'Vacuum Gage', expectedState: 'CHECK' },
          { id: 'amps', label: 'Ammeter / Voltmeter', expectedState: 'CHECK' },
          { id: 'throttle-idle', label: 'Throttle', expectedState: 'CHECK IDLE' },
          { id: 'throttle-1000', label: 'Throttle', expectedState: '1000 RPM' },
        ]
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'flaps-to', label: 'Flaps', expectedState: 'UP' },
          { id: 'throttle-full', label: 'Throttle', expectedState: 'FULL OPEN' },
          { id: 'mixture-full', label: 'Mixture', expectedState: 'RICH' },
          { id: 'rotate', label: 'Rotate', expectedState: '55 KIAS' },
          { id: 'climb-speed', label: 'Climb Speed', expectedState: '70-80 KIAS' },
        ]
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'climb-throttle', label: 'Throttle', expectedState: 'FULL' },
          { id: 'climb-mixture', label: 'Mixture', expectedState: 'RICH' },
          { id: 'climb-instruments', label: 'Engine Instruments', expectedState: 'CHECK' },
          { id: 'landing-light-off', label: 'Landing Light', expectedState: 'OFF (ABOVE 1000FT)' },
        ]
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'cruise-power', label: 'Power', expectedState: '2100-2700 RPM' },
          { id: 'cruise-mixture', label: 'Mixture', expectedState: 'LEAN' },
          { id: 'cruise-trim', label: 'Elevator Trim', expectedState: 'ADJUST' },
        ]
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'descent-fuel', label: 'Fuel Selector', expectedState: 'BOTH' },
          { id: 'descent-mixture', label: 'Mixture', expectedState: 'ADJUST' },
          { id: 'descent-throttle', label: 'Throttle', expectedState: 'AS DESIRED' },
        ]
      },
      {
        id: 'before-landing',
        title: 'Before Landing',
        items: [
          { id: 'land-seats', label: 'Seats / Belts', expectedState: 'SECURE' },
          { id: 'land-fuel', label: 'Fuel Selector', expectedState: 'BOTH' },
          { id: 'land-mixture', label: 'Mixture', expectedState: 'RICH' },
          { id: 'land-lights', label: 'Landing Light', expectedState: 'ON' },
          { id: 'land-flaps', label: 'Flaps', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'post-flaps', label: 'Flaps', expectedState: 'UP' },
          { id: 'post-lights', label: 'Landing Light', expectedState: 'OFF' },
          { id: 'post-taxi-light', label: 'Taxi Light', expectedState: 'ON' },
        ]
      },
      {
        id: 'securing',
        title: 'Securing Aircraft',
        items: [
          { id: 'sec-avionics', label: 'Avionics Master', expectedState: 'OFF' },
          { id: 'sec-mixture', label: 'Mixture', expectedState: 'IDLE CUTOFF' },
          { id: 'sec-ignition', label: 'Ignition', expectedState: 'OFF' },
          { id: 'sec-master', label: 'Master Switch', expectedState: 'OFF' },
        ]
      }
    ],
  },
  b737: {
    planeId: 'b737',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'battery', label: 'Battery', expectedState: 'ON & GUARD CLOSED' },
          { id: 'standby-power', label: 'Standby Power', expectedState: 'AUTO & GUARD CLOSED' },
          { id: 'hyd-pumps', label: 'Hydraulic Pumps', expectedState: 'ON' },
          { id: 'fire-test', label: 'Fire Warning Test', expectedState: 'CHECK' },
          { id: 'pos-lights', label: 'Position Lights', expectedState: 'STEADY' },
          { id: 'logo-light', label: 'Logo Light', expectedState: 'AS REQ' },
        ],
      },
      {
        id: 'apu-start',
        title: 'APU Start',
        items: [
          { id: 'apu-bleed', label: 'APU Bleed', expectedState: 'OFF' },
          { id: 'apu-switch', label: 'APU Switch', expectedState: 'START -> ON' },
          { id: 'apu-gen', label: 'APU Gen Bus Switches', expectedState: 'ON' },
          { id: 'apu-bleed-on', label: 'APU Bleed', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'generators', label: 'Generators', expectedState: 'ON' },
          { id: 'probe-heat', label: 'Probe Heat', expectedState: 'ON' },
          { id: 'wing-anti-ice', label: 'Wing Anti-Ice', expectedState: 'AS REQ' },
          { id: 'eng-anti-ice', label: 'Engine Anti-Ice', expectedState: 'AS REQ' },
          { id: 'packs', label: 'Pack Switches', expectedState: 'AUTO' },
          { id: 'isolation', label: 'Isolation Valve', expectedState: 'AUTO' },
          { id: 'eng-bleed', label: 'Engine Bleed', expectedState: 'ON' },
          { id: 'apu-bleed-off', label: 'APU Bleed', expectedState: 'OFF' },
          { id: 'apu-off', label: 'APU Switch', expectedState: 'OFF' },
        ]
      },
      {
        id: 'eng-start',
        title: 'Engine Start',
        items: [
          { id: 'fuel-pumps', label: 'Fuel Pumps', expectedState: 'ON' },
          { id: 'packs-off', label: 'Packs', expectedState: 'OFF' },
          { id: 'start-sw', label: 'Engine Start Switch', expectedState: 'GRD' },
          { id: 'fuel-idle', label: 'Fuel Lever', expectedState: 'IDLE (AT 25% N2)' },
          { id: 'start-off', label: 'Start Switch', expectedState: 'OFF (AT 56% N2)' },
        ]
      },
      {
        id: 'before-to',
        title: 'Before Takeoff',
        items: [
          { id: 'flaps-to-737', label: 'Flaps', expectedState: 'SET FOR T/O' },
          { id: 'mcp-v2', label: 'MCP / V2 Speed', expectedState: 'SET' },
          { id: 'land-lights-on', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'transponder-ra', label: 'Transponder', expectedState: 'TA/RA' },
        ]
      },
      {
        id: 'takeoff-737',
        title: 'Takeoff',
        items: [
          { id: 'toga', label: 'TO/GA Button', expectedState: 'PRESS' },
          { id: 'rotate-737', label: 'Rotate', expectedState: 'Vr' },
          { id: 'gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'flaps-retract', label: 'Flaps', expectedState: 'RETRACT ON SCHEDULE' },
        ]
      },
      {
        id: 'cruise-737',
        title: 'Cruise',
        items: [
          { id: 'alt-std', label: 'Altimeters', expectedState: 'STD' },
          { id: 'ap-on', label: 'Autopilot', expectedState: 'ENGAGED' },
          { id: 'fuel-bal', label: 'Fuel Balance', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'descent-737',
        title: 'Descent',
        items: [
          { id: 'desc-prep', label: 'Descent Prep', expectedState: 'COMPLETE' },
          { id: 'alt-set', label: 'Altimeters', expectedState: 'SET' },
          { id: 'auto-brake', label: 'Autobrake', expectedState: 'SET' },
        ]
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'app-flaps', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'app-gear', label: 'Landing Gear', expectedState: 'DOWN' },
          { id: 'speedbrake', label: 'Speedbrake', expectedState: 'ARMED' },
        ]
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'land-flaps-30', label: 'Flaps', expectedState: '30 / 40' },
          { id: 'land-speed', label: 'Landing Speed', expectedState: 'VREF + 5' },
          { id: 'rev-thrust', label: 'Reverse Thrust', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'after-landing-737',
        title: 'After Landing',
        items: [
          { id: 'post-flaps-up', label: 'Flaps', expectedState: 'UP' },
          { id: 'post-xpdr', label: 'Transponder', expectedState: 'STBY' },
          { id: 'post-radar', label: 'Weather Radar', expectedState: 'OFF' },
          { id: 'post-apu', label: 'APU', expectedState: 'START AS REQ' },
        ]
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'fuel-cutoff', label: 'Fuel Levers', expectedState: 'CUTOFF' },
          { id: 'belts-off', label: 'Fasten Belts', expectedState: 'OFF' },
          { id: 'apu-gen-on', label: 'APU Gen', expectedState: 'ON' },
        ]
      },
      {
        id: 'securing-737',
        title: 'Securing Aircraft',
        items: [
          { id: 'irs-off', label: 'IRS Selectors', expectedState: 'OFF' },
          { id: 'emer-lights', label: 'Emergency Lights', expectedState: 'OFF' },
          { id: 'battery-off', label: 'Battery', expectedState: 'OFF' },
        ]
      }
    ],
  },
  c208: {
    planeId: 'c208',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start Inspection',
        items: [
          { id: 'preflight-208', label: 'Preflight Inspection', expectedState: 'COMPLETE' },
          { id: 'pass-brief-208', label: 'Passenger Briefing', expectedState: 'COMPLETE' },
          { id: 'seats-belts-208', label: 'Seats & Seat Belts', expectedState: 'ADJUSTED & LOCKED' },
          { id: 'parking-brake-208', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'circuit-breakers-208', label: 'Circuit Breakers', expectedState: 'CHECK IN' },
          { id: 'elec-equip-208', label: 'Electrical Equipment', expectedState: 'OFF' },
          { id: 'avionics-208', label: 'Avionics Master Switch', expectedState: 'OFF' },
          { id: 'fuel-selector-208', label: 'Fuel Selector Valve', expectedState: 'BOTH ON' },
          { id: 'fuel-shutoff-208', label: 'Fuel Shutoff Valve', expectedState: 'PUSH IN (ON)' },
          { id: 'epl-208', label: 'Emergency Power Lever', expectedState: 'NORMAL / GUARDED' },
          { id: 'power-lever-208', label: 'Power Lever', expectedState: 'IDLE' },
          { id: 'prop-lever-208', label: 'Propeller Lever', expectedState: 'MAX RPM' },
          { id: 'cond-lever-208', label: 'Fuel Condition Lever', expectedState: 'CUTOFF' }
        ]
      },
      {
        id: 'engine-start',
        title: 'Engine Start (Battery)',
        items: [
          { id: 'battery-sw-208', label: 'Battery Switch', expectedState: 'ON' },
          { id: 'fuel-boost-208', label: 'Fuel Boost Switch', expectedState: 'ON' },
          { id: 'strobe-beacon-208', label: 'Strobe / Beacon', expectedState: 'ON' },
          { id: 'prop-area-208', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'starter-sw-208', label: 'Starter Switch', expectedState: 'START' },
          { id: 'oil-press-208', label: 'Oil Pressure', expectedState: 'CHECK' },
          { id: 'ng-stable-208', label: 'Ng', expectedState: 'MIN 12% & STABLE' },
          { id: 'cond-lever-start-208', label: 'Fuel Condition Lever', expectedState: 'LOW IDLE' },
          { id: 'itt-monitor-208', label: 'ITT', expectedState: 'MONITOR (1090°C MAX)' },
          { id: 'starter-off-208', label: 'Starter Switch', expectedState: 'OFF AT 52% NG' },
          { id: 'gen-on-208', label: 'Generator', expectedState: 'ON (CHECK OFF LIGHT)' }
        ]
      },
      {
        id: 'before-takeoff-208',
        title: 'Before Takeoff',
        items: [
          { id: 'flight-controls-208', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'flight-instruments-208', label: 'Flight Instruments', expectedState: 'SET' },
          { id: 'trims-208', label: 'Trims (Ail/Rud/Elev)', expectedState: 'SET FOR T/O' },
          { id: 'flaps-to-208', label: 'Flaps', expectedState: '10° - 20°' },
          { id: 'inertial-sep-208', label: 'Inertial Separator', expectedState: 'AS REQUIRED' },
          { id: 'ice-protection-208', label: 'Ice Protection', expectedState: 'AS REQUIRED' },
          { id: 'pitot-heat-208', label: 'Pitot Heat', expectedState: 'ON' }
        ]
      },
      {
        id: 'takeoff-208',
        title: 'Takeoff',
        items: [
          { id: 'power-max', label: 'Power Lever', expectedState: 'MAX' },
          { id: 'itt-check', label: 'ITT', expectedState: 'MONITOR' },
          { id: 'rotate-208', label: 'Rotate', expectedState: '70-75 KIAS' },
          { id: 'flaps-up-85', label: 'Flaps', expectedState: 'UP ABOVE 85 KIAS' },
        ]
      },
      {
        id: 'climb-208',
        title: 'Climb',
        items: [
          { id: 'climb-power-208', label: 'Power Lever', expectedState: 'ADJUST' },
          { id: 'climb-itt', label: 'ITT', expectedState: 'MONITOR' },
          { id: 'climb-flaps-up', label: 'Flaps', expectedState: 'UP' },
        ]
      },
      {
        id: 'cruise-208',
        title: 'Cruise',
        items: [
          { id: 'cruise-power-208', label: 'Power Lever', expectedState: 'ADJUST' },
          { id: 'cruise-fuel', label: 'Fuel Quantity', expectedState: 'MONITOR' },
        ]
      },
      {
        id: 'descent-208',
        title: 'Descent',
        items: [
          { id: 'desc-fuel-208', label: 'Fuel Selectors', expectedState: 'BOTH ON' },
          { id: 'desc-power-208', label: 'Power', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'before-landing-208',
        title: 'Before Landing',
        items: [
          { id: 'land-seats-208', label: 'Seats / Belts', expectedState: 'SECURE' },
          { id: 'land-lights-208', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'land-flaps-208', label: 'Flaps', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'after-landing-208',
        title: 'After Landing',
        items: [
          { id: 'post-flaps-208', label: 'Flaps', expectedState: 'UP' },
          { id: 'post-lights-208', label: 'Landing/Strobes', expectedState: 'OFF' },
          { id: 'post-taxi-208', label: 'Taxi Light', expectedState: 'ON' },
          { id: 'post-sep-208', label: 'Inertial Separator', expectedState: 'NORMAL' },
        ]
      },
      {
        id: 'shutdown-208',
        title: 'Shutdown',
        items: [
          { id: 'shut-prop', label: 'Propeller Lever', expectedState: 'FEATHER' },
          { id: 'shut-fuel', label: 'Fuel Condition Lever', expectedState: 'CUTOFF' },
          { id: 'shut-elec', label: 'Gen / Battery', expectedState: 'OFF' },
        ]
      }
    ],
  },
  a320: {
    planeId: 'a320',
    phases: [
      {
        id: 'safety-exterior',
        title: 'Safety Exterior',
        items: [
          { id: 'chocks', label: 'Chocks', expectedState: 'IN' },
          { id: 'gear-doors', label: 'Landing Gear Doors', expectedState: 'CLOSED' },
          { id: 'apu-clear', label: 'APU Area', expectedState: 'CLEAR' },
        ]
      },
      {
        id: 'cockpit-prep',
        title: 'Cockpit Preparation',
        items: [
          { id: 'bat-auto', label: 'Batteries 1&2', expectedState: 'AUTO' },
          { id: 'ext-pwr', label: 'External Power', expectedState: 'ON' },
          { id: 'adirs-nav', label: 'ADIRS Selectors', expectedState: 'NAV' },
          { id: 'oxy-test', label: 'Oxygen Mask', expectedState: 'TEST' },
        ]
      },
      {
        id: 'before-pushback',
        title: 'Before Pushback / Start',
        items: [
          { id: 'park-brake-a320', label: 'Parking Brake', expectedState: 'AS REQ' },
          { id: 'beacon-a320', label: 'Beacon Light', expectedState: 'ON' },
          { id: 'doors-a320', label: 'Doors', expectedState: 'CLOSED' },
        ]
      },
      {
        id: 'eng-start-a320',
        title: 'Engine Start',
        items: [
          { id: 'mode-sel-ign', label: 'Mode Selector', expectedState: 'IGN / START' },
          { id: 'master-2-on', label: 'Master 2', expectedState: 'ON' },
          { id: 'master-1-on', label: 'Master 1', expectedState: 'ON' },
          { id: 'mode-sel-norm', label: 'Mode Selector', expectedState: 'NORM' },
        ]
      },
      {
        id: 'taxi-a320',
        title: 'Taxi',
        items: [
          { id: 'nose-light-taxi', label: 'Nose Light', expectedState: 'TAXI' },
          { id: 'abrk-max', label: 'Auto Brake', expectedState: 'MAX' },
          { id: 'f-ctrl-check', label: 'Flight Controls', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'before-to-a320',
        title: 'Before Takeoff',
        items: [
          { id: 'flaps-set-a320', label: 'Flaps', expectedState: 'SET' },
          { id: 'to-config-test', label: 'Takeoff Config', expectedState: 'TEST' },
          { id: 'xpdr-on', label: 'Transponder', expectedState: 'ON' },
          { id: 'land-lights-on-a320', label: 'Landing Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'climb-a320',
        title: 'Climb',
        items: [
          { id: 'gear-up-a320', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'flaps-retract-a320', label: 'Flaps', expectedState: 'RETRACT' },
          { id: 'ap-on-a320', label: 'Autopilot', expectedState: 'ON' },
        ]
      },
      {
        id: 'cruise-a320',
        title: 'Cruise',
        items: [
          { id: 'alt-std-a320', label: 'Altimeters', expectedState: 'STD' },
          { id: 'ecam-check', label: 'ECAM Memos', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'descent-a320',
        title: 'Descent',
        items: [
          { id: 'desc-info', label: 'Descent Info', expectedState: 'ENTER' },
          { id: 'alt-set-a320', label: 'Altimeters', expectedState: 'SET' },
          { id: 'land-memo', label: 'Landing Memo', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'before-landing-a320',
        title: 'Before Landing',
        items: [
          { id: 'gear-down-a320', label: 'Landing Gear', expectedState: 'DOWN' },
          { id: 'flaps-full-a320', label: 'Flaps', expectedState: 'FULL' },
          { id: 'spoilers-arm', label: 'Spoilers', expectedState: 'ARMED' },
        ]
      },
      {
        id: 'after-landing-a320',
        title: 'After Landing',
        items: [
          { id: 'post-flaps-a320', label: 'Flaps', expectedState: 'RETRACT' },
          { id: 'post-spoilers', label: 'Spoilers', expectedState: 'DISARMED' },
          { id: 'post-radar-a320', label: 'Radar / PWS', expectedState: 'OFF' },
          { id: 'post-apu-a320', label: 'APU', expectedState: 'START' },
        ]
      },
      {
        id: 'parking',
        title: 'Parking',
        items: [
          { id: 'eng-off', label: 'Engines', expectedState: 'OFF' },
          { id: 'belts-off-a320', label: 'Seat Belts', expectedState: 'OFF' },
          { id: 'ext-pwr-a320', label: 'External Power', expectedState: 'AS REQ' },
        ]
      },
      {
        id: 'securing-a320',
        title: 'Securing Aircraft',
        items: [
          { id: 'adirs-off', label: 'ADIRS', expectedState: 'OFF' },
          { id: 'oxy-off', label: 'Oxygen', expectedState: 'OFF' },
          { id: 'bat-off', label: 'Batteries', expectedState: 'OFF' },
        ]
      }
    ],
  },
  b747: {
    planeId: 'b747',
    phases: [
      {
        id: 'cockpit-prep-747',
        title: 'Cockpit Preparation',
        items: [
          { id: 'b747-battery', label: 'Battery Switch', expectedState: 'ON' },
          { id: 'b747-ext-pwr', label: 'External Power', expectedState: 'CONNECT & ON' },
          { id: 'b747-irs', label: 'IRS Selectors (All 3)', expectedState: 'NAV' },
          { id: 'b747-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'b747-no-smoking', label: 'No Smoking / Seatbelts', expectedState: 'ON' },
          { id: 'b747-fuel-panel', label: 'Fuel Panel', expectedState: 'CHECK QUANTITIES' },
          { id: 'b747-hyd-demand', label: 'Hydraulic Demand Pumps', expectedState: 'AUTO' },
        ]
      },
      {
        id: 'before-start-747',
        title: 'Before Start',
        items: [
          { id: 'b747-fmc', label: 'FMC / CDU', expectedState: 'PROGRAMMED' },
          { id: 'b747-mcp', label: 'MCP', expectedState: 'SET' },
          { id: 'b747-altimeters', label: 'Altimeters', expectedState: 'SET & CROSSCHECKED' },
          { id: 'b747-beacon-on', label: 'Beacon Light', expectedState: 'ON' },
          { id: 'b747-doors', label: 'Doors', expectedState: 'CLOSED' },
          { id: 'b747-apu', label: 'APU', expectedState: 'RUNNING' },
        ]
      },
      {
        id: 'eng-start-747',
        title: 'Engine Start',
        items: [
          { id: 'b747-packs-off', label: 'Packs (All 3)', expectedState: 'OFF' },
          { id: 'b747-fuel-ctrl-1', label: 'Engine 4 Fuel Control', expectedState: 'RUN' },
          { id: 'b747-start-4', label: 'Engine 4 Start Selector', expectedState: 'GND' },
          { id: 'b747-n2-4', label: 'Engine 4 N2', expectedState: 'MONITOR RISE' },
          { id: 'b747-repeat', label: 'Engines 1, 2, 3', expectedState: 'REPEAT PROCEDURE' },
          { id: 'b747-packs-on', label: 'Packs', expectedState: 'AUTO' },
          { id: 'b747-apu-off', label: 'APU', expectedState: 'OFF' },
        ]
      },
      {
        id: 'taxi-747',
        title: 'Taxi',
        items: [
          { id: 'b747-taxi-light', label: 'Taxi Lights', expectedState: 'ON' },
          { id: 'b747-brakes-test', label: 'Brakes', expectedState: 'TEST' },
          { id: 'b747-flt-ctrl', label: 'Flight Controls', expectedState: 'CHECK' },
          { id: 'b747-flaps-taxi', label: 'Flaps', expectedState: 'SET FOR TAKEOFF' },
          { id: 'b747-stab-trim', label: 'Stabilizer Trim', expectedState: 'SET' },
        ]
      },
      {
        id: 'before-to-747',
        title: 'Before Takeoff',
        items: [
          { id: 'b747-to-config', label: 'Takeoff Config Warning', expectedState: 'TEST' },
          { id: 'b747-transponder', label: 'Transponder', expectedState: 'TA/RA' },
          { id: 'b747-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'b747-strobe', label: 'Strobe Lights', expectedState: 'ON' },
          { id: 'b747-autobrake-rto', label: 'Autobrake', expectedState: 'RTO' },
        ]
      },
      {
        id: 'takeoff-747',
        title: 'Takeoff',
        items: [
          { id: 'b747-toga', label: 'Thrust Levers', expectedState: 'TOGA / FLEX' },
          { id: 'b747-rotate', label: 'Rotate', expectedState: 'Vr' },
          { id: 'b747-gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'b747-flaps-retract', label: 'Flaps', expectedState: 'RETRACT ON SCHEDULE' },
        ]
      },
      {
        id: 'climb-747',
        title: 'Climb',
        items: [
          { id: 'b747-climb-thrust', label: 'Thrust', expectedState: 'CLIMB DETENT' },
          { id: 'b747-ap-engage', label: 'Autopilot', expectedState: 'ENGAGE' },
          { id: 'b747-alt-above-trans', label: 'Altimeters', expectedState: 'STD ABOVE TRANS ALT' },
          { id: 'b747-land-lights-off', label: 'Landing Lights', expectedState: 'OFF ABOVE 10,000FT' },
          { id: 'b747-seatbelts-off', label: 'Seatbelt Sign', expectedState: 'OFF WHEN APPROPRIATE' },
        ]
      },
      {
        id: 'cruise-747',
        title: 'Cruise',
        items: [
          { id: 'b747-cruise-alt', label: 'Cruise Altitude', expectedState: 'VERIFY' },
          { id: 'b747-fuel-balance', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'b747-eicas', label: 'EICAS', expectedState: 'MONITOR' },
          { id: 'b747-step-climb', label: 'Step Climb', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'descent-747',
        title: 'Descent',
        items: [
          { id: 'b747-desc-prep', label: 'Descent Preparation', expectedState: 'COMPLETE' },
          { id: 'b747-alt-set', label: 'Altimeters', expectedState: 'SET FOR ARRIVAL' },
          { id: 'b747-land-lights-desc', label: 'Landing Lights', expectedState: 'ON BELOW 10,000FT' },
          { id: 'b747-seatbelts-desc', label: 'Seatbelt Sign', expectedState: 'ON' },
          { id: 'b747-autobrake', label: 'Autobrake', expectedState: 'SET' },
        ]
      },
      {
        id: 'approach-747',
        title: 'Approach',
        items: [
          { id: 'b747-app-speed', label: 'Approach Speed', expectedState: 'SET IN MCP' },
          { id: 'b747-app-flaps', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'b747-app-gear', label: 'Landing Gear', expectedState: 'DOWN & 3 GREEN' },
          { id: 'b747-speedbrake-arm', label: 'Speedbrake', expectedState: 'ARMED' },
          { id: 'b747-go-around-alt', label: 'Go-Around Altitude', expectedState: 'SET' },
        ]
      },
      {
        id: 'landing-747',
        title: 'Landing',
        items: [
          { id: 'b747-land-flaps', label: 'Flaps', expectedState: '25 / 30' },
          { id: 'b747-vref', label: 'Speed', expectedState: 'VREF + CORRECTIONS' },
          { id: 'b747-reverse', label: 'Reverse Thrust', expectedState: 'AS REQUIRED' },
          { id: 'b747-decel', label: 'Deceleration', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'after-landing-747',
        title: 'After Landing',
        items: [
          { id: 'b747-flaps-up', label: 'Flaps', expectedState: 'UP' },
          { id: 'b747-spoilers-down', label: 'Speedbrake', expectedState: 'DOWN' },
          { id: 'b747-transponder-stby', label: 'Transponder', expectedState: 'STBY' },
          { id: 'b747-apu-start', label: 'APU', expectedState: 'START' },
          { id: 'b747-taxi-light-on', label: 'Taxi Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'shutdown-747',
        title: 'Shutdown',
        items: [
          { id: 'b747-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'b747-fuel-ctrl-off', label: 'Fuel Control Switches (All)', expectedState: 'CUTOFF' },
          { id: 'b747-fasten-belts', label: 'Fasten Belts Sign', expectedState: 'OFF' },
          { id: 'b747-hyd-pumps-off', label: 'Hydraulic Pumps', expectedState: 'OFF' },
        ]
      },
      {
        id: 'securing-747',
        title: 'Securing',
        items: [
          { id: 'b747-irs-off', label: 'IRS Selectors', expectedState: 'OFF' },
          { id: 'b747-emer-lights-off', label: 'Emergency Lights', expectedState: 'OFF' },
          { id: 'b747-apu-off-sec', label: 'APU', expectedState: 'OFF' },
          { id: 'b747-battery-off', label: 'Battery Switch', expectedState: 'OFF' },
        ]
      }
    ],
  },
  crj7: {
    planeId: 'crj7',
    phases: [
      {
        id: 'cockpit-prep-crj',
        title: 'Cockpit Prep',
        items: [
          { id: 'crj7-battery', label: 'Battery Master', expectedState: 'ON' },
          { id: 'crj7-ext-pwr', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
          { id: 'crj7-irs', label: 'IRS', expectedState: 'NAV' },
          { id: 'crj7-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'crj7-fms', label: 'FMS', expectedState: 'PROGRAM' },
          { id: 'crj7-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'before-start-crj',
        title: 'Before Start',
        items: [
          { id: 'crj7-apu-start', label: 'APU', expectedState: 'START & ON' },
          { id: 'crj7-apu-gen', label: 'APU Generator', expectedState: 'ON' },
          { id: 'crj7-beacon', label: 'Beacon Light', expectedState: 'ON' },
          { id: 'crj7-doors', label: 'Doors', expectedState: 'CLOSED' },
          { id: 'crj7-park-brake', label: 'Parking Brake', expectedState: 'SET' },
        ]
      },
      {
        id: 'eng-start-crj',
        title: 'Engine Start',
        items: [
          { id: 'crj7-thrust-idle', label: 'Thrust Levers', expectedState: 'IDLE' },
          { id: 'crj7-start-r', label: 'Right Engine Start/Stop', expectedState: 'START' },
          { id: 'crj7-n2-rise', label: 'N2 Rise', expectedState: 'CONFIRM' },
          { id: 'crj7-fuel-r', label: 'Right Fuel Lever', expectedState: 'ON AT 20% N2' },
          { id: 'crj7-start-l', label: 'Left Engine', expectedState: 'REPEAT PROCEDURE' },
          { id: 'crj7-gen-on', label: 'Generators (Both)', expectedState: 'ON' },
          { id: 'crj7-apu-off', label: 'APU', expectedState: 'OFF' },
        ]
      },
      {
        id: 'before-taxi-crj',
        title: 'Before Taxi',
        items: [
          { id: 'crj7-flt-ctrl', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'crj7-trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
          { id: 'crj7-probe-heat', label: 'Probe Heat', expectedState: 'ON' },
          { id: 'crj7-anti-ice', label: 'Anti-Ice', expectedState: 'AS REQUIRED' },
          { id: 'crj7-taxi-light', label: 'Taxi Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-to-crj',
        title: 'Before Takeoff',
        items: [
          { id: 'crj7-flaps-set', label: 'Flaps', expectedState: '8 / 20' },
          { id: 'crj7-spoilers-arm', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'crj7-transponder', label: 'Transponder', expectedState: 'TA/RA' },
          { id: 'crj7-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'crj7-strobes', label: 'Strobe Lights', expectedState: 'ON' },
          { id: 'crj7-to-config', label: 'Takeoff Config', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'takeoff-crj',
        title: 'Takeoff',
        items: [
          { id: 'crj7-thrust-set', label: 'Thrust', expectedState: 'FLEX / TOGA' },
          { id: 'crj7-rotate', label: 'Rotate', expectedState: 'Vr' },
          { id: 'crj7-gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'crj7-flaps-retract', label: 'Flaps', expectedState: 'RETRACT ON SCHEDULE' },
        ]
      },
      {
        id: 'climb-crj',
        title: 'Climb',
        items: [
          { id: 'crj7-climb-thrust', label: 'Thrust', expectedState: 'CLIMB' },
          { id: 'crj7-ap', label: 'Autopilot', expectedState: 'ENGAGE' },
          { id: 'crj7-alt-std', label: 'Altimeters', expectedState: 'STD ABOVE TRANS ALT' },
          { id: 'crj7-packs', label: 'Packs', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'cruise-crj',
        title: 'Cruise',
        items: [
          { id: 'crj7-cruise-alt', label: 'Altitude', expectedState: 'VERIFY ON FMS' },
          { id: 'crj7-fuel-bal', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'crj7-eicas-crz', label: 'EICAS', expectedState: 'MONITOR' },
        ]
      },
      {
        id: 'descent-crj',
        title: 'Descent',
        items: [
          { id: 'crj7-desc-brief', label: 'Approach Briefing', expectedState: 'COMPLETE' },
          { id: 'crj7-alt-arrival', label: 'Altimeters', expectedState: 'SET' },
          { id: 'crj7-seatbelt', label: 'Seatbelt Sign', expectedState: 'ON' },
          { id: 'crj7-land-lights-desc', label: 'Landing Lights', expectedState: 'ON BELOW 10,000FT' },
        ]
      },
      {
        id: 'approach-crj',
        title: 'Approach',
        items: [
          { id: 'crj7-app-flaps', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'crj7-app-gear', label: 'Landing Gear', expectedState: 'DOWN & 3 GREEN' },
          { id: 'crj7-app-speed', label: 'Approach Speed', expectedState: 'VREF + CORRECTIONS' },
          { id: 'crj7-spoilers-app', label: 'Spoilers', expectedState: 'ARMED' },
        ]
      },
      {
        id: 'landing-crj',
        title: 'Landing',
        items: [
          { id: 'crj7-land-flaps', label: 'Flaps', expectedState: '45' },
          { id: 'crj7-land-speed', label: 'Speed', expectedState: 'VREF' },
          { id: 'crj7-reverse', label: 'Thrust Reversers', expectedState: 'AS REQUIRED' },
          { id: 'crj7-braking', label: 'Braking', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'after-landing-crj',
        title: 'After Landing',
        items: [
          { id: 'crj7-flaps-up', label: 'Flaps', expectedState: 'UP' },
          { id: 'crj7-spoilers-ret', label: 'Spoilers', expectedState: 'RETRACT' },
          { id: 'crj7-transponder-stby', label: 'Transponder', expectedState: 'STBY' },
          { id: 'crj7-apu-start-land', label: 'APU', expectedState: 'START' },
          { id: 'crj7-strobes-off', label: 'Strobe Lights', expectedState: 'OFF' },
        ]
      },
      {
        id: 'shutdown-crj',
        title: 'Shutdown',
        items: [
          { id: 'crj7-park-brake-set', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'crj7-fuel-levers-off', label: 'Fuel Levers', expectedState: 'OFF' },
          { id: 'crj7-apu-gen-on', label: 'APU Generator', expectedState: 'ON' },
          { id: 'crj7-irs-off', label: 'IRS', expectedState: 'OFF' },
          { id: 'crj7-battery-off', label: 'Battery Master', expectedState: 'OFF' },
        ]
      }
    ],
  },
  b350: {
    planeId: 'b350',
    phases: [
      {
        id: 'pre-start-b350',
        title: 'Pre-Start',
        items: [
          { id: 'b350-preflight', label: 'Preflight Inspection', expectedState: 'COMPLETE' },
          { id: 'b350-battery', label: 'Battery Switch', expectedState: 'ON' },
          { id: 'b350-avionics', label: 'Avionics Master', expectedState: 'OFF' },
          { id: 'b350-fuel-sel', label: 'Fuel Selectors', expectedState: 'ON' },
          { id: 'b350-prop-levers', label: 'Propeller Levers', expectedState: 'FULL FORWARD' },
          { id: 'b350-throttles', label: 'Power Levers', expectedState: 'IDLE' },
          { id: 'b350-cond-levers', label: 'Condition Levers', expectedState: 'FUEL CUTOFF' },
        ]
      },
      {
        id: 'eng-start-b350',
        title: 'Engine Start',
        items: [
          { id: 'b350-beacon-on', label: 'Beacon Light', expectedState: 'ON' },
          { id: 'b350-prop-clear', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'b350-start-l', label: 'Left Engine Start Button', expectedState: 'PRESS & HOLD' },
          { id: 'b350-ng-12', label: 'Ng (Left)', expectedState: 'MIN 12%' },
          { id: 'b350-cond-l', label: 'Left Condition Lever', expectedState: 'LOW IDLE' },
          { id: 'b350-itt-l', label: 'Left ITT', expectedState: 'MONITOR (MAX 1090°C)' },
          { id: 'b350-repeat-r', label: 'Right Engine', expectedState: 'REPEAT PROCEDURE' },
          { id: 'b350-gen-on', label: 'Generators (Both)', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-taxi-b350',
        title: 'Before Taxi',
        items: [
          { id: 'b350-avionics-on', label: 'Avionics Master', expectedState: 'ON' },
          { id: 'b350-flt-ctrl', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'b350-flt-instr', label: 'Flight Instruments', expectedState: 'SET' },
          { id: 'b350-trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
          { id: 'b350-taxi-light', label: 'Taxi Light', expectedState: 'ON' },
          { id: 'b350-pitot-heat', label: 'Pitot / Stall Heat', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-to-b350',
        title: 'Before Takeoff',
        items: [
          { id: 'b350-flaps-to', label: 'Flaps', expectedState: 'APPROACH (15°)' },
          { id: 'b350-props-full', label: 'Propeller Levers', expectedState: 'MAX RPM' },
          { id: 'b350-cond-high', label: 'Condition Levers', expectedState: 'HIGH IDLE' },
          { id: 'b350-ice-prot', label: 'Ice Protection', expectedState: 'AS REQUIRED' },
          { id: 'b350-land-lights-on', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'b350-strobes', label: 'Strobe Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'takeoff-b350',
        title: 'Takeoff',
        items: [
          { id: 'b350-power-set', label: 'Power Levers', expectedState: 'SET TAKEOFF TORQUE' },
          { id: 'b350-itt-to', label: 'ITT', expectedState: 'MONITOR' },
          { id: 'b350-rotate', label: 'Rotate', expectedState: '104 KIAS' },
          { id: 'b350-gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'b350-flaps-up', label: 'Flaps', expectedState: 'UP ABOVE 120 KIAS' },
        ]
      },
      {
        id: 'climb-b350',
        title: 'Climb',
        items: [
          { id: 'b350-climb-power', label: 'Power Levers', expectedState: 'MAX CLIMB TORQUE' },
          { id: 'b350-climb-speed', label: 'Airspeed', expectedState: '160 KIAS' },
          { id: 'b350-yaw-damp', label: 'Yaw Damper', expectedState: 'ON' },
          { id: 'b350-land-light-off', label: 'Landing Lights', expectedState: 'OFF ABOVE 10,000FT' },
        ]
      },
      {
        id: 'cruise-b350',
        title: 'Cruise',
        items: [
          { id: 'b350-cruise-power', label: 'Power Levers', expectedState: 'SET CRUISE TORQUE' },
          { id: 'b350-props-cruise', label: 'Propeller Levers', expectedState: 'SET CRUISE RPM' },
          { id: 'b350-fuel-bal', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'b350-ap-engage', label: 'Autopilot', expectedState: 'ENGAGE' },
        ]
      },
      {
        id: 'descent-b350',
        title: 'Descent',
        items: [
          { id: 'b350-desc-power', label: 'Power Levers', expectedState: 'AS REQUIRED' },
          { id: 'b350-alt-set', label: 'Altimeters', expectedState: 'SET' },
          { id: 'b350-prop-sync', label: 'Propeller Sync', expectedState: 'OFF' },
          { id: 'b350-seatbelt', label: 'Seatbelt Sign', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-landing-b350',
        title: 'Before Landing',
        items: [
          { id: 'b350-props-full-land', label: 'Propeller Levers', expectedState: 'MAX RPM' },
          { id: 'b350-cond-high-land', label: 'Condition Levers', expectedState: 'HIGH IDLE' },
          { id: 'b350-gear-down', label: 'Landing Gear', expectedState: 'DOWN & 3 GREEN' },
          { id: 'b350-flaps-land', label: 'Flaps', expectedState: 'FULL' },
          { id: 'b350-land-lights-land', label: 'Landing Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'after-landing-b350',
        title: 'After Landing',
        items: [
          { id: 'b350-flaps-ret', label: 'Flaps', expectedState: 'UP' },
          { id: 'b350-land-lights-off', label: 'Landing / Strobe Lights', expectedState: 'OFF' },
          { id: 'b350-cond-low', label: 'Condition Levers', expectedState: 'LOW IDLE' },
          { id: 'b350-taxi-light-land', label: 'Taxi Light', expectedState: 'ON' },
        ]
      },
      {
        id: 'shutdown-b350',
        title: 'Shutdown',
        items: [
          { id: 'b350-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'b350-cond-cutoff', label: 'Condition Levers', expectedState: 'FUEL CUTOFF' },
          { id: 'b350-avionics-off', label: 'Avionics Master', expectedState: 'OFF' },
          { id: 'b350-gen-off', label: 'Generators', expectedState: 'OFF' },
          { id: 'b350-battery-off', label: 'Battery Switch', expectedState: 'OFF' },
        ]
      }
    ],
  },
  sr22: {
    planeId: 'sr22',
    phases: [
      {
        id: 'preflight-sr22',
        title: 'Pre-Flight',
        items: [
          { id: 'sr22-walkaround', label: 'Walkaround Inspection', expectedState: 'COMPLETE' },
          { id: 'sr22-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK BOTH TANKS' },
          { id: 'sr22-oil', label: 'Oil Level', expectedState: 'CHECK (6-8 QTS)' },
          { id: 'sr22-caps', label: 'CAPS Pin', expectedState: 'REMOVE' },
          { id: 'sr22-tiedowns', label: 'Tiedowns / Chocks', expectedState: 'REMOVED' },
        ]
      },
      {
        id: 'before-start-sr22',
        title: 'Before Start',
        items: [
          { id: 'sr22-seats', label: 'Seats / Belts / Harness', expectedState: 'ADJUSTED & LOCKED' },
          { id: 'sr22-circuit-brk', label: 'Circuit Breakers', expectedState: 'CHECK IN' },
          { id: 'sr22-bat-master', label: 'Battery Master', expectedState: 'ON' },
          { id: 'sr22-alt-master', label: 'Alternator Master', expectedState: 'ON' },
          { id: 'sr22-fuel-sel', label: 'Fuel Selector', expectedState: 'FULLEST TANK' },
          { id: 'sr22-flaps-up', label: 'Flaps', expectedState: 'UP' },
        ]
      },
      {
        id: 'eng-start-sr22',
        title: 'Engine Start',
        items: [
          { id: 'sr22-mixture', label: 'Mixture', expectedState: 'FULL RICH' },
          { id: 'sr22-throttle', label: 'Throttle', expectedState: 'OPEN 1/4 INCH' },
          { id: 'sr22-fuel-pump', label: 'Fuel Pump', expectedState: 'BOOST' },
          { id: 'sr22-prop-clear', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'sr22-ignition', label: 'Ignition Switch', expectedState: 'START' },
          { id: 'sr22-oil-press', label: 'Oil Pressure', expectedState: 'CHECK GREEN' },
        ]
      },
      {
        id: 'taxi-sr22',
        title: 'Taxi',
        items: [
          { id: 'sr22-avionics', label: 'Avionics Master', expectedState: 'ON' },
          { id: 'sr22-pfd', label: 'PFD / MFD', expectedState: 'CHECK' },
          { id: 'sr22-transponder', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'sr22-brakes-test', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'sr22-nav-light', label: 'Navigation Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-to-sr22',
        title: 'Before Takeoff',
        items: [
          { id: 'sr22-runup-1700', label: 'Throttle', expectedState: '1700 RPM' },
          { id: 'sr22-mags', label: 'Magnetos', expectedState: 'CHECK (MAX DROP 150)' },
          { id: 'sr22-engine-params', label: 'Engine Parameters', expectedState: 'GREEN' },
          { id: 'sr22-mixture-to', label: 'Mixture', expectedState: 'RICH (OR LEAN FOR FIELD ELEV)' },
          { id: 'sr22-flaps-to', label: 'Flaps', expectedState: '50% (IF SHORT FIELD)' },
          { id: 'sr22-transponder-alt', label: 'Transponder', expectedState: 'ALT' },
          { id: 'sr22-land-light-on', label: 'Landing Light', expectedState: 'ON' },
        ]
      },
      {
        id: 'takeoff-sr22',
        title: 'Takeoff',
        items: [
          { id: 'sr22-throttle-full', label: 'Throttle', expectedState: 'FULL POWER' },
          { id: 'sr22-rotate', label: 'Rotate', expectedState: '73 KIAS' },
          { id: 'sr22-climb-vy', label: 'Climb Speed', expectedState: '88 KIAS (Vy)' },
          { id: 'sr22-flaps-up-to', label: 'Flaps', expectedState: 'UP ABOVE 85 KIAS' },
        ]
      },
      {
        id: 'climb-sr22',
        title: 'Climb',
        items: [
          { id: 'sr22-climb-power', label: 'Throttle', expectedState: 'FULL OR CRUISE CLIMB' },
          { id: 'sr22-mixture-climb', label: 'Mixture', expectedState: 'LEAN ABOVE 3000FT' },
          { id: 'sr22-eng-monitor', label: 'Engine Monitor', expectedState: 'CHECK' },
          { id: 'sr22-fuel-switch', label: 'Fuel Selector', expectedState: 'SWITCH TANKS IF NEEDED' },
        ]
      },
      {
        id: 'cruise-sr22',
        title: 'Cruise',
        items: [
          { id: 'sr22-cruise-power', label: 'Throttle', expectedState: '65-75% POWER' },
          { id: 'sr22-mixture-cruise', label: 'Mixture', expectedState: 'LEAN (PEAK EGT OR LOP)' },
          { id: 'sr22-trim', label: 'Elevator Trim', expectedState: 'ADJUST' },
          { id: 'sr22-ap', label: 'Autopilot', expectedState: 'ENGAGE AS DESIRED' },
        ]
      },
      {
        id: 'descent-sr22',
        title: 'Descent',
        items: [
          { id: 'sr22-mixture-desc', label: 'Mixture', expectedState: 'ENRICH GRADUALLY' },
          { id: 'sr22-throttle-desc', label: 'Throttle', expectedState: 'AS REQUIRED' },
          { id: 'sr22-fuel-desc', label: 'Fuel Selector', expectedState: 'FULLEST TANK' },
        ]
      },
      {
        id: 'before-landing-sr22',
        title: 'Before Landing',
        items: [
          { id: 'sr22-seatbelts', label: 'Seats / Belts / Harness', expectedState: 'SECURE' },
          { id: 'sr22-mixture-rich', label: 'Mixture', expectedState: 'FULL RICH' },
          { id: 'sr22-fuel-pump-land', label: 'Fuel Pump', expectedState: 'BOOST' },
          { id: 'sr22-land-light', label: 'Landing Light', expectedState: 'ON' },
          { id: 'sr22-flaps-land', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'sr22-speed-land', label: 'Approach Speed', expectedState: '80-85 KIAS' },
        ]
      },
      {
        id: 'after-landing-sr22',
        title: 'After Landing',
        items: [
          { id: 'sr22-flaps-ret', label: 'Flaps', expectedState: 'UP' },
          { id: 'sr22-land-light-off', label: 'Landing Light', expectedState: 'OFF' },
          { id: 'sr22-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'sr22-fuel-pump-off', label: 'Fuel Pump', expectedState: 'OFF' },
        ]
      },
      {
        id: 'shutdown-sr22',
        title: 'Shutdown',
        items: [
          { id: 'sr22-avionics-off', label: 'Avionics Master', expectedState: 'OFF' },
          { id: 'sr22-mixture-cutoff', label: 'Mixture', expectedState: 'IDLE CUTOFF' },
          { id: 'sr22-ignition-off', label: 'Ignition Switch', expectedState: 'OFF' },
          { id: 'sr22-alt-off', label: 'Alternator Master', expectedState: 'OFF' },
          { id: 'sr22-bat-off', label: 'Battery Master', expectedState: 'OFF' },
        ]
      }
    ],
  },
  da62: {
    planeId: 'da62',
    phases: [
      {
        id: 'preflight-da62',
        title: 'Pre-Flight',
        items: [
          { id: 'da62-walkaround', label: 'Walkaround Inspection', expectedState: 'COMPLETE' },
          { id: 'da62-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK ALL TANKS' },
          { id: 'da62-oil', label: 'Engine Oil (Both)', expectedState: 'CHECK' },
          { id: 'da62-gust-lock', label: 'Gust Lock', expectedState: 'REMOVE' },
          { id: 'da62-tiedowns', label: 'Tiedowns / Chocks', expectedState: 'REMOVED' },
          { id: 'da62-doors', label: 'Doors / Canopy', expectedState: 'CHECK OPERATION' },
        ]
      },
      {
        id: 'eng-start-da62',
        title: 'Engine Start',
        items: [
          { id: 'da62-battery', label: 'Master Switch', expectedState: 'ON' },
          { id: 'da62-fuel-sel', label: 'Fuel Selectors (Both)', expectedState: 'ON' },
          { id: 'da62-ecl', label: 'ECU / FADEC', expectedState: 'CHECK' },
          { id: 'da62-prop-clear', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'da62-start-l', label: 'Left Engine', expectedState: 'START' },
          { id: 'da62-start-r', label: 'Right Engine', expectedState: 'START' },
          { id: 'da62-gen-both', label: 'Generators (Both)', expectedState: 'ON & CHECK' },
          { id: 'da62-eng-params', label: 'Engine Parameters', expectedState: 'GREEN' },
        ]
      },
      {
        id: 'before-taxi-da62',
        title: 'Before Taxi',
        items: [
          { id: 'da62-avionics', label: 'Avionics', expectedState: 'ON' },
          { id: 'da62-garmin', label: 'G1000 NXi', expectedState: 'CHECK' },
          { id: 'da62-flt-ctrl', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'da62-trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
          { id: 'da62-brakes-test', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'da62-nav-lights', label: 'Navigation Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'before-to-da62',
        title: 'Before Takeoff',
        items: [
          { id: 'da62-flaps-to', label: 'Flaps', expectedState: 'T/O (APPROACH)' },
          { id: 'da62-throttle-check', label: 'Power Levers', expectedState: 'CHECK BOTH ENGINES' },
          { id: 'da62-prop-set', label: 'Propeller Levers', expectedState: 'MAX RPM' },
          { id: 'da62-fuel-pump', label: 'Fuel Transfer Pumps', expectedState: 'AUTO' },
          { id: 'da62-transponder', label: 'Transponder', expectedState: 'ALT' },
          { id: 'da62-land-light-on', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'da62-strobes', label: 'Strobe Lights', expectedState: 'ON' },
        ]
      },
      {
        id: 'takeoff-da62',
        title: 'Takeoff',
        items: [
          { id: 'da62-power-full', label: 'Power Levers', expectedState: 'FULL FORWARD' },
          { id: 'da62-eng-sync', label: 'Engine Parameters', expectedState: 'CHECK SYMMETRIC' },
          { id: 'da62-rotate', label: 'Rotate', expectedState: '77 KIAS' },
          { id: 'da62-gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'da62-flaps-up-to', label: 'Flaps', expectedState: 'UP ABOVE 85 KIAS' },
        ]
      },
      {
        id: 'climb-da62',
        title: 'Climb',
        items: [
          { id: 'da62-climb-power', label: 'Power Levers', expectedState: 'CLIMB POWER' },
          { id: 'da62-climb-speed', label: 'Climb Speed', expectedState: '100 KIAS' },
          { id: 'da62-eng-monitor', label: 'Engine Instruments', expectedState: 'MONITOR' },
          { id: 'da62-land-light-climb', label: 'Landing Lights', expectedState: 'OFF ABOVE 5000FT' },
        ]
      },
      {
        id: 'cruise-da62',
        title: 'Cruise',
        items: [
          { id: 'da62-cruise-power', label: 'Power Levers', expectedState: 'SET CRUISE POWER' },
          { id: 'da62-props-cruise', label: 'Propeller Levers', expectedState: 'SET CRUISE RPM' },
          { id: 'da62-trim-cruise', label: 'Elevator Trim', expectedState: 'ADJUST' },
          { id: 'da62-fuel-balance', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'da62-ap-engage', label: 'Autopilot', expectedState: 'ENGAGE AS DESIRED' },
        ]
      },
      {
        id: 'descent-da62',
        title: 'Descent',
        items: [
          { id: 'da62-desc-power', label: 'Power Levers', expectedState: 'AS REQUIRED' },
          { id: 'da62-desc-speed', label: 'Airspeed', expectedState: 'MONITOR (VNE LIMITS)' },
          { id: 'da62-alt-set', label: 'Altimeters', expectedState: 'SET' },
        ]
      },
      {
        id: 'before-landing-da62',
        title: 'Before Landing',
        items: [
          { id: 'da62-seatbelts', label: 'Seats / Belts', expectedState: 'SECURE' },
          { id: 'da62-gear-down', label: 'Landing Gear', expectedState: 'DOWN & 3 GREEN' },
          { id: 'da62-props-full-land', label: 'Propeller Levers', expectedState: 'MAX RPM' },
          { id: 'da62-flaps-land', label: 'Flaps', expectedState: 'LDG (FULL)' },
          { id: 'da62-land-light-land', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'da62-speed-land', label: 'Approach Speed', expectedState: '79 KIAS' },
        ]
      },
      {
        id: 'after-landing-da62',
        title: 'After Landing',
        items: [
          { id: 'da62-flaps-ret', label: 'Flaps', expectedState: 'UP' },
          { id: 'da62-strobes-off', label: 'Strobe / Landing Lights', expectedState: 'OFF' },
          { id: 'da62-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
        ]
      },
      {
        id: 'shutdown-da62',
        title: 'Shutdown',
        items: [
          { id: 'da62-avionics-off', label: 'Avionics', expectedState: 'OFF' },
          { id: 'da62-eng-off-l', label: 'Left Engine', expectedState: 'OFF' },
          { id: 'da62-eng-off-r', label: 'Right Engine', expectedState: 'OFF' },
          { id: 'da62-gen-off', label: 'Generators', expectedState: 'OFF' },
          { id: 'da62-master-off', label: 'Master Switch', expectedState: 'OFF' },
        ]
      }
    ],
  },
  a330: {
    planeId: 'a330',
    phases: [
      {
        id: 'cockpit-prep-a330',
        title: 'Cockpit Preparation',
        items: [
          { id: 'a330-battery', label: 'Batteries (1 & 2)', expectedState: 'ON' },
          { id: 'a330-ext-pwr', label: 'External Power', expectedState: 'ON' },
          { id: 'a330-adirs', label: 'ADIRS (All 3)', expectedState: 'NAV' },
          { id: 'a330-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'a330-apu-start', label: 'APU', expectedState: 'START' },
          { id: 'a330-fmgc', label: 'FMGC (Both)', expectedState: 'PROGRAM' },
          { id: 'a330-no-smoking', label: 'No Smoking / Seatbelts', expectedState: 'ON / AUTO' },
        ]
      },
      {
        id: 'before-pushback-a330',
        title: 'Before Pushback',
        items: [
          { id: 'a330-beacon', label: 'Beacon Light', expectedState: 'ON' },
          { id: 'a330-doors', label: 'Doors', expectedState: 'CLOSED (ECAM CHECK)' },
          { id: 'a330-park-brake', label: 'Parking Brake', expectedState: 'AS REQUIRED' },
          { id: 'a330-apu-bleed', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'a330-fctl-check', label: 'Flight Control Check', expectedState: 'COMPLETE' },
        ]
      },
      {
        id: 'eng-start-a330',
        title: 'Engine Start',
        items: [
          { id: 'a330-mode-ign', label: 'Engine Mode Selector', expectedState: 'IGN / START' },
          { id: 'a330-master-2', label: 'Engine 2 Master', expectedState: 'ON' },
          { id: 'a330-n2-rise-2', label: 'Engine 2 N2', expectedState: 'CONFIRM RISE' },
          { id: 'a330-master-1', label: 'Engine 1 Master', expectedState: 'ON' },
          { id: 'a330-n2-rise-1', label: 'Engine 1 N1/N2', expectedState: 'STABILIZED' },
          { id: 'a330-mode-norm', label: 'Engine Mode Selector', expectedState: 'NORM' },
        ]
      },
      {
        id: 'taxi-a330',
        title: 'Taxi',
        items: [
          { id: 'a330-nose-taxi', label: 'Nose Light', expectedState: 'TAXI' },
          { id: 'a330-rwy-turnoff', label: 'Runway Turnoff Lights', expectedState: 'ON' },
          { id: 'a330-apu-bleed-off', label: 'APU Bleed', expectedState: 'OFF' },
          { id: 'a330-flt-ctrl-taxi', label: 'Flight Controls', expectedState: 'CHECK' },
          { id: 'a330-brakes-taxi', label: 'Brakes', expectedState: 'CHECK' },
        ]
      },
      {
        id: 'before-to-a330',
        title: 'Before Takeoff',
        items: [
          { id: 'a330-flaps-set', label: 'Flaps', expectedState: 'SET (CONF 1+F / 2 / 3)' },
          { id: 'a330-to-config', label: 'Takeoff Config', expectedState: 'TEST NORMAL' },
          { id: 'a330-auto-brake', label: 'Auto Brake', expectedState: 'MAX' },
          { id: 'a330-transponder', label: 'Transponder', expectedState: 'ON' },
          { id: 'a330-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'a330-strobes', label: 'Strobe Lights', expectedState: 'ON' },
          { id: 'a330-tcas', label: 'TCAS', expectedState: 'TA/RA' },
        ]
      },
      {
        id: 'climb-a330',
        title: 'Climb',
        items: [
          { id: 'a330-gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'a330-flaps-ret', label: 'Flaps', expectedState: 'RETRACT ON SCHEDULE (S/F)' },
          { id: 'a330-ap-on', label: 'Autopilot', expectedState: 'ENGAGE' },
          { id: 'a330-athr', label: 'Autothrust', expectedState: 'ACTIVE' },
          { id: 'a330-alt-std', label: 'Altimeters', expectedState: 'STD ABOVE TRANS ALT' },
        ]
      },
      {
        id: 'cruise-a330',
        title: 'Cruise',
        items: [
          { id: 'a330-ecam-cruise', label: 'ECAM Memos', expectedState: 'CHECK' },
          { id: 'a330-fuel-bal', label: 'Fuel Balance / Quantity', expectedState: 'CHECK' },
          { id: 'a330-fmgc-prog', label: 'FMGC PROG Page', expectedState: 'MONITOR' },
          { id: 'a330-step-climb', label: 'Step Climb', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'descent-a330',
        title: 'Descent',
        items: [
          { id: 'a330-desc-prep', label: 'Descent Preparation', expectedState: 'COMPLETE' },
          { id: 'a330-alt-set', label: 'Altimeters', expectedState: 'SET (QNH)' },
          { id: 'a330-seatbelt', label: 'Seatbelt Sign', expectedState: 'ON' },
          { id: 'a330-land-lights-desc', label: 'Landing Lights', expectedState: 'ON BELOW FL100' },
          { id: 'a330-ls-pb', label: 'LS Pushbutton', expectedState: 'AS REQUIRED' },
        ]
      },
      {
        id: 'approach-a330',
        title: 'Approach',
        items: [
          { id: 'a330-app-phase', label: 'FMGC APPR Phase', expectedState: 'ACTIVATE' },
          { id: 'a330-app-speed', label: 'Managed Speed', expectedState: 'CONFIRM' },
          { id: 'a330-flaps-app', label: 'Flaps', expectedState: 'CONF 1 / 2 / 3' },
          { id: 'a330-gear-down', label: 'Landing Gear', expectedState: 'DOWN & 3 GREEN' },
        ]
      },
      {
        id: 'before-landing-a330',
        title: 'Before Landing',
        items: [
          { id: 'a330-flaps-full', label: 'Flaps', expectedState: 'CONF FULL' },
          { id: 'a330-spoilers-arm', label: 'Ground Spoilers', expectedState: 'ARMED' },
          { id: 'a330-autobrake-set', label: 'Autobrake', expectedState: 'MED / LOW' },
          { id: 'a330-ecam-landing', label: 'ECAM Landing Memo', expectedState: 'NO BLUE' },
          { id: 'a330-go-around', label: 'Go-Around Altitude', expectedState: 'SET IN FCU' },
        ]
      },
      {
        id: 'after-landing-a330',
        title: 'After Landing',
        items: [
          { id: 'a330-flaps-post', label: 'Flaps', expectedState: 'RETRACT' },
          { id: 'a330-spoilers-ret', label: 'Spoilers', expectedState: 'DISARMED' },
          { id: 'a330-radar-off', label: 'Weather Radar / PWS', expectedState: 'OFF' },
          { id: 'a330-apu-post', label: 'APU', expectedState: 'START' },
          { id: 'a330-nose-taxi-post', label: 'Nose Light', expectedState: 'TAXI' },
        ]
      },
      {
        id: 'parking-a330',
        title: 'Parking',
        items: [
          { id: 'a330-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'a330-eng-master-off', label: 'Engine Masters (Both)', expectedState: 'OFF' },
          { id: 'a330-seatbelt-off', label: 'Seatbelt Sign', expectedState: 'OFF' },
          { id: 'a330-apu-bleed-park', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'a330-ext-pwr-park', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
        ]
      },
      {
        id: 'securing-a330',
        title: 'Securing',
        items: [
          { id: 'a330-adirs-off', label: 'ADIRS (All 3)', expectedState: 'OFF' },
          { id: 'a330-apu-off', label: 'APU', expectedState: 'OFF' },
          { id: 'a330-oxy-off', label: 'Oxygen', expectedState: 'OFF' },
          { id: 'a330-emer-off', label: 'Emergency Lights', expectedState: 'OFF' },
          { id: 'a330-battery-off', label: 'Batteries (1 & 2)', expectedState: 'OFF' },
        ]
      }
    ],
  },
  tbm930: {
    planeId: 'tbm930',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start',
        items: [
          { id: 'battery', label: 'Battery', expectedState: 'ON' },
          { id: 'generator', label: 'Generator', expectedState: 'OFF' },
          { id: 'source', label: 'Source Selector', expectedState: 'BATT' },
          { id: 'fuel-sel', label: 'Fuel Selector', expectedState: 'AUTO' },
          { id: 'fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'inert-sep', label: 'Inertial Separator', expectedState: 'OFF' },
          { id: 'crash-lever', label: 'Crash Lever', expectedState: 'ON' },
          { id: 'throttle', label: 'Power Lever', expectedState: 'CUT OFF' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'aux-bp', label: 'Auxiliary Boost Pump', expectedState: 'ON' },
          { id: 'ignition', label: 'Ignition', expectedState: 'AUTO' },
          { id: 'starter', label: 'Starter', expectedState: 'ON' },
          { id: 'ng-check', label: 'Ng', expectedState: 'CHECK 13%' },
          { id: 'power-lever', label: 'Power Lever', expectedState: 'LOW IDLE' },
          { id: 'itt', label: 'ITT', expectedState: 'CHECK RISING' },
          { id: 'oil-press', label: 'Oil Pressure', expectedState: 'CHECK' },
          { id: 'generator-on', label: 'Generator', expectedState: 'MAIN' },
          { id: 'aux-bp-off', label: 'Auxiliary Boost Pump', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'avionics', label: 'Avionics', expectedState: 'ON' },
          { id: 'ap-disc', label: 'AP / Trims', expectedState: 'CHECK' },
          { id: 'flight-controls', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'flaps', label: 'Flaps', expectedState: 'UP' },
          { id: 'trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
          { id: 'de-ice', label: 'De-Ice Systems', expectedState: 'AS REQUIRED' },
          { id: 'pressurization', label: 'Pressurization', expectedState: 'SET' },
          { id: 'altimeter', label: 'Altimeter', expectedState: 'SET' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'taxi-light', label: 'Taxi Light', expectedState: 'ON' },
          { id: 'brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'nosewheel', label: 'Nosewheel Steering', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'flaps-to', label: 'Flaps', expectedState: 'TAKEOFF' },
          { id: 'trims-to', label: 'Trims', expectedState: 'SET' },
          { id: 'prop-rpm', label: 'Propeller RPM', expectedState: 'SET MAX' },
          { id: 'inert-sep-to', label: 'Inertial Separator', expectedState: 'AS REQUIRED' },
          { id: 'transponder', label: 'Transponder', expectedState: 'ALT' },
          { id: 'lights', label: 'Landing / Strobe Lights', expectedState: 'ON' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'power', label: 'Power Lever', expectedState: 'TAKEOFF' },
          { id: 'torque', label: 'Torque', expectedState: 'CHECK' },
          { id: 'rotate', label: 'Rotate', expectedState: '90 KIAS' },
          { id: 'positive-climb', label: 'Positive Rate', expectedState: 'GEAR UP' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'power-climb', label: 'Power', expectedState: 'MCT' },
          { id: 'flaps-up', label: 'Flaps', expectedState: 'UP' },
          { id: 'climb-speed', label: 'Airspeed', expectedState: '124 KIAS' },
          { id: 'pressurization-chk', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'engine-chk', label: 'Engine Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'power-cruise', label: 'Power', expectedState: 'SET CRUISE' },
          { id: 'prop-cruise', label: 'Propeller', expectedState: 'SET' },
          { id: 'fuel-balance', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'trim-cruise', label: 'Trim', expectedState: 'ADJUST' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'atis', label: 'ATIS / Weather', expectedState: 'CHECK' },
          { id: 'altimeter-desc', label: 'Altimeter', expectedState: 'SET' },
          { id: 'pressurization-desc', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'power-desc', label: 'Power', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'speed-app', label: 'Airspeed', expectedState: 'VREF + 10' },
          { id: 'flaps-app', label: 'Flaps', expectedState: 'APPROACH' },
          { id: 'landing-light', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'gear-dn', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'flaps-land', label: 'Flaps', expectedState: 'LANDING' },
          { id: 'speed-land', label: 'Airspeed', expectedState: 'VREF 85 KIAS' },
          { id: 'power-idle', label: 'Power', expectedState: 'IDLE ON TOUCHDOWN' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'flaps-retract', label: 'Flaps', expectedState: 'UP' },
          { id: 'lights-off', label: 'Landing / Strobe Lights', expectedState: 'OFF' },
          { id: 'transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'taxi-light-on', label: 'Taxi Light', expectedState: 'ON' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'parking-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'avionics-off', label: 'Avionics', expectedState: 'OFF' },
          { id: 'power-off', label: 'Power Lever', expectedState: 'CUT OFF' },
          { id: 'gen-off', label: 'Generator', expectedState: 'OFF' },
          { id: 'battery-off', label: 'Battery', expectedState: 'OFF' },
        ],
      },
    ],
  },
  pc12: {
    planeId: 'pc12',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start',
        items: [
          { id: 'pc12-battery', label: 'Battery Master', expectedState: 'ON' },
          { id: 'pc12-gen', label: 'Generator', expectedState: 'OFF' },
          { id: 'pc12-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'pc12-fuel-sel', label: 'Fuel Selector', expectedState: 'ON' },
          { id: 'pc12-condition', label: 'Condition Lever', expectedState: 'FUEL CUT OFF' },
          { id: 'pc12-flaps', label: 'Flaps', expectedState: 'UP' },
          { id: 'pc12-trim', label: 'Elevator Trim', expectedState: 'SET FOR TAKEOFF' },
          { id: 'pc12-press', label: 'Pressurization', expectedState: 'SET' },
          { id: 'pc12-bleed', label: 'Bleed Air', expectedState: 'OFF' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'pc12-prop-area', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'pc12-ignition', label: 'Ignition & Start', expectedState: 'ON' },
          { id: 'pc12-ng', label: 'Ng', expectedState: 'CHECK 13%' },
          { id: 'pc12-condition-idle', label: 'Condition Lever', expectedState: 'LOW IDLE' },
          { id: 'pc12-itt', label: 'ITT', expectedState: 'CHECK (MAX 1000°C)' },
          { id: 'pc12-oil', label: 'Oil Pressure', expectedState: 'CHECK GREEN' },
          { id: 'pc12-gen-on', label: 'Generator', expectedState: 'ON' },
          { id: 'pc12-bleed-on', label: 'Bleed Air', expectedState: 'ON' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'pc12-avionics', label: 'Avionics', expectedState: 'ON' },
          { id: 'pc12-flt-controls', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'pc12-env', label: 'Environmental System', expectedState: 'SET' },
          { id: 'pc12-altimeter', label: 'Altimeter', expectedState: 'SET' },
          { id: 'pc12-ap-test', label: 'Autopilot', expectedState: 'TEST' },
          { id: 'pc12-deice', label: 'De-Ice Systems', expectedState: 'AS REQUIRED' },
          { id: 'pc12-press-set', label: 'Pressurization', expectedState: 'SET DESTINATION' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'pc12-taxi-light', label: 'Taxi Light', expectedState: 'ON' },
          { id: 'pc12-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'pc12-hsi', label: 'HSI / DG', expectedState: 'SET' },
          { id: 'pc12-nosewheel', label: 'Nosewheel Steering', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'pc12-flaps-to', label: 'Flaps', expectedState: '15°' },
          { id: 'pc12-condition-hi', label: 'Condition Lever', expectedState: 'HIGH IDLE' },
          { id: 'pc12-prop-max', label: 'Propeller', expectedState: 'MAX RPM' },
          { id: 'pc12-trims-to', label: 'Trims', expectedState: 'SET' },
          { id: 'pc12-transponder', label: 'Transponder', expectedState: 'ALT' },
          { id: 'pc12-lights-to', label: 'Landing / Strobe Lights', expectedState: 'ON' },
          { id: 'pc12-inert-sep', label: 'Inertial Separator', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'pc12-power-to', label: 'Power Lever', expectedState: 'TAKEOFF' },
          { id: 'pc12-torque-chk', label: 'Torque', expectedState: 'CHECK' },
          { id: 'pc12-rotate', label: 'Rotate', expectedState: '85 KIAS' },
          { id: 'pc12-gear-up', label: 'Landing Gear', expectedState: 'UP' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'pc12-power-climb', label: 'Power', expectedState: 'MCT' },
          { id: 'pc12-flaps-climb', label: 'Flaps', expectedState: 'UP' },
          { id: 'pc12-climb-speed', label: 'Airspeed', expectedState: '120 KIAS' },
          { id: 'pc12-press-climb', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'pc12-eng-inst', label: 'Engine Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'pc12-power-cruise', label: 'Power', expectedState: 'SET CRUISE' },
          { id: 'pc12-prop-cruise', label: 'Propeller', expectedState: 'SET 1600-1700 RPM' },
          { id: 'pc12-condition-cruise', label: 'Condition Lever', expectedState: 'MIN FOR SMOOTH OPS' },
          { id: 'pc12-fuel-bal', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'pc12-trim-adj', label: 'Trim', expectedState: 'ADJUST' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'pc12-atis', label: 'ATIS / Weather', expectedState: 'CHECK' },
          { id: 'pc12-altimeter-desc', label: 'Altimeter', expectedState: 'SET' },
          { id: 'pc12-press-desc', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'pc12-power-desc', label: 'Power', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'pc12-speed-app', label: 'Airspeed', expectedState: 'VREF + 10' },
          { id: 'pc12-flaps-app', label: 'Flaps', expectedState: '15°' },
          { id: 'pc12-gear-dn', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'pc12-land-light', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'pc12-condition-hi-app', label: 'Condition Lever', expectedState: 'HIGH IDLE' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'pc12-flaps-land', label: 'Flaps', expectedState: '40°' },
          { id: 'pc12-speed-land', label: 'Airspeed', expectedState: 'VREF 80 KIAS' },
          { id: 'pc12-power-land', label: 'Power', expectedState: 'IDLE ON TOUCHDOWN' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'pc12-flaps-up', label: 'Flaps', expectedState: 'UP' },
          { id: 'pc12-condition-low', label: 'Condition Lever', expectedState: 'LOW IDLE' },
          { id: 'pc12-lights-al', label: 'Landing / Strobe Lights', expectedState: 'OFF' },
          { id: 'pc12-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'pc12-taxi-light-al', label: 'Taxi Light', expectedState: 'ON' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'pc12-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'pc12-avionics-off', label: 'Avionics', expectedState: 'OFF' },
          { id: 'pc12-bleed-off', label: 'Bleed Air', expectedState: 'OFF' },
          { id: 'pc12-condition-off', label: 'Condition Lever', expectedState: 'FUEL CUT OFF' },
          { id: 'pc12-gen-off', label: 'Generator', expectedState: 'OFF' },
          { id: 'pc12-battery-off', label: 'Battery Master', expectedState: 'OFF' },
        ],
      },
    ],
  },
  b787: {
    planeId: 'b787',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'b787-battery', label: 'Battery Switch', expectedState: 'ON' },
          { id: 'b787-ext-pwr', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
          { id: 'b787-irs', label: 'IRS Selectors (Both)', expectedState: 'NAV' },
          { id: 'b787-efb', label: 'Electronic Flight Bag', expectedState: 'ON & LOADED' },
          { id: 'b787-fmc', label: 'FMC', expectedState: 'PROGRAM ROUTE' },
          { id: 'b787-mcp', label: 'MCP', expectedState: 'SET V-SPEEDS' },
          { id: 'b787-hyd', label: 'Hydraulic Pumps', expectedState: 'ON' },
          { id: 'b787-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'b787-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'b787-signs', label: 'Seatbelt / No Smoking Signs', expectedState: 'ON' },
        ],
      },
      {
        id: 'apu-start',
        title: 'APU Start',
        items: [
          { id: 'b787-apu-sw', label: 'APU Switch', expectedState: 'START -> ON' },
          { id: 'b787-apu-gen', label: 'APU Generators', expectedState: 'ON' },
          { id: 'b787-apu-bleed', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'b787-ext-pwr-off', label: 'External Power', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'b787-probe-heat', label: 'Probe Heat', expectedState: 'ON' },
          { id: 'b787-wing-ai', label: 'Wing Anti-Ice', expectedState: 'AS REQUIRED' },
          { id: 'b787-eng-ai', label: 'Engine Anti-Ice', expectedState: 'AS REQUIRED' },
          { id: 'b787-packs', label: 'Pack Switches', expectedState: 'AUTO' },
          { id: 'b787-fuel-pumps', label: 'Fuel Pumps', expectedState: 'ON' },
          { id: 'b787-beacon', label: 'Beacon', expectedState: 'ON' },
          { id: 'b787-doors', label: 'Doors', expectedState: 'CLOSED' },
          { id: 'b787-flight-ctrl', label: 'Flight Controls', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'b787-packs-off', label: 'Packs', expectedState: 'OFF' },
          { id: 'b787-start-sw-2', label: 'Engine 2 Start Switch', expectedState: 'START' },
          { id: 'b787-n2-rise-2', label: 'Engine 2 N2', expectedState: 'CHECK RISING' },
          { id: 'b787-fuel-2', label: 'Engine 2 Fuel Lever', expectedState: 'RUN (AT 25% N2)' },
          { id: 'b787-egt-2', label: 'Engine 2 EGT', expectedState: 'CHECK' },
          { id: 'b787-start-sw-1', label: 'Engine 1 Start Switch', expectedState: 'START' },
          { id: 'b787-n2-rise-1', label: 'Engine 1 N2', expectedState: 'CHECK RISING' },
          { id: 'b787-fuel-1', label: 'Engine 1 Fuel Lever', expectedState: 'RUN (AT 25% N2)' },
          { id: 'b787-egt-1', label: 'Engine 1 EGT', expectedState: 'CHECK' },
          { id: 'b787-packs-on', label: 'Packs', expectedState: 'AUTO' },
          { id: 'b787-apu-off', label: 'APU', expectedState: 'OFF' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'b787-taxi-light', label: 'Taxi Lights', expectedState: 'ON' },
          { id: 'b787-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'b787-instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'b787-nosewheel', label: 'Nosewheel Steering', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'b787-flaps-to', label: 'Flaps', expectedState: 'SET FOR TAKEOFF' },
          { id: 'b787-spoilers', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'b787-autobrake', label: 'Autobrake', expectedState: 'RTO' },
          { id: 'b787-tcas', label: 'Transponder / TCAS', expectedState: 'TA/RA' },
          { id: 'b787-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'b787-strobe', label: 'Strobe Lights', expectedState: 'ON' },
          { id: 'b787-toga', label: 'TOGA', expectedState: 'CONFIRM SET' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'b787-thrust', label: 'Thrust Levers', expectedState: 'TOGA / FLEX' },
          { id: 'b787-n1', label: 'N1', expectedState: 'CHECK TARGET' },
          { id: 'b787-v1', label: 'V1', expectedState: 'CHECK' },
          { id: 'b787-vr', label: 'Rotate (VR)', expectedState: 'ROTATE' },
          { id: 'b787-pos-rate', label: 'Positive Rate', expectedState: 'GEAR UP' },
          { id: 'b787-lnav', label: 'LNAV', expectedState: 'ENGAGE' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'b787-thrust-climb', label: 'Thrust', expectedState: 'CLIMB' },
          { id: 'b787-flaps-climb', label: 'Flaps', expectedState: 'UP (ON SCHEDULE)' },
          { id: 'b787-gear-off', label: 'Landing Gear Lever', expectedState: 'OFF' },
          { id: 'b787-vnav', label: 'VNAV', expectedState: 'ENGAGE' },
          { id: 'b787-press-climb', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'b787-alt-set', label: 'Altimeter', expectedState: 'SET (18000: STD)' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'b787-cruise-alt', label: 'Cruise Altitude', expectedState: 'VERIFY' },
          { id: 'b787-fuel-cruise', label: 'Fuel', expectedState: 'CHECK BALANCE' },
          { id: 'b787-eng-cruise', label: 'Engine Parameters', expectedState: 'CHECK' },
          { id: 'b787-fmc-prog', label: 'FMC Progress', expectedState: 'MONITOR' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'b787-atis-desc', label: 'ATIS', expectedState: 'CHECK' },
          { id: 'b787-fmc-arr', label: 'FMC Arrival', expectedState: 'VERIFY' },
          { id: 'b787-altimeter-desc', label: 'Altimeter', expectedState: 'SET (BELOW 18000)' },
          { id: 'b787-press-desc', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'b787-speed-brake', label: 'Speed Brake', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'b787-app-speed', label: 'Approach Speed', expectedState: 'SET IN MCP' },
          { id: 'b787-autobrake-app', label: 'Autobrake', expectedState: '3' },
          { id: 'b787-flaps-app', label: 'Flaps', expectedState: 'SET 20' },
          { id: 'b787-gear-app', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'b787-spoilers-app', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'b787-land-lights-app', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'b787-app-mode', label: 'APP / ILS', expectedState: 'ENGAGE' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'b787-flaps-land', label: 'Flaps', expectedState: 'FULL (30)' },
          { id: 'b787-vref', label: 'Airspeed', expectedState: 'VREF' },
          { id: 'b787-thrust-idle', label: 'Thrust', expectedState: 'IDLE AT THRESHOLD' },
          { id: 'b787-reversers', label: 'Reverse Thrust', expectedState: 'DEPLOY' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'b787-spoilers-ret', label: 'Spoilers', expectedState: 'RETRACT' },
          { id: 'b787-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'b787-strobe-off', label: 'Strobe Lights', expectedState: 'OFF' },
          { id: 'b787-land-lights-off', label: 'Landing Lights', expectedState: 'OFF' },
          { id: 'b787-taxi-light-al', label: 'Taxi Lights', expectedState: 'ON' },
          { id: 'b787-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'b787-apu-al', label: 'APU', expectedState: 'START' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'b787-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'b787-fuel-levers', label: 'Fuel Levers (Both)', expectedState: 'CUT OFF' },
          { id: 'b787-seatbelt-off', label: 'Seatbelt Sign', expectedState: 'OFF' },
          { id: 'b787-apu-bleed-sd', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'b787-hyd-off', label: 'Hydraulic Pumps', expectedState: 'OFF' },
          { id: 'b787-irs-off', label: 'IRS', expectedState: 'OFF' },
          { id: 'b787-battery-off', label: 'Battery Switch', expectedState: 'OFF' },
        ],
      },
    ],
  },
  b777: {
    planeId: 'b777',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'b777-battery', label: 'Battery Switch', expectedState: 'ON' },
          { id: 'b777-ext-pwr', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
          { id: 'b777-irs', label: 'IRS Selectors (All 3)', expectedState: 'NAV' },
          { id: 'b777-fmc', label: 'FMC', expectedState: 'PROGRAM ROUTE' },
          { id: 'b777-mcp', label: 'MCP', expectedState: 'SET V-SPEEDS' },
          { id: 'b777-hyd', label: 'Hydraulic Pumps', expectedState: 'ON' },
          { id: 'b777-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'b777-pos-lights', label: 'Position Lights', expectedState: 'ON' },
          { id: 'b777-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'b777-signs', label: 'Seatbelt / No Smoking Signs', expectedState: 'ON' },
        ],
      },
      {
        id: 'apu-start',
        title: 'APU Start',
        items: [
          { id: 'b777-apu-sw', label: 'APU Switch', expectedState: 'START -> ON' },
          { id: 'b777-apu-gen', label: 'APU Generator Bus Switches', expectedState: 'ON' },
          { id: 'b777-apu-bleed', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'b777-ext-pwr-off', label: 'External Power', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'b777-generators', label: 'Generators', expectedState: 'ON' },
          { id: 'b777-probe-heat', label: 'Probe Heat', expectedState: 'ON' },
          { id: 'b777-wing-ai', label: 'Wing Anti-Ice', expectedState: 'AS REQUIRED' },
          { id: 'b777-eng-ai', label: 'Engine Anti-Ice', expectedState: 'AS REQUIRED' },
          { id: 'b777-packs', label: 'Pack Switches', expectedState: 'AUTO' },
          { id: 'b777-isolation', label: 'Isolation Valve', expectedState: 'AUTO' },
          { id: 'b777-eng-bleed', label: 'Engine Bleed', expectedState: 'ON' },
          { id: 'b777-fuel-pumps', label: 'Fuel Pumps', expectedState: 'ON' },
          { id: 'b777-beacon', label: 'Beacon', expectedState: 'ON' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'b777-packs-off', label: 'Packs', expectedState: 'OFF' },
          { id: 'b777-start-sw-2', label: 'Engine 2 Start Switch', expectedState: 'GRD' },
          { id: 'b777-n2-2', label: 'Engine 2 N2', expectedState: 'CHECK ROTATION' },
          { id: 'b777-fuel-2', label: 'Engine 2 Fuel Control', expectedState: 'RUN (AT 25% N2)' },
          { id: 'b777-egt-2', label: 'Engine 2 EGT', expectedState: 'CHECK' },
          { id: 'b777-start-sw-1', label: 'Engine 1 Start Switch', expectedState: 'GRD' },
          { id: 'b777-n2-1', label: 'Engine 1 N2', expectedState: 'CHECK ROTATION' },
          { id: 'b777-fuel-1', label: 'Engine 1 Fuel Control', expectedState: 'RUN (AT 25% N2)' },
          { id: 'b777-egt-1', label: 'Engine 1 EGT', expectedState: 'CHECK' },
          { id: 'b777-packs-on', label: 'Packs', expectedState: 'AUTO' },
          { id: 'b777-apu-bleed-off', label: 'APU Bleed', expectedState: 'OFF' },
          { id: 'b777-apu-off', label: 'APU', expectedState: 'OFF' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'b777-taxi-light', label: 'Taxi Lights', expectedState: 'ON' },
          { id: 'b777-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'b777-instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'b777-flt-ctrl', label: 'Flight Controls', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'b777-flaps-to', label: 'Flaps', expectedState: 'SET FOR TAKEOFF' },
          { id: 'b777-spoilers', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'b777-autobrake', label: 'Autobrake', expectedState: 'RTO' },
          { id: 'b777-tcas', label: 'Transponder / TCAS', expectedState: 'TA/RA' },
          { id: 'b777-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'b777-strobe', label: 'Strobe Lights', expectedState: 'ON' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'b777-thrust', label: 'Thrust Levers', expectedState: 'TOGA / FLEX' },
          { id: 'b777-n1', label: 'N1', expectedState: 'CHECK TARGET' },
          { id: 'b777-v1', label: 'V1', expectedState: 'CHECK' },
          { id: 'b777-vr', label: 'Rotate (VR)', expectedState: 'ROTATE' },
          { id: 'b777-pos-rate', label: 'Positive Rate', expectedState: 'GEAR UP' },
          { id: 'b777-lnav', label: 'LNAV / VNAV', expectedState: 'ENGAGE' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'b777-thrust-climb', label: 'Thrust', expectedState: 'CLIMB' },
          { id: 'b777-flaps-climb', label: 'Flaps', expectedState: 'UP (ON SCHEDULE)' },
          { id: 'b777-gear-off', label: 'Landing Gear Lever', expectedState: 'OFF' },
          { id: 'b777-press-climb', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'b777-altimeter-climb', label: 'Altimeter', expectedState: 'SET (18000: STD)' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'b777-cruise-alt', label: 'Cruise Altitude', expectedState: 'VERIFY' },
          { id: 'b777-fuel-cruise', label: 'Fuel', expectedState: 'CHECK BALANCE' },
          { id: 'b777-eng-cruise', label: 'Engine Parameters', expectedState: 'CHECK' },
          { id: 'b777-fmc-prog', label: 'FMC Progress', expectedState: 'MONITOR' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'b777-atis-desc', label: 'ATIS', expectedState: 'CHECK' },
          { id: 'b777-fmc-arr', label: 'FMC Arrival', expectedState: 'VERIFY' },
          { id: 'b777-altimeter-desc', label: 'Altimeter', expectedState: 'SET (BELOW 18000)' },
          { id: 'b777-press-desc', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'b777-speed-brake', label: 'Speed Brake', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'b777-app-speed', label: 'Approach Speed', expectedState: 'SET IN MCP' },
          { id: 'b777-autobrake-app', label: 'Autobrake', expectedState: '3' },
          { id: 'b777-flaps-app', label: 'Flaps', expectedState: 'SET 25' },
          { id: 'b777-gear-app', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'b777-spoilers-app', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'b777-app-mode', label: 'APP / ILS', expectedState: 'ENGAGE' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'b777-flaps-land', label: 'Flaps', expectedState: 'FULL (30)' },
          { id: 'b777-vref', label: 'Airspeed', expectedState: 'VREF' },
          { id: 'b777-thrust-idle', label: 'Thrust', expectedState: 'IDLE AT THRESHOLD' },
          { id: 'b777-reversers', label: 'Reverse Thrust', expectedState: 'DEPLOY' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'b777-spoilers-ret', label: 'Spoilers', expectedState: 'RETRACT' },
          { id: 'b777-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'b777-strobe-off', label: 'Strobe Lights', expectedState: 'OFF' },
          { id: 'b777-land-lights-off', label: 'Landing Lights', expectedState: 'OFF' },
          { id: 'b777-taxi-light-al', label: 'Taxi Lights', expectedState: 'ON' },
          { id: 'b777-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'b777-apu-al', label: 'APU', expectedState: 'START' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'b777-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'b777-fuel-ctrl-off', label: 'Fuel Controls (Both)', expectedState: 'CUT OFF' },
          { id: 'b777-seatbelt-off', label: 'Seatbelt Sign', expectedState: 'OFF' },
          { id: 'b777-apu-bleed-sd', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'b777-hyd-off', label: 'Hydraulic Pumps', expectedState: 'OFF' },
          { id: 'b777-irs-off', label: 'IRS', expectedState: 'OFF' },
          { id: 'b777-battery-off', label: 'Battery Switch', expectedState: 'OFF' },
        ],
      },
    ],
  },
  a321: {
    planeId: 'a321',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'a321-battery', label: 'Batteries (1 & 2)', expectedState: 'ON' },
          { id: 'a321-ext-pwr', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
          { id: 'a321-adirs', label: 'ADIRS (All 3)', expectedState: 'NAV' },
          { id: 'a321-fmgc', label: 'FMGC', expectedState: 'PROGRAM ROUTE' },
          { id: 'a321-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'a321-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'a321-signs', label: 'Seatbelt / No Smoking Signs', expectedState: 'ON' },
          { id: 'a321-nav-lights', label: 'Navigation Lights', expectedState: 'ON' },
        ],
      },
      {
        id: 'apu-start',
        title: 'APU Start',
        items: [
          { id: 'a321-apu-master', label: 'APU Master', expectedState: 'ON' },
          { id: 'a321-apu-start', label: 'APU Start', expectedState: 'ON' },
          { id: 'a321-apu-avail', label: 'APU', expectedState: 'AVAIL (WAIT)' },
          { id: 'a321-apu-bleed', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'a321-ext-pwr-off', label: 'External Power', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'a321-probe-heat', label: 'Probe/Window Heat', expectedState: 'AUTO' },
          { id: 'a321-packs', label: 'Pack 1 & 2', expectedState: 'ON' },
          { id: 'a321-eng-bleed', label: 'Engine Bleed (Both)', expectedState: 'ON' },
          { id: 'a321-fuel-pumps', label: 'Fuel Pumps', expectedState: 'ON' },
          { id: 'a321-beacon', label: 'Beacon', expectedState: 'ON' },
          { id: 'a321-doors', label: 'Doors', expectedState: 'CLOSED' },
          { id: 'a321-flt-ctrl', label: 'Flight Controls', expectedState: 'CHECK' },
          { id: 'a321-ecam', label: 'ECAM', expectedState: 'CHECK NO WARNINGS' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'a321-eng-mode', label: 'Engine Mode Selector', expectedState: 'IGN/START' },
          { id: 'a321-eng2-master', label: 'Engine 2 Master', expectedState: 'ON' },
          { id: 'a321-n2-rise-2', label: 'Engine 2 N2', expectedState: 'CHECK RISING' },
          { id: 'a321-eng1-master', label: 'Engine 1 Master', expectedState: 'ON' },
          { id: 'a321-n2-rise-1', label: 'Engine 1 N1/N2', expectedState: 'CHECK STABILIZED' },
          { id: 'a321-eng-mode-norm', label: 'Engine Mode Selector', expectedState: 'NORM' },
          { id: 'a321-apu-bleed-off', label: 'APU Bleed', expectedState: 'OFF' },
          { id: 'a321-apu-off', label: 'APU Master', expectedState: 'OFF' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'a321-nose-light', label: 'Nose Light', expectedState: 'TAXI' },
          { id: 'a321-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'a321-flt-instr', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'a321-ecam-taxi', label: 'ECAM', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'a321-flaps-to', label: 'Flaps', expectedState: 'CONF 1+F / 2 / 3' },
          { id: 'a321-spoilers', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'a321-autobrake', label: 'Autobrake', expectedState: 'MAX' },
          { id: 'a321-tcas', label: 'Transponder / TCAS', expectedState: 'TA/RA' },
          { id: 'a321-strobe', label: 'Strobe Lights', expectedState: 'ON / AUTO' },
          { id: 'a321-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'a321-toga-set', label: 'T.O. Config', expectedState: 'TEST' },
          { id: 'a321-perf', label: 'MCDU PERF T.O.', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'a321-thrust', label: 'Thrust Levers', expectedState: 'FLEX / TOGA' },
          { id: 'a321-fma', label: 'FMA', expectedState: 'CHECK SRS / RWY' },
          { id: 'a321-v1', label: 'V1', expectedState: 'CHECK' },
          { id: 'a321-vr', label: 'Rotate (VR)', expectedState: 'ROTATE' },
          { id: 'a321-pos-rate', label: 'Positive Rate', expectedState: 'GEAR UP' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'a321-thrust-climb', label: 'Thrust', expectedState: 'CLB' },
          { id: 'a321-flaps-climb', label: 'Flaps', expectedState: 'RETRACT ON SCHEDULE' },
          { id: 'a321-ap', label: 'Autopilot 1', expectedState: 'ENGAGE' },
          { id: 'a321-press-climb', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'a321-lights-climb', label: 'Landing Lights', expectedState: 'OFF (ABOVE 10000)' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'a321-cruise-alt', label: 'Cruise Altitude', expectedState: 'VERIFY' },
          { id: 'a321-fuel-cruise', label: 'Fuel', expectedState: 'CHECK' },
          { id: 'a321-ecam-cruise', label: 'ECAM', expectedState: 'CHECK ALL PAGES' },
          { id: 'a321-fmgc-cruise', label: 'FMGC Progress', expectedState: 'MONITOR' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'a321-atis-desc', label: 'ATIS', expectedState: 'CHECK' },
          { id: 'a321-fmgc-arr', label: 'FMGC Arrival / STAR', expectedState: 'VERIFY' },
          { id: 'a321-altimeter-desc', label: 'Altimeter', expectedState: 'SET (BELOW TL)' },
          { id: 'a321-press-desc', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'a321-lights-desc', label: 'Landing Lights', expectedState: 'ON (BELOW 10000)' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'a321-app-phase', label: 'MCDU PERF APPR', expectedState: 'SET' },
          { id: 'a321-ls', label: 'LS Button', expectedState: 'ON' },
          { id: 'a321-autobrake-app', label: 'Autobrake', expectedState: 'MED' },
          { id: 'a321-flaps-app', label: 'Flaps', expectedState: 'CONF 3 / FULL' },
          { id: 'a321-gear-app', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'a321-spoilers-app', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'a321-appr-mode', label: 'APPR', expectedState: 'ENGAGE' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'a321-flaps-land', label: 'Flaps', expectedState: 'CONF FULL' },
          { id: 'a321-vapp', label: 'Airspeed', expectedState: 'VAPP' },
          { id: 'a321-thrust-idle', label: 'Thrust', expectedState: 'IDLE AT 30FT' },
          { id: 'a321-reversers', label: 'Reverse Thrust', expectedState: 'DEPLOY' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'a321-spoilers-ret', label: 'Spoilers', expectedState: 'DISARM' },
          { id: 'a321-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'a321-strobe-off', label: 'Strobe Lights', expectedState: 'OFF / AUTO' },
          { id: 'a321-land-lights-off', label: 'Landing Lights', expectedState: 'OFF' },
          { id: 'a321-nose-taxi', label: 'Nose Light', expectedState: 'TAXI' },
          { id: 'a321-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'a321-apu-al', label: 'APU', expectedState: 'START' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'a321-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'a321-eng1-off', label: 'Engine 1 Master', expectedState: 'OFF' },
          { id: 'a321-eng2-off', label: 'Engine 2 Master', expectedState: 'OFF' },
          { id: 'a321-seatbelt-off', label: 'Seatbelt Sign', expectedState: 'OFF' },
          { id: 'a321-apu-bleed-sd', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'a321-adirs-off', label: 'ADIRS (All 3)', expectedState: 'OFF' },
          { id: 'a321-apu-sd-off', label: 'APU Master', expectedState: 'OFF' },
          { id: 'a321-battery-off', label: 'Batteries (1 & 2)', expectedState: 'OFF' },
        ],
      },
    ],
  },
  dhc6: {
    planeId: 'dhc6',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start',
        items: [
          { id: 'dhc6-battery', label: 'Battery', expectedState: 'ON' },
          { id: 'dhc6-gen-sw', label: 'Generator Switches (Both)', expectedState: 'OFF' },
          { id: 'dhc6-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'dhc6-fuel-sel', label: 'Fuel Selectors (Both)', expectedState: 'ON' },
          { id: 'dhc6-condition-l', label: 'Left Condition Lever', expectedState: 'FUEL CUT OFF' },
          { id: 'dhc6-condition-r', label: 'Right Condition Lever', expectedState: 'FUEL CUT OFF' },
          { id: 'dhc6-prop-l', label: 'Left Prop Lever', expectedState: 'FULL FORWARD' },
          { id: 'dhc6-prop-r', label: 'Right Prop Lever', expectedState: 'FULL FORWARD' },
          { id: 'dhc6-flight-ctrl', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'dhc6-flaps', label: 'Flaps', expectedState: 'UP' },
        ],
      },
      {
        id: 'engine-start-l',
        title: 'Engine Start (Left)',
        items: [
          { id: 'dhc6-start-l', label: 'Left Starter', expectedState: 'ON' },
          { id: 'dhc6-ng-l', label: 'Left Ng', expectedState: 'CHECK 12%' },
          { id: 'dhc6-cond-l-idle', label: 'Left Condition Lever', expectedState: 'LOW IDLE' },
          { id: 'dhc6-itt-l', label: 'Left ITT', expectedState: 'CHECK (MAX 1090°C)' },
          { id: 'dhc6-oil-l', label: 'Left Oil Pressure', expectedState: 'CHECK GREEN' },
          { id: 'dhc6-gen-l', label: 'Left Generator', expectedState: 'ON' },
        ],
      },
      {
        id: 'engine-start-r',
        title: 'Engine Start (Right)',
        items: [
          { id: 'dhc6-start-r', label: 'Right Starter', expectedState: 'ON' },
          { id: 'dhc6-ng-r', label: 'Right Ng', expectedState: 'CHECK 12%' },
          { id: 'dhc6-cond-r-idle', label: 'Right Condition Lever', expectedState: 'LOW IDLE' },
          { id: 'dhc6-itt-r', label: 'Right ITT', expectedState: 'CHECK (MAX 1090°C)' },
          { id: 'dhc6-oil-r', label: 'Right Oil Pressure', expectedState: 'CHECK GREEN' },
          { id: 'dhc6-gen-r', label: 'Right Generator', expectedState: 'ON' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'dhc6-avionics', label: 'Avionics', expectedState: 'ON' },
          { id: 'dhc6-altimeter', label: 'Altimeter', expectedState: 'SET' },
          { id: 'dhc6-gyros', label: 'Gyros', expectedState: 'SET' },
          { id: 'dhc6-radios', label: 'Radios', expectedState: 'SET' },
          { id: 'dhc6-trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'dhc6-flaps-to', label: 'Flaps', expectedState: 'SET (10° STOL / 0° NORMAL)' },
          { id: 'dhc6-cond-both-hi', label: 'Condition Levers (Both)', expectedState: 'HIGH IDLE' },
          { id: 'dhc6-prop-both', label: 'Prop Levers (Both)', expectedState: 'FULL FORWARD' },
          { id: 'dhc6-transponder', label: 'Transponder', expectedState: 'ALT' },
          { id: 'dhc6-lights', label: 'Landing / Strobe Lights', expectedState: 'ON' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'dhc6-power-to', label: 'Power Levers (Both)', expectedState: 'FULL FORWARD' },
          { id: 'dhc6-torque', label: 'Torque', expectedState: 'CHECK EQUAL' },
          { id: 'dhc6-rotate', label: 'Rotate', expectedState: '65 KIAS' },
          { id: 'dhc6-climb-spd', label: 'Initial Climb Speed', expectedState: '80 KIAS' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'dhc6-power-climb', label: 'Power Levers', expectedState: 'MCT' },
          { id: 'dhc6-flaps-climb', label: 'Flaps', expectedState: 'UP' },
          { id: 'dhc6-climb-speed', label: 'Airspeed', expectedState: '100 KIAS' },
          { id: 'dhc6-eng-inst', label: 'Engine Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'dhc6-power-cruise', label: 'Power Levers', expectedState: 'SET CRUISE' },
          { id: 'dhc6-prop-cruise', label: 'Prop Levers', expectedState: 'SET RPM' },
          { id: 'dhc6-condition-cruise', label: 'Condition Levers', expectedState: 'ADJUST' },
          { id: 'dhc6-trim-cruise', label: 'Trim', expectedState: 'ADJUST' },
          { id: 'dhc6-fuel-bal', label: 'Fuel Balance', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'dhc6-atis', label: 'ATIS / Weather', expectedState: 'CHECK' },
          { id: 'dhc6-altimeter-desc', label: 'Altimeter', expectedState: 'SET' },
          { id: 'dhc6-power-desc', label: 'Power', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'before-landing',
        title: 'Before Landing',
        items: [
          { id: 'dhc6-cond-hi-land', label: 'Condition Levers (Both)', expectedState: 'HIGH IDLE' },
          { id: 'dhc6-prop-full', label: 'Prop Levers (Both)', expectedState: 'FULL FORWARD' },
          { id: 'dhc6-flaps-land', label: 'Flaps', expectedState: 'FULL (STOL: 35°)' },
          { id: 'dhc6-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'dhc6-speed-land', label: 'Airspeed', expectedState: '75 KIAS' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'dhc6-power-land', label: 'Power', expectedState: 'IDLE ON TOUCHDOWN' },
          { id: 'dhc6-beta', label: 'Prop Levers', expectedState: 'BETA (REVERSE)' },
          { id: 'dhc6-brakes-land', label: 'Brakes', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'dhc6-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'dhc6-cond-low-al', label: 'Condition Levers', expectedState: 'LOW IDLE' },
          { id: 'dhc6-lights-al', label: 'Landing / Strobe Lights', expectedState: 'OFF' },
          { id: 'dhc6-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'dhc6-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'dhc6-avionics-off', label: 'Avionics', expectedState: 'OFF' },
          { id: 'dhc6-cond-off-l', label: 'Left Condition Lever', expectedState: 'FUEL CUT OFF' },
          { id: 'dhc6-cond-off-r', label: 'Right Condition Lever', expectedState: 'FUEL CUT OFF' },
          { id: 'dhc6-gen-off', label: 'Generators (Both)', expectedState: 'OFF' },
          { id: 'dhc6-battery-off', label: 'Battery', expectedState: 'OFF' },
        ],
      },
    ],
  },
  cj4: {
    planeId: 'cj4',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'cj4-battery', label: 'Battery', expectedState: 'ON' },
          { id: 'cj4-ext-pwr', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
          { id: 'cj4-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'cj4-avionics', label: 'Avionics Master', expectedState: 'ON' },
          { id: 'cj4-fms', label: 'FMS', expectedState: 'PROGRAM' },
          { id: 'cj4-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'cj4-oxygen', label: 'Oxygen', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'cj4-beacon', label: 'Beacon', expectedState: 'ON' },
          { id: 'cj4-fuel-pumps', label: 'Fuel Boost Pumps', expectedState: 'ON' },
          { id: 'cj4-start-l', label: 'Left Engine Start', expectedState: 'ON' },
          { id: 'cj4-n2-l', label: 'Left N2', expectedState: 'CHECK 15%' },
          { id: 'cj4-fuel-l', label: 'Left Fuel Lever', expectedState: 'ON' },
          { id: 'cj4-itt-l', label: 'Left ITT', expectedState: 'CHECK (MAX 927°C)' },
          { id: 'cj4-gen-l', label: 'Left Generator', expectedState: 'ON' },
          { id: 'cj4-start-r', label: 'Right Engine Start', expectedState: 'ON' },
          { id: 'cj4-n2-r', label: 'Right N2', expectedState: 'CHECK 15%' },
          { id: 'cj4-fuel-r', label: 'Right Fuel Lever', expectedState: 'ON' },
          { id: 'cj4-itt-r', label: 'Right ITT', expectedState: 'CHECK (MAX 927°C)' },
          { id: 'cj4-gen-r', label: 'Right Generator', expectedState: 'ON' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'cj4-flt-ctrl', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'cj4-trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
          { id: 'cj4-altimeter', label: 'Altimeter', expectedState: 'SET' },
          { id: 'cj4-press', label: 'Pressurization', expectedState: 'SET' },
          { id: 'cj4-deice', label: 'Anti-Ice', expectedState: 'AS REQUIRED' },
          { id: 'cj4-flaps-set', label: 'Flaps', expectedState: 'SET 15°' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'cj4-taxi-light', label: 'Taxi Lights', expectedState: 'ON' },
          { id: 'cj4-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'cj4-instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'cj4-nosewheel', label: 'Nosewheel Steering', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'cj4-flaps-to', label: 'Flaps', expectedState: '15°' },
          { id: 'cj4-spoilers-to', label: 'Speed Brake', expectedState: 'RETRACTED' },
          { id: 'cj4-trims-to', label: 'Trims', expectedState: 'SET' },
          { id: 'cj4-transponder', label: 'Transponder', expectedState: 'TA/RA' },
          { id: 'cj4-lights-to', label: 'Landing / Strobe Lights', expectedState: 'ON' },
          { id: 'cj4-ignition', label: 'Ignition', expectedState: 'ON' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'cj4-thrust', label: 'Thrust Levers', expectedState: 'TAKEOFF' },
          { id: 'cj4-n1', label: 'N1', expectedState: 'CHECK TARGET' },
          { id: 'cj4-v1', label: 'V1', expectedState: 'CHECK' },
          { id: 'cj4-vr', label: 'Rotate (VR)', expectedState: 'ROTATE' },
          { id: 'cj4-pos-rate', label: 'Positive Rate', expectedState: 'GEAR UP' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'cj4-thrust-climb', label: 'Thrust', expectedState: 'CLIMB' },
          { id: 'cj4-flaps-climb', label: 'Flaps', expectedState: 'UP' },
          { id: 'cj4-climb-speed', label: 'Airspeed', expectedState: '200 KIAS' },
          { id: 'cj4-press-climb', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'cj4-eng-chk', label: 'Engine Parameters', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'cj4-cruise-thrust', label: 'Thrust', expectedState: 'SET CRUISE' },
          { id: 'cj4-fuel-cruise', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'cj4-fms-cruise', label: 'FMS Progress', expectedState: 'MONITOR' },
          { id: 'cj4-trim-cruise', label: 'Trim', expectedState: 'ADJUST' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'cj4-atis', label: 'ATIS', expectedState: 'CHECK' },
          { id: 'cj4-fms-arr', label: 'FMS Arrival', expectedState: 'VERIFY' },
          { id: 'cj4-altimeter-desc', label: 'Altimeter', expectedState: 'SET' },
          { id: 'cj4-press-desc', label: 'Pressurization', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'cj4-app-speed', label: 'Approach Speed', expectedState: 'SET' },
          { id: 'cj4-flaps-app', label: 'Flaps', expectedState: '15°' },
          { id: 'cj4-gear-app', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'cj4-land-lights-app', label: 'Landing Lights', expectedState: 'ON' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'cj4-flaps-land', label: 'Flaps', expectedState: '35°' },
          { id: 'cj4-vref-land', label: 'Airspeed', expectedState: 'VREF 113 KIAS' },
          { id: 'cj4-thrust-idle', label: 'Thrust', expectedState: 'IDLE ON TOUCHDOWN' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'cj4-spoilers-al', label: 'Speed Brake', expectedState: 'RETRACT' },
          { id: 'cj4-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'cj4-lights-al', label: 'Landing / Strobe Lights', expectedState: 'OFF' },
          { id: 'cj4-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'cj4-taxi-light-al', label: 'Taxi Lights', expectedState: 'ON' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'cj4-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'cj4-avionics-off', label: 'Avionics', expectedState: 'OFF' },
          { id: 'cj4-fuel-l-off', label: 'Left Fuel Lever', expectedState: 'OFF' },
          { id: 'cj4-fuel-r-off', label: 'Right Fuel Lever', expectedState: 'OFF' },
          { id: 'cj4-gen-off', label: 'Generators (Both)', expectedState: 'OFF' },
          { id: 'cj4-battery-off', label: 'Battery', expectedState: 'OFF' },
        ],
      },
    ],
  },
  pa28: {
    planeId: 'pa28',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start Inspection',
        items: [
          { id: 'pa28-preflight', label: 'Preflight Inspection', expectedState: 'COMPLETE' },
          { id: 'pa28-seats', label: 'Seats & Belts', expectedState: 'ADJUSTED & LOCKED' },
          { id: 'pa28-brakes', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'pa28-circuit-brk', label: 'Circuit Breakers', expectedState: 'CHECK IN' },
          { id: 'pa28-fuel-sel', label: 'Fuel Selector', expectedState: 'ON (DESIRED TANK)' },
          { id: 'pa28-elec', label: 'Electrical Equipment', expectedState: 'OFF' },
          { id: 'pa28-avionics', label: 'Avionics Master', expectedState: 'OFF' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'pa28-master', label: 'Master Switch', expectedState: 'ON' },
          { id: 'pa28-fuel-pump', label: 'Fuel Pump', expectedState: 'ON' },
          { id: 'pa28-throttle', label: 'Throttle', expectedState: 'OPEN 1/4 INCH' },
          { id: 'pa28-mixture', label: 'Mixture', expectedState: 'RICH' },
          { id: 'pa28-carb-heat', label: 'Carb Heat', expectedState: 'OFF' },
          { id: 'pa28-prop-area', label: 'Propeller Area', expectedState: 'CLEAR' },
          { id: 'pa28-ignition', label: 'Ignition', expectedState: 'START' },
          { id: 'pa28-oil', label: 'Oil Pressure', expectedState: 'CHECK GREEN' },
          { id: 'pa28-fuel-pump-off', label: 'Fuel Pump', expectedState: 'OFF' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'pa28-avionics-on', label: 'Avionics Master', expectedState: 'ON' },
          { id: 'pa28-flaps-taxi', label: 'Flaps', expectedState: 'UP' },
          { id: 'pa28-taxi-light', label: 'Taxi Light', expectedState: 'ON' },
          { id: 'pa28-brakes-chk', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'pa28-instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'runup',
        title: 'Before Takeoff (Runup)',
        items: [
          { id: 'pa28-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'pa28-controls', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'pa28-instruments-chk', label: 'Flight Instruments', expectedState: 'CHECK & SET' },
          { id: 'pa28-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'pa28-mixture-rich', label: 'Mixture', expectedState: 'RICH' },
          { id: 'pa28-throttle-2000', label: 'Throttle', expectedState: '2000 RPM' },
          { id: 'pa28-mags', label: 'Magnetos', expectedState: 'CHECK (MAX DROP 175)' },
          { id: 'pa28-carb-heat-chk', label: 'Carb Heat', expectedState: 'CHECK (RPM DROP)' },
          { id: 'pa28-amps', label: 'Ammeter', expectedState: 'CHECK' },
          { id: 'pa28-oil-chk', label: 'Oil Temp & Pressure', expectedState: 'CHECK GREEN' },
          { id: 'pa28-throttle-idle', label: 'Throttle', expectedState: 'IDLE CHECK' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'pa28-flaps-to', label: 'Flaps', expectedState: 'UP (25° SHORT FIELD)' },
          { id: 'pa28-fuel-pump-to', label: 'Fuel Pump', expectedState: 'ON' },
          { id: 'pa28-throttle-full', label: 'Throttle', expectedState: 'FULL FORWARD' },
          { id: 'pa28-rotate', label: 'Rotate', expectedState: '60 KIAS' },
          { id: 'pa28-climb-spd', label: 'Climb Speed', expectedState: '76 KIAS' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'pa28-fuel-pump-climb', label: 'Fuel Pump', expectedState: 'OFF (ABOVE 1000 AGL)' },
          { id: 'pa28-throttle-climb', label: 'Throttle', expectedState: 'FULL' },
          { id: 'pa28-mixture-climb', label: 'Mixture', expectedState: 'RICH' },
          { id: 'pa28-eng-inst', label: 'Engine Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'pa28-power-cruise', label: 'Throttle', expectedState: '2100-2500 RPM' },
          { id: 'pa28-mixture-cruise', label: 'Mixture', expectedState: 'LEAN' },
          { id: 'pa28-trim', label: 'Elevator Trim', expectedState: 'ADJUST' },
          { id: 'pa28-fuel-sel-cruise', label: 'Fuel Selector', expectedState: 'SWITCH TANKS HOURLY' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'pa28-atis-desc', label: 'ATIS / Weather', expectedState: 'CHECK' },
          { id: 'pa28-altimeter-desc', label: 'Altimeter', expectedState: 'SET' },
          { id: 'pa28-mixture-desc', label: 'Mixture', expectedState: 'ENRICH AS NEEDED' },
          { id: 'pa28-carb-heat-desc', label: 'Carb Heat', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'before-landing',
        title: 'Before Landing',
        items: [
          { id: 'pa28-seats-land', label: 'Seats & Belts', expectedState: 'SECURE' },
          { id: 'pa28-fuel-sel-land', label: 'Fuel Selector', expectedState: 'FULLEST TANK' },
          { id: 'pa28-mixture-land', label: 'Mixture', expectedState: 'RICH' },
          { id: 'pa28-fuel-pump-land', label: 'Fuel Pump', expectedState: 'ON' },
          { id: 'pa28-carb-heat-land', label: 'Carb Heat', expectedState: 'ON' },
          { id: 'pa28-flaps-land', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'pa28-land-light', label: 'Landing Light', expectedState: 'ON' },
          { id: 'pa28-speed-land', label: 'Airspeed', expectedState: '66 KIAS (FINAL)' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'pa28-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'pa28-carb-heat-off', label: 'Carb Heat', expectedState: 'OFF' },
          { id: 'pa28-fuel-pump-al', label: 'Fuel Pump', expectedState: 'OFF' },
          { id: 'pa28-land-light-off', label: 'Landing Light', expectedState: 'OFF' },
          { id: 'pa28-taxi-light-al', label: 'Taxi Light', expectedState: 'ON' },
        ],
      },
      {
        id: 'securing',
        title: 'Securing Aircraft',
        items: [
          { id: 'pa28-avionics-off', label: 'Avionics Master', expectedState: 'OFF' },
          { id: 'pa28-throttle-idle-sec', label: 'Throttle', expectedState: 'IDLE' },
          { id: 'pa28-mixture-off', label: 'Mixture', expectedState: 'IDLE CUT OFF' },
          { id: 'pa28-ignition-off', label: 'Ignition', expectedState: 'OFF' },
          { id: 'pa28-master-off', label: 'Master Switch', expectedState: 'OFF' },
        ],
      },
    ],
  },
  fa18: {
    planeId: 'fa18',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'fa18-battery', label: 'Battery Switch', expectedState: 'ON' },
          { id: 'fa18-apu', label: 'APU', expectedState: 'ON' },
          { id: 'fa18-canopy', label: 'Canopy', expectedState: 'OPEN / CHECKED' },
          { id: 'fa18-fcs-bit', label: 'FCS BIT', expectedState: 'INITIATE' },
          { id: 'fa18-fcs-result', label: 'FCS BIT Result', expectedState: 'GO' },
          { id: 'fa18-ins', label: 'INS', expectedState: 'ALIGN (CV / GND)' },
          { id: 'fa18-hud', label: 'HUD', expectedState: 'CHECK' },
          { id: 'fa18-mfds', label: 'MFDs', expectedState: 'SET' },
          { id: 'fa18-radar', label: 'Radar', expectedState: 'STANDBY' },
          { id: 'fa18-rwr', label: 'RWR / Countermeasures', expectedState: 'CHECK' },
          { id: 'fa18-g-suit', label: 'G-Suit', expectedState: 'CONNECTED (SIM: N/A)' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'fa18-crank-r', label: 'Right Engine Crank', expectedState: 'ON' },
          { id: 'fa18-throttle-r', label: 'Right Throttle', expectedState: 'IDLE (AT 25% N2)' },
          { id: 'fa18-egt-r', label: 'Right EGT', expectedState: 'CHECK' },
          { id: 'fa18-rpm-r', label: 'Right RPM', expectedState: 'CHECK STABILIZED' },
          { id: 'fa18-gen-r', label: 'Right Generator', expectedState: 'ON' },
          { id: 'fa18-crank-l', label: 'Left Engine Crank', expectedState: 'ON' },
          { id: 'fa18-throttle-l', label: 'Left Throttle', expectedState: 'IDLE (AT 25% N2)' },
          { id: 'fa18-egt-l', label: 'Left EGT', expectedState: 'CHECK' },
          { id: 'fa18-rpm-l', label: 'Left RPM', expectedState: 'CHECK STABILIZED' },
          { id: 'fa18-gen-l', label: 'Left Generator', expectedState: 'ON' },
          { id: 'fa18-apu-off', label: 'APU', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'fa18-flt-ctrl', label: 'Flight Controls', expectedState: 'CYCLE & CHECK' },
          { id: 'fa18-flaps-auto', label: 'Flaps', expectedState: 'AUTO' },
          { id: 'fa18-trim', label: 'Trim', expectedState: 'SET' },
          { id: 'fa18-nosewheel', label: 'Nosewheel Steering', expectedState: 'ENGAGE' },
          { id: 'fa18-canopy-close', label: 'Canopy', expectedState: 'CLOSED & LOCKED' },
          { id: 'fa18-hud-chk', label: 'HUD', expectedState: 'SET TAKEOFF MODE' },
          { id: 'fa18-altimeter', label: 'Altimeter', expectedState: 'SET' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'fa18-ext-lights', label: 'External Lights', expectedState: 'AS REQUIRED' },
          { id: 'fa18-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'fa18-instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'fa18-ins-chk', label: 'INS Alignment', expectedState: 'VERIFY COMPLETE' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'fa18-flaps-to', label: 'Flaps', expectedState: 'HALF' },
          { id: 'fa18-trim-to', label: 'Trim', expectedState: 'SET FOR TAKEOFF' },
          { id: 'fa18-radar-on', label: 'Radar', expectedState: 'OPERATE' },
          { id: 'fa18-transponder', label: 'Transponder', expectedState: 'ON' },
          { id: 'fa18-anti-skid', label: 'Anti-Skid', expectedState: 'ON' },
          { id: 'fa18-lights-to', label: 'External Lights', expectedState: 'AS REQUIRED' },
          { id: 'fa18-launch-bar', label: 'Launch Bar', expectedState: 'AS REQUIRED (CARRIER)' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff / Departure',
        items: [
          { id: 'fa18-mil-power', label: 'Throttles', expectedState: 'MIL / AFTERBURNER' },
          { id: 'fa18-engines-chk', label: 'Engine Instruments', expectedState: 'CHECK' },
          { id: 'fa18-rotate', label: 'Rotate', expectedState: '130 KIAS' },
          { id: 'fa18-gear-up', label: 'Landing Gear', expectedState: 'UP' },
          { id: 'fa18-flaps-auto-to', label: 'Flaps', expectedState: 'AUTO' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'fa18-throttle-cruise', label: 'Throttles', expectedState: 'SET CRUISE' },
          { id: 'fa18-fuel-cruise', label: 'Fuel State', expectedState: 'CHECK / MONITOR' },
          { id: 'fa18-radar-cruise', label: 'Radar', expectedState: 'AS REQUIRED' },
          { id: 'fa18-nav-cruise', label: 'Navigation', expectedState: 'VERIFY' },
        ],
      },
      {
        id: 'descent-approach',
        title: 'Descent / Approach',
        items: [
          { id: 'fa18-atis-app', label: 'ATIS / Weather', expectedState: 'CHECK' },
          { id: 'fa18-altimeter-app', label: 'Altimeter', expectedState: 'SET' },
          { id: 'fa18-speed-app', label: 'Airspeed', expectedState: 'ON SPEED (AOA)' },
          { id: 'fa18-hook', label: 'Arresting Hook', expectedState: 'AS REQUIRED (CARRIER)' },
          { id: 'fa18-gear-dn', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'fa18-flaps-land', label: 'Flaps', expectedState: 'FULL' },
          { id: 'fa18-hud-app', label: 'HUD', expectedState: 'SET APPROACH MODE' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'fa18-aoa-land', label: 'AOA', expectedState: 'ON SPEED (8.1° OPTIMUM)' },
          { id: 'fa18-throttle-land', label: 'Throttles', expectedState: 'AS REQUIRED' },
          { id: 'fa18-nosewheel-land', label: 'Nosewheel', expectedState: 'ENGAGE AFTER TOUCHDOWN' },
          { id: 'fa18-brakes-land', label: 'Brakes', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'fa18-flaps-al', label: 'Flaps', expectedState: 'AUTO' },
          { id: 'fa18-hook-al', label: 'Arresting Hook', expectedState: 'UP' },
          { id: 'fa18-radar-stby', label: 'Radar', expectedState: 'STANDBY' },
          { id: 'fa18-ext-lights-al', label: 'External Lights', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'fa18-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'fa18-throttle-off', label: 'Throttles (Both)', expectedState: 'OFF' },
          { id: 'fa18-gen-off', label: 'Generators (Both)', expectedState: 'OFF' },
          { id: 'fa18-avionics-off', label: 'Avionics', expectedState: 'OFF' },
          { id: 'fa18-battery-off', label: 'Battery Switch', expectedState: 'OFF' },
          { id: 'fa18-canopy-open', label: 'Canopy', expectedState: 'OPEN' },
        ],
      },
    ],
  },
  a5: {
    planeId: 'a5',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'a5-walkaround', label: 'Walkaround Inspection', expectedState: 'COMPLETE' },
          { id: 'a5-fuel', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'a5-canopy', label: 'Canopy', expectedState: 'SECURE' },
          { id: 'a5-seats', label: 'Seats & Belts', expectedState: 'ADJUSTED' },
          { id: 'a5-water-rudder', label: 'Water Rudder', expectedState: 'UP (LAND) / CHECK (WATER)' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'a5-master', label: 'Master Switch', expectedState: 'ON' },
          { id: 'a5-fuel-valve', label: 'Fuel Valve', expectedState: 'ON' },
          { id: 'a5-throttle', label: 'Throttle', expectedState: 'IDLE' },
          { id: 'a5-choke', label: 'Choke / Primer', expectedState: 'AS REQUIRED' },
          { id: 'a5-ignition', label: 'Ignition', expectedState: 'START' },
          { id: 'a5-rpm', label: 'RPM', expectedState: 'CHECK STABLE' },
          { id: 'a5-oil', label: 'Oil Pressure', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'a5-controls', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'a5-flaps-to', label: 'Flaps', expectedState: 'SET FOR TAKEOFF' },
          { id: 'a5-trim-to', label: 'Trim', expectedState: 'SET' },
          { id: 'a5-water-rudder-to', label: 'Water Rudder', expectedState: 'UP' },
          { id: 'a5-instruments', label: 'Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'a5-throttle-full', label: 'Throttle', expectedState: 'FULL' },
          { id: 'a5-rotate', label: 'Rotate', expectedState: '55 KIAS' },
          { id: 'a5-climb', label: 'Climb Speed', expectedState: '64 KIAS' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'a5-throttle-climb', label: 'Throttle', expectedState: 'FULL' },
          { id: 'a5-airspeed-climb', label: 'Airspeed', expectedState: '64 KIAS' },
          { id: 'a5-flaps-climb', label: 'Flaps', expectedState: 'UP' },
          { id: 'a5-eng-chk', label: 'Engine Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'a5-throttle-cruise', label: 'Throttle', expectedState: 'SET CRUISE RPM' },
          { id: 'a5-trim-cruise', label: 'Trim', expectedState: 'ADJUST' },
          { id: 'a5-fuel-cruise', label: 'Fuel', expectedState: 'MONITOR' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'a5-throttle-desc', label: 'Throttle', expectedState: 'REDUCE' },
          { id: 'a5-landing-area', label: 'Landing Area', expectedState: 'IDENTIFY' },
          { id: 'a5-water-rudder-desc', label: 'Water Rudder', expectedState: 'UP (WATER: CHECK)' },
        ],
      },
      {
        id: 'before-landing',
        title: 'Before Landing',
        items: [
          { id: 'a5-flaps-land', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'a5-speed-land', label: 'Airspeed', expectedState: '55 KIAS (FINAL)' },
          { id: 'a5-water-rudder-land', label: 'Water Rudder', expectedState: 'DOWN (WATER OPS)' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'a5-throttle-land', label: 'Throttle', expectedState: 'IDLE' },
          { id: 'a5-flare', label: 'Flare', expectedState: 'GENTLE TOUCHDOWN' },
        ],
      },
      {
        id: 'securing',
        title: 'Securing Aircraft',
        items: [
          { id: 'a5-throttle-off', label: 'Throttle', expectedState: 'IDLE' },
          { id: 'a5-ignition-off', label: 'Ignition', expectedState: 'OFF' },
          { id: 'a5-fuel-valve-off', label: 'Fuel Valve', expectedState: 'OFF' },
          { id: 'a5-master-off', label: 'Master Switch', expectedState: 'OFF' },
          { id: 'a5-canopy-sec', label: 'Canopy', expectedState: 'SECURE' },
        ],
      },
    ],
  },
  b58: {
    planeId: 'b58',
    phases: [
      {
        id: 'pre-start',
        title: 'Pre-Start',
        items: [
          { id: 'b58-preflight', label: 'Preflight Inspection', expectedState: 'COMPLETE' },
          { id: 'b58-seats', label: 'Seats & Belts', expectedState: 'ADJUSTED & LOCKED' },
          { id: 'b58-fuel-sel', label: 'Fuel Selectors (Both)', expectedState: 'ON' },
          { id: 'b58-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'b58-crossfeed', label: 'Crossfeed', expectedState: 'OFF' },
          { id: 'b58-cowl-flaps', label: 'Cowl Flaps (Both)', expectedState: 'OPEN' },
          { id: 'b58-props', label: 'Prop Levers (Both)', expectedState: 'FULL FORWARD' },
          { id: 'b58-throttles', label: 'Throttles (Both)', expectedState: 'CLOSED' },
          { id: 'b58-mixtures', label: 'Mixtures (Both)', expectedState: 'IDLE CUT OFF' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'b58-master', label: 'Master Switch', expectedState: 'ON' },
          { id: 'b58-beacon', label: 'Beacon', expectedState: 'ON' },
          { id: 'b58-fuel-pump-l', label: 'Left Fuel Pump', expectedState: 'ON' },
          { id: 'b58-throttle-l', label: 'Left Throttle', expectedState: 'OPEN 1/4 INCH' },
          { id: 'b58-mixture-l', label: 'Left Mixture', expectedState: 'RICH' },
          { id: 'b58-ignition-l', label: 'Left Ignition', expectedState: 'START' },
          { id: 'b58-oil-l', label: 'Left Oil Pressure', expectedState: 'CHECK GREEN' },
          { id: 'b58-fuel-pump-r', label: 'Right Fuel Pump', expectedState: 'ON' },
          { id: 'b58-throttle-r', label: 'Right Throttle', expectedState: 'OPEN 1/4 INCH' },
          { id: 'b58-mixture-r', label: 'Right Mixture', expectedState: 'RICH' },
          { id: 'b58-ignition-r', label: 'Right Ignition', expectedState: 'START' },
          { id: 'b58-oil-r', label: 'Right Oil Pressure', expectedState: 'CHECK GREEN' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'b58-avionics', label: 'Avionics Master', expectedState: 'ON' },
          { id: 'b58-flight-ctrl', label: 'Flight Controls', expectedState: 'FREE & CORRECT' },
          { id: 'b58-flaps-chk', label: 'Flaps', expectedState: 'UP' },
          { id: 'b58-altimeter', label: 'Altimeter', expectedState: 'SET' },
          { id: 'b58-gyros', label: 'Gyros', expectedState: 'SET' },
          { id: 'b58-trims', label: 'Trims', expectedState: 'SET FOR TAKEOFF' },
        ],
      },
      {
        id: 'runup',
        title: 'Before Takeoff (Runup)',
        items: [
          { id: 'b58-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'b58-props-ex', label: 'Props (Both)', expectedState: 'EXERCISE / CYCLE' },
          { id: 'b58-throttle-1700', label: 'Throttles (Both)', expectedState: '1700 RPM' },
          { id: 'b58-mags-l', label: 'Left Magnetos', expectedState: 'CHECK (MAX DROP 150)' },
          { id: 'b58-mags-r', label: 'Right Magnetos', expectedState: 'CHECK (MAX DROP 150)' },
          { id: 'b58-feather-l', label: 'Left Prop Feather', expectedState: 'CHECK' },
          { id: 'b58-feather-r', label: 'Right Prop Feather', expectedState: 'CHECK' },
          { id: 'b58-eng-inst', label: 'Engine Instruments', expectedState: 'CHECK GREEN' },
          { id: 'b58-amps', label: 'Ammeter / Voltmeter', expectedState: 'CHECK' },
          { id: 'b58-prop-sync', label: 'Prop Sync', expectedState: 'OFF (FOR RUNUP)' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'b58-flaps-to', label: 'Flaps', expectedState: 'APPROACH (15°)' },
          { id: 'b58-props-to', label: 'Props (Both)', expectedState: 'FULL FORWARD' },
          { id: 'b58-mixtures-to', label: 'Mixtures (Both)', expectedState: 'RICH' },
          { id: 'b58-throttle-full', label: 'Throttles (Both)', expectedState: 'FULL FORWARD' },
          { id: 'b58-lights-to', label: 'Landing / Strobe Lights', expectedState: 'ON' },
          { id: 'b58-rotate', label: 'Rotate', expectedState: '84 KIAS' },
          { id: 'b58-blueline', label: 'Blueline (Vyse)', expectedState: '100 KIAS' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'b58-flaps-climb', label: 'Flaps', expectedState: 'UP' },
          { id: 'b58-throttle-climb', label: 'Throttles', expectedState: 'SET 25"MP' },
          { id: 'b58-props-climb', label: 'Props', expectedState: '2500 RPM' },
          { id: 'b58-prop-sync-on', label: 'Prop Sync', expectedState: 'ON' },
          { id: 'b58-climb-speed', label: 'Airspeed', expectedState: '120 KIAS' },
          { id: 'b58-cowl-climb', label: 'Cowl Flaps', expectedState: 'OPEN' },
          { id: 'b58-eng-inst-climb', label: 'Engine Instruments', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'b58-power-cruise', label: 'Throttles', expectedState: 'SET CRUISE MP' },
          { id: 'b58-props-cruise', label: 'Props', expectedState: 'SET 2300 RPM' },
          { id: 'b58-mixtures-cruise', label: 'Mixtures (Both)', expectedState: 'LEAN' },
          { id: 'b58-cowl-cruise', label: 'Cowl Flaps', expectedState: 'CLOSED' },
          { id: 'b58-prop-sync-cruise', label: 'Prop Sync', expectedState: 'ON' },
          { id: 'b58-fuel-balance', label: 'Fuel Balance', expectedState: 'CHECK' },
          { id: 'b58-trim-cruise', label: 'Trim', expectedState: 'ADJUST' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'b58-atis', label: 'ATIS / Weather', expectedState: 'CHECK' },
          { id: 'b58-altimeter-desc', label: 'Altimeter', expectedState: 'SET' },
          { id: 'b58-mixtures-desc', label: 'Mixtures', expectedState: 'ENRICH' },
          { id: 'b58-cowl-desc', label: 'Cowl Flaps', expectedState: 'AS REQUIRED' },
          { id: 'b58-prop-sync-desc', label: 'Prop Sync', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-landing',
        title: 'Before Landing',
        items: [
          { id: 'b58-fuel-sel-land', label: 'Fuel Selectors', expectedState: 'ON' },
          { id: 'b58-mixtures-land', label: 'Mixtures (Both)', expectedState: 'RICH' },
          { id: 'b58-props-land', label: 'Props (Both)', expectedState: 'FULL FORWARD' },
          { id: 'b58-gear-land', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'b58-flaps-land', label: 'Flaps', expectedState: 'AS REQUIRED' },
          { id: 'b58-land-light', label: 'Landing Light', expectedState: 'ON' },
          { id: 'b58-speed-land', label: 'Airspeed', expectedState: '95 KIAS (FINAL)' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'b58-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'b58-cowl-al', label: 'Cowl Flaps', expectedState: 'OPEN' },
          { id: 'b58-land-light-off', label: 'Landing Light', expectedState: 'OFF' },
          { id: 'b58-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'b58-taxi-light-al', label: 'Taxi Light', expectedState: 'ON' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'b58-park-brake-sd', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'b58-avionics-off', label: 'Avionics Master', expectedState: 'OFF' },
          { id: 'b58-mixtures-off', label: 'Mixtures (Both)', expectedState: 'IDLE CUT OFF' },
          { id: 'b58-ignition-off', label: 'Ignition (Both)', expectedState: 'OFF' },
          { id: 'b58-master-off', label: 'Master Switch', expectedState: 'OFF' },
        ],
      },
    ],
  },
  a310: {
    planeId: 'a310',
    phases: [
      {
        id: 'pre-flight',
        title: 'Pre-Flight',
        items: [
          { id: 'a310-battery', label: 'Batteries (1 & 2)', expectedState: 'ON' },
          { id: 'a310-ext-pwr', label: 'External Power', expectedState: 'ON (IF AVAIL)' },
          { id: 'a310-irs', label: 'IRS (All 3)', expectedState: 'NAV' },
          { id: 'a310-fmc', label: 'FMC / MCDU', expectedState: 'PROGRAM ROUTE' },
          { id: 'a310-fuel-qty', label: 'Fuel Quantity', expectedState: 'CHECK' },
          { id: 'a310-emer-lights', label: 'Emergency Lights', expectedState: 'ARMED' },
          { id: 'a310-signs', label: 'Seatbelt / No Smoking Signs', expectedState: 'ON' },
          { id: 'a310-nav-lights', label: 'Navigation Lights', expectedState: 'ON' },
          { id: 'a310-oxygen', label: 'Oxygen', expectedState: 'ON & CHECK' },
        ],
      },
      {
        id: 'apu-start',
        title: 'APU Start',
        items: [
          { id: 'a310-apu-master', label: 'APU Master', expectedState: 'ON' },
          { id: 'a310-apu-start', label: 'APU Start', expectedState: 'ON' },
          { id: 'a310-apu-avail', label: 'APU', expectedState: 'AVAIL (WAIT)' },
          { id: 'a310-apu-gen', label: 'APU Generator', expectedState: 'ON' },
          { id: 'a310-apu-bleed', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'a310-ext-pwr-off', label: 'External Power', expectedState: 'OFF' },
        ],
      },
      {
        id: 'before-taxi',
        title: 'Before Taxi',
        items: [
          { id: 'a310-probe-heat', label: 'Probe Heat', expectedState: 'ON' },
          { id: 'a310-hyd', label: 'Hydraulic Pumps', expectedState: 'ON' },
          { id: 'a310-packs', label: 'Pack 1 & 2', expectedState: 'ON' },
          { id: 'a310-eng-bleed', label: 'Engine Bleed (Both)', expectedState: 'ON' },
          { id: 'a310-fuel-pumps', label: 'Fuel Pumps', expectedState: 'ON' },
          { id: 'a310-beacon', label: 'Beacon', expectedState: 'ON' },
          { id: 'a310-flt-ctrl', label: 'Flight Controls', expectedState: 'CHECK' },
          { id: 'a310-doors', label: 'Doors', expectedState: 'CLOSED' },
        ],
      },
      {
        id: 'engine-start',
        title: 'Engine Start',
        items: [
          { id: 'a310-packs-off', label: 'Packs', expectedState: 'OFF' },
          { id: 'a310-eng2-start', label: 'Engine 2 Start Selector', expectedState: 'GRD' },
          { id: 'a310-eng2-master', label: 'Engine 2 Master', expectedState: 'ON' },
          { id: 'a310-n2-2', label: 'Engine 2 N2', expectedState: 'CHECK ROTATION' },
          { id: 'a310-egt-2', label: 'Engine 2 EGT', expectedState: 'CHECK' },
          { id: 'a310-eng1-start', label: 'Engine 1 Start Selector', expectedState: 'GRD' },
          { id: 'a310-eng1-master', label: 'Engine 1 Master', expectedState: 'ON' },
          { id: 'a310-n2-1', label: 'Engine 1 N2', expectedState: 'CHECK ROTATION' },
          { id: 'a310-egt-1', label: 'Engine 1 EGT', expectedState: 'CHECK' },
          { id: 'a310-packs-on', label: 'Packs', expectedState: 'ON' },
          { id: 'a310-apu-bleed-off', label: 'APU Bleed', expectedState: 'OFF' },
          { id: 'a310-apu-off', label: 'APU Master', expectedState: 'OFF' },
        ],
      },
      {
        id: 'taxi',
        title: 'Taxi',
        items: [
          { id: 'a310-taxi-light', label: 'Nose / Taxi Light', expectedState: 'ON' },
          { id: 'a310-brakes', label: 'Brakes', expectedState: 'CHECK' },
          { id: 'a310-instruments', label: 'Flight Instruments', expectedState: 'CHECK' },
          { id: 'a310-flt-ctrl-taxi', label: 'Flight Controls', expectedState: 'CHECK' },
        ],
      },
      {
        id: 'before-takeoff',
        title: 'Before Takeoff',
        items: [
          { id: 'a310-flaps-to', label: 'Flaps / Slats', expectedState: 'SET FOR TAKEOFF' },
          { id: 'a310-spoilers', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'a310-tcas', label: 'Transponder / TCAS', expectedState: 'TA/RA' },
          { id: 'a310-strobe', label: 'Strobe Lights', expectedState: 'ON' },
          { id: 'a310-land-lights', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'a310-takeoff-cfg', label: 'Takeoff Config', expectedState: 'CHECK' },
          { id: 'a310-thrust-rating', label: 'Thrust Rating', expectedState: 'SET (MANUAL)' },
        ],
      },
      {
        id: 'takeoff',
        title: 'Takeoff',
        items: [
          { id: 'a310-thrust', label: 'Thrust Levers', expectedState: 'ADVANCE MANUALLY' },
          { id: 'a310-n1', label: 'N1', expectedState: 'CHECK TARGET' },
          { id: 'a310-v1', label: 'V1', expectedState: 'CHECK' },
          { id: 'a310-vr', label: 'Rotate (VR)', expectedState: 'ROTATE' },
          { id: 'a310-pos-rate', label: 'Positive Rate', expectedState: 'GEAR UP' },
        ],
      },
      {
        id: 'climb',
        title: 'Climb',
        items: [
          { id: 'a310-thrust-climb', label: 'Thrust', expectedState: 'SET CLIMB (MANUAL)' },
          { id: 'a310-flaps-climb', label: 'Flaps', expectedState: 'RETRACT ON SCHEDULE' },
          { id: 'a310-gear-off', label: 'Landing Gear Lever', expectedState: 'OFF' },
          { id: 'a310-ap', label: 'Autopilot', expectedState: 'ENGAGE' },
          { id: 'a310-press-climb', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'a310-altimeter-climb', label: 'Altimeter', expectedState: 'SET (18000: STD)' },
        ],
      },
      {
        id: 'cruise',
        title: 'Cruise',
        items: [
          { id: 'a310-cruise-alt', label: 'Cruise Altitude', expectedState: 'VERIFY' },
          { id: 'a310-thrust-cruise', label: 'Thrust', expectedState: 'SET CRUISE (MANUAL)' },
          { id: 'a310-fuel-cruise', label: 'Fuel', expectedState: 'CHECK BALANCE' },
          { id: 'a310-eng-cruise', label: 'Engine Parameters', expectedState: 'CHECK' },
          { id: 'a310-fmc-prog', label: 'FMC Progress', expectedState: 'MONITOR' },
        ],
      },
      {
        id: 'descent',
        title: 'Descent',
        items: [
          { id: 'a310-atis-desc', label: 'ATIS', expectedState: 'CHECK' },
          { id: 'a310-fmc-arr', label: 'FMC Arrival', expectedState: 'VERIFY' },
          { id: 'a310-altimeter-desc', label: 'Altimeter', expectedState: 'SET (BELOW TL)' },
          { id: 'a310-press-desc', label: 'Pressurization', expectedState: 'CHECK' },
          { id: 'a310-speed-brake', label: 'Speed Brake', expectedState: 'AS REQUIRED' },
        ],
      },
      {
        id: 'approach',
        title: 'Approach',
        items: [
          { id: 'a310-app-speed', label: 'Approach Speed', expectedState: 'SET' },
          { id: 'a310-flaps-app', label: 'Flaps / Slats', expectedState: 'SET' },
          { id: 'a310-gear-app', label: 'Landing Gear', expectedState: 'DOWN & LOCKED' },
          { id: 'a310-spoilers-app', label: 'Spoilers', expectedState: 'ARMED' },
          { id: 'a310-land-lights-app', label: 'Landing Lights', expectedState: 'ON' },
          { id: 'a310-app-mode', label: 'ILS / VOR Approach', expectedState: 'ENGAGE' },
        ],
      },
      {
        id: 'landing',
        title: 'Landing',
        items: [
          { id: 'a310-flaps-land', label: 'Flaps', expectedState: 'FULL (40°)' },
          { id: 'a310-vref', label: 'Airspeed', expectedState: 'VREF' },
          { id: 'a310-thrust-land', label: 'Thrust', expectedState: 'MANUAL TO IDLE' },
          { id: 'a310-reversers', label: 'Reverse Thrust', expectedState: 'DEPLOY' },
        ],
      },
      {
        id: 'after-landing',
        title: 'After Landing',
        items: [
          { id: 'a310-spoilers-ret', label: 'Spoilers', expectedState: 'RETRACT' },
          { id: 'a310-flaps-al', label: 'Flaps', expectedState: 'UP' },
          { id: 'a310-strobe-off', label: 'Strobe Lights', expectedState: 'OFF' },
          { id: 'a310-land-lights-off', label: 'Landing Lights', expectedState: 'OFF' },
          { id: 'a310-nose-taxi', label: 'Nose / Taxi Light', expectedState: 'ON' },
          { id: 'a310-transponder-stby', label: 'Transponder', expectedState: 'STANDBY' },
          { id: 'a310-apu-al', label: 'APU', expectedState: 'START' },
        ],
      },
      {
        id: 'shutdown',
        title: 'Shutdown',
        items: [
          { id: 'a310-park-brake', label: 'Parking Brake', expectedState: 'SET' },
          { id: 'a310-eng1-off', label: 'Engine 1 Master', expectedState: 'OFF' },
          { id: 'a310-eng2-off', label: 'Engine 2 Master', expectedState: 'OFF' },
          { id: 'a310-seatbelt-off', label: 'Seatbelt Sign', expectedState: 'OFF' },
          { id: 'a310-apu-bleed-sd', label: 'APU Bleed', expectedState: 'ON' },
          { id: 'a310-hyd-off', label: 'Hydraulic Pumps', expectedState: 'OFF' },
          { id: 'a310-irs-off', label: 'IRS (All 3)', expectedState: 'OFF' },
          { id: 'a310-oxygen-off', label: 'Oxygen', expectedState: 'OFF' },
          { id: 'a310-apu-sd-off', label: 'APU Master', expectedState: 'OFF' },
          { id: 'a310-battery-off', label: 'Batteries (1 & 2)', expectedState: 'OFF' },
        ],
      },
    ],
  },
};

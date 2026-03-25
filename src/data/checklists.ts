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
};

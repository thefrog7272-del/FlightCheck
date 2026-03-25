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
};

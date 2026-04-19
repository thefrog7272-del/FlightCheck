# GitHub Copilot Instructions for FlightCheck

## Terminology — strictly enforced

This codebase has two distinct concepts that must **never** be conflated or described with vague words:

| Concept | Correct term | Forbidden terms |
|---|---|---|
| The skill-level selection (beginner / advanced / expert / professional) | **`abilityVariant`** | ~~variant~~, ~~variants~~, ~~skill variant~~, ~~level variant~~ |
| The tab within a checklist (Normal / Abnormal / Emergency / Reference) | **`category`** | ~~sub-category~~, ~~variant category~~, ~~variant sub-category~~ |

### Rules
- **Never** use the word "variant" or "variants" alone — in code, comments, variable names, or when communicating back to the user. Always say **abilityVariant**.
- `category` belongs to a checklist. An abilityVariant IS a checklist. They are separate axes.
- Never combine them into a compound key such as `expert::Abnormal`. Keep them separate in storage, URLs, and code.

## Data model

```
Plane  (one record per aircraft)
├── base checklist          stored at key: planeId
│   ├── category: Normal    (the base checklist itself)
│   ├── category: Abnormal  stored at key: planeId::Abnormal
│   ├── category: Emergency stored at key: planeId::Emergency
│   └── category: Reference stored at key: planeId::Reference Tables
└── abilityVariant checklists  stored in ability_variant_checklists[planeId][abilityVariant][category]
    ├── abilityVariant: expert
    │   ├── category: Standard   (the expert Normal checklist)
    │   ├── category: Abnormal
    │   └── category: Emergency
    └── abilityVariant: professional
        ├── category: Standard
        └── category: Abnormal
```

## URL structure

```
/checklist/:planeId                                    base Normal
/checklist/:planeId/:categoryName                      base category
/checklist/:planeId/av/:abilityVariant                 abilityVariant Normal
/checklist/:planeId/av/:abilityVariant/:categoryName   abilityVariant category
```

- `abilityVariant` and `categoryName` are **always separate URL params** — never combined.
- The `/av/` segment is the URL prefix that signals an abilityVariant context.

## Storage

- Base checklist categories: `custom_checklists` keyed by `planeId::categoryName`
- AbilityVariant checklists: `ability_variant_checklists[planeId][abilityVariant][categoryName]`
- For Supabase (shared): abilityVariant records use `plane_id = planeId`, `variant_name = abilityVariant`, `category = lowercase_db_value` where db values are `normal` / `abnormal` / `emergency` / `reference_table`

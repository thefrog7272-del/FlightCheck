## Summary
- Rename `getVariants`/`addVariant`/`deleteVariant` to `getCategories`/`addCategory`/`deleteCategory` in useFleet hook
- Update Checklist.tsx and VariantSelector.tsx to use category terminology in UI-facing code
- Keep internal implementation details unchanged (URL routing, voice navigation callbacks)
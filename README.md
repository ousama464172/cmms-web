[README-CLEANUP.txt](https://github.com/user-attachments/files/22142021/README-CLEANUP.txt)
Repository cleanup & restructure

Upload these files preserving paths. Then delete old duplicates.

Keep (create if missing):
  index.html
  src/main.tsx
  src/ui/App.tsx
  src/ui/styles.css
  src/lib/firebase.ts
  src/ui/pages/ (contains your pages)

Moved from repo root into src/ui/pages/: 
  Assets.tsx, WorkOrders.tsx, PM.tsx, Inventory.tsx, Dashboard.tsx, Safety.tsx, GMP.tsx

Delete from repo root (after moving):
  - Assets.tsx
  - WorkOrders.tsx
  - PM.tsx
  - Inventory.tsx
  - Dashboard.tsx
  - Safety.tsx
  - GMP.tsx
  - main.tsx

Final tree should be:
/
  index.html
  src/
    main.tsx
    lib/firebase.ts
    ui/
      App.tsx
      styles.css
      pages/
        (your .tsx pages)

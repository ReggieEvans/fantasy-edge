import { useMemo,useState } from "react";

import { TargetPool } from "@/app/(protected)/cfb/slate-manager/_types/targetPool";


type SortKey = "target_type" | "position" | "salary" | "projection";

export default function useTargetPoolControls(targets: TargetPool[]) {
  const [filterPosition, setFilterPosition] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("target_type");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 1️⃣ filtered targets
  const filteredTargets = useMemo(() => {
    if (!filterPosition) return targets;
    return targets.filter((t) => t.position === filterPosition);
  }, [filterPosition, targets]);

  // 2️⃣ sorted & grouped targets
  const groupedTargets = useMemo(() => {
    const groups: Record<string, TargetPool[]> = {};

    filteredTargets.forEach((t) => {
      let groupKey = "";

      switch (sortKey) {
        case "target_type":
          groupKey = t.target_type
            ? t.target_type?.toUpperCase() || "No Type"
            : "No Type";
          break;
        case "position":
          groupKey = t.position;
          break;
        case "salary":
          groupKey =
            t.salary >= 50000
              ? "High Salary"
              : t.salary >= 20000
              ? "Mid Salary"
              : "Low Salary";
          break;
        case "projection":
          const proj = t.projection || 0;
          if (proj >= 20) groupKey = "20+";
          else if (proj >= 10) groupKey = "10+";
          else groupKey = "0-9";
          break;
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(t);
    });

    // Optional: sort groups alphabetically or numerically
    const sortedGroups = Object.entries(groups).sort(([a], [b]) =>
      sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );

    return sortedGroups;
  }, [filteredTargets, sortKey, sortOrder]);

  return {
    filterPosition,
    setFilterPosition,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    groupedTargets,
  };
}
import React from 'react'
import type { StageFormData } from "./stage-step-one";

const formats = [
  { id: "single-elimination", name: "Single Elimination" },
  { id: "double-elimination", name: "Double Elimination" },
  { id: "round-robin", name: "Round Robin" },
  { id: "swiss-round", name: "Swiss Round" },
  { id: "battle-royal", name: "Battle Royal" },
  { id: "custom", name: "Custom Stage" },
];

export function StageStepTwo({
  formData,
  setFormData,
}: {
  formData: StageFormData;
  setFormData: (d: StageFormData) => void;
}) {
  const participants = Number(formData.participants || 0)
  const isInt = Number.isInteger(participants) && participants > 0
  const isPowerOfTwo = isInt && (participants & (participants - 1)) === 0
  function disabled(id: string) {
    switch (id) {
      case "double-elimination":
        return !isInt || participants < 4 || !isPowerOfTwo
      case "single-elimination":
        return !isInt || participants < 2
      case "round-robin":
        return !isInt || participants < 2
      case "swiss-round":
        return !isInt || participants < 4
      case "battle-royal":
        return !isInt || participants < 2
      default:
        return false
    }
  }
  return (
    <div className="p-4 border rounded grid gap-3">
      {formats.map((f) => (
        <button
          key={f.id}
          onClick={() => !disabled(f.id) && setFormData({ ...formData, formatType: f.id })}
          className={`text-left p-3 rounded border ${
            formData.formatType === f.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          disabled={disabled(f.id)}
        >
          <div className="font-medium">{f.name}</div>
          <div className="text-xs text-muted-foreground">
            {f.id}
            {disabled(f.id) && " • invalid for current participants"}
          </div>
        </button>
      ))}
    </div>
  );
}

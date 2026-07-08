"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface MetadataField {
  key: string;
  value: string;
}

interface MetadataFieldsProps {
  fields: MetadataField[];
  onChange: (fields: MetadataField[]) => void;
}

export function MetadataFields({ fields, onChange }: MetadataFieldsProps) {
  const addField = () => {
    onChange([...fields, { key: "", value: "" }]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, prop: "key" | "value", val: string) => {
    const updated = fields.map((f, i) =>
      i === index ? { ...f, [prop]: val } : f
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">
          Custom Metadata
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addField}
          className="h-7 gap-1.5 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground/50 italic py-2">
          No custom metadata fields. Click &quot;Add Field&quot; to add key-value pairs.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center gap-2 group animate-in fade-in slide-in-from-top-1 duration-200">
            <Input
              placeholder="Key (e.g. departemen)"
              value={field.key}
              onChange={(e) => updateField(index, "key", e.target.value)}
              className="flex-1 h-9 bg-white/[0.03] border-white/10 text-sm placeholder:text-muted-foreground/40 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <Input
              placeholder="Value (e.g. HR)"
              value={field.value}
              onChange={(e) => updateField(index, "value", e.target.value)}
              className="flex-1 h-9 bg-white/[0.03] border-white/10 text-sm placeholder:text-muted-foreground/40 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <button
              type="button"
              onClick={() => removeField(index)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

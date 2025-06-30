import { Input } from "@/components/ui/input";

interface FormulaBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormulaBar({ value, onChange }: FormulaBarProps) {
  return (
    <Input
        value={value}
        onChange={onChange}
        placeholder="Enter a value or formula"
        className="bg-background border-input shadow-sm h-9 flex-1"
      />
  );
}

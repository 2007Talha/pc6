import type { QuickPreset } from '../constants/index.ts';

interface PresetsBarProps {
  readonly presets: readonly QuickPreset[];
  readonly onSelectPreset: (preset: QuickPreset) => void;
  readonly disabled: boolean;
}

export function PresetsBar({ presets, onSelectPreset, disabled }: PresetsBarProps) {
  return (
    <div className="presets-container" role="region" aria-label="Quick test scenario presets">
      <span className="presets-label">⚡ 1-Click Test Presets:</span>
      <div className="presets-buttons">
        {presets.map(preset => (
          <button
            key={preset.id}
            type="button"
            className="btn-preset"
            onClick={() => onSelectPreset(preset)}
            disabled={disabled}
            title={`Load preset: ${preset.label}`}
          >
            <span aria-hidden="true">{preset.icon}</span> {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

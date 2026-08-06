import React, { useState } from 'react';
import { BlouseMeasurement } from '../../types';
import { useStore } from '../../store/useStore';
import { Scissors, Save, Check } from 'lucide-react';

interface Props {
  initialValues?: BlouseMeasurement;
  onSave: (measurement: BlouseMeasurement) => void;
  compact?: boolean;
}

export const BlouseMeasurementForm: React.FC<Props> = ({
  initialValues,
  onSave,
  compact = false
}) => {
  const { blouseProfiles, saveBlouseProfile } = useStore();

  const [measurement, setMeasurement] = useState<BlouseMeasurement>(
    initialValues || {
      profileName: 'My Custom Fit',
      bust: 36,
      underBust: 31,
      waist: 28,
      shoulder: 14.5,
      frontNeckDepth: 7.5,
      backNeckDepth: 10,
      sleeveLength: 10,
      armHole: 16,
      style: 'Padded Royal Cut'
    }
  );

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  const handleSelectSavedProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const found = blouseProfiles.find((p) => p.id === profileId);
    if (found) {
      setMeasurement(found);
      onSave(found);
    }
  };

  const handleFieldChange = (field: keyof BlouseMeasurement, value: any) => {
    const updated = { ...measurement, [field]: value };
    setMeasurement(updated);
    onSave(updated);
  };

  const handleSaveToAccount = () => {
    saveBlouseProfile(measurement);
  };

  return (
    <div className={`bg-white rounded-xl p-4 sm:p-5 border border-[#E6DFC6] ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3EFE6] pb-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#C28E46]" />
          <h4 className="font-serif font-bold text-sm text-[#2C221E]">
            Custom Blouse Stitching Form
          </h4>
        </div>

        {blouseProfiles.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 hidden sm:inline">Use Saved Profile:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => handleSelectSavedProfile(e.target.value)}
              className="bg-[#FAF7F2] text-[#2C221E] font-medium border border-[#E6DFC6] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#C28E46]"
            >
              <option value="">-- Choose Profile --</option>
              {blouseProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.profileName} ({p.bust}" Bust)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Profile Name & Style Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-[#2C221E] uppercase tracking-wider mb-1">
            Profile Label
          </label>
          <input
            type="text"
            value={measurement.profileName}
            onChange={(e) => handleFieldChange('profileName', e.target.value)}
            placeholder="e.g. Bridal Reception Fit"
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-3 py-2 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#2C221E] uppercase tracking-wider mb-1">
            Neck & Cut Style
          </label>
          <select
            value={measurement.style}
            onChange={(e) => handleFieldChange('style', e.target.value as any)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-3 py-2 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
          >
            <option value="Padded Royal Cut">Padded Royal Cut (Regal Bridal)</option>
            <option value="Boat Neck Classic">Boat Neck Classic (Modern Clean)</option>
            <option value="Deep V-Back">Deep V-Back with Latkan Tassels</option>
            <option value="Sleeveless High Neck">Sleeveless High Neck</option>
            <option value="Standard Round">Standard Round Neck</option>
          </select>
        </div>
      </div>

      {/* Numerical Measurements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Bust (Inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurement.bust}
            onChange={(e) => handleFieldChange('bust', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Waist (Inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurement.waist}
            onChange={(e) => handleFieldChange('waist', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Shoulder Width</label>
          <input
            type="number"
            step="0.5"
            value={measurement.shoulder}
            onChange={(e) => handleFieldChange('shoulder', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Sleeve Length</label>
          <input
            type="number"
            step="0.5"
            value={measurement.sleeveLength}
            onChange={(e) => handleFieldChange('sleeveLength', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Front Neck Depth</label>
          <input
            type="number"
            step="0.5"
            value={measurement.frontNeckDepth}
            onChange={(e) => handleFieldChange('frontNeckDepth', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Back Neck Depth</label>
          <input
            type="number"
            step="0.5"
            value={measurement.backNeckDepth}
            onChange={(e) => handleFieldChange('backNeckDepth', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Armhole</label>
          <input
            type="number"
            step="0.5"
            value={measurement.armHole}
            onChange={(e) => handleFieldChange('armHole', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">Under Bust</label>
          <input
            type="number"
            step="0.5"
            value={measurement.underBust}
            onChange={(e) => handleFieldChange('underBust', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] text-xs text-[#2C221E] px-2.5 py-1.5 rounded-md border border-[#E6DFC6] text-center font-bold focus:outline-none focus:border-[#C28E46]"
          />
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-[#F3EFE6]">
        <p className="text-[11px] text-stone-500 italic">
          * Standard stitching takes 3-5 business days before dispatch.
        </p>
        <button
          type="button"
          onClick={handleSaveToAccount}
          className="text-xs text-[#C28E46] hover:text-[#2C221E] font-bold flex items-center gap-1 transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> Save Profile to Account
        </button>
      </div>
    </div>
  );
};

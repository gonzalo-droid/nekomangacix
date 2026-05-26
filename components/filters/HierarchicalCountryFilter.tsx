'use client';

import { COUNTRY_CODES, COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { getEditorialsForCountry } from '@/lib/constants/editorials';

interface HierarchicalCountryFilterProps {
  selectedCountry: CountryCode | null;
  selectedEditorial: string | null;
  onChange: (next: { country: CountryCode | null; editorial: string | null }) => void;
}

const pillBase =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap';
const pillIdle =
  'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
const pillActive =
  'border-[#2b496d] bg-[#2b496d] text-white';

export default function HierarchicalCountryFilter({
  selectedCountry,
  selectedEditorial,
  onChange,
}: HierarchicalCountryFilterProps) {
  const editorials = selectedCountry ? getEditorialsForCountry(selectedCountry) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ country: null, editorial: null })}
          className={`${pillBase} ${selectedCountry === null ? pillActive : pillIdle}`}
          aria-pressed={selectedCountry === null}
        >
          Todos
        </button>
        {COUNTRY_CODES.map((code) => {
          const active = selectedCountry === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() =>
                onChange({
                  country: active ? null : code,
                  editorial: active ? null : null,
                })
              }
              className={`${pillBase} ${active ? pillActive : pillIdle}`}
              aria-pressed={active}
            >
              <span aria-hidden="true">{COUNTRIES[code].flag}</span>
              <span>{COUNTRIES[code].name}</span>
            </button>
          );
        })}
      </div>

      {selectedCountry && editorials.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-1 border-l-2 border-gray-200 dark:border-gray-700 ml-1">
          <button
            type="button"
            onClick={() => onChange({ country: selectedCountry, editorial: null })}
            className={`${pillBase} ${selectedEditorial === null ? pillActive : pillIdle} ml-2`}
            aria-pressed={selectedEditorial === null}
          >
            Todas
          </button>
          {editorials.map((ed) => {
            const active = selectedEditorial === ed;
            return (
              <button
                key={ed}
                type="button"
                onClick={() =>
                  onChange({ country: selectedCountry, editorial: active ? null : ed })
                }
                className={`${pillBase} ${active ? pillActive : pillIdle}`}
                aria-pressed={active}
              >
                {ed}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createContext, useContext, useState } from "react";

/**
 * SelectionContext — manages the global State/District selection.
 * All pages consume this to filter their data by the selected region.
 *
 * Phase 0 spec Section 14.1: 7 North-Eastern states.
 * Mock data is all Idukki, Kerala — but we include Kerala for demo
 * so the selectors actually filter something visible.
 */

const STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Tripura",
];

/**
 * Districts per state. For demo purposes, only Kerala has real mock data.
 * Other states have placeholder districts so the cascading selector works.
 */
const DISTRICTS_BY_STATE = {
  Kerala: ["Idukki"],
  Assam: ["Kamrup", "Dibrugarh", "Cachar"],
  Manipur: ["Imphal West", "Imphal East", "Churachandpur"],
  Meghalaya: ["East Khasi Hills", "West Garo Hills", "Jaintia Hills"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "West Kameng"],
  Tripura: ["West Tripura", "South Tripura", "Dhalai"],
};

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const states = STATES;
  const districts = selectedState ? (DISTRICTS_BY_STATE[selectedState] || []) : [];

  function selectState(state) {
    setSelectedState(state);
    setSelectedDistrict(null); // reset district when state changes
  }

  function selectDistrict(district) {
    setSelectedDistrict(district);
  }

  const value = {
    selectedState,
    selectedDistrict,
    states,
    districts,
    selectState,
    selectDistrict,
    /** Convenience: is the current filter actually applied? */
    hasFilter: selectedState !== null || selectedDistrict !== null,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}

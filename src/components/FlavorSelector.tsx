
import React from "react";
import { TeaFlavor, FlavorOption } from "@/types/bubbleTea";
import { cn } from "@/lib/utils";

interface FlavorSelectorProps {
  selectedFlavor: TeaFlavor;
  onSelectFlavor: (flavor: TeaFlavor) => void;
}

const flavors: FlavorOption[] = [
  {
    id: "milk",
    name: "Milk Tea",
    color: "#F8F4E3",
    description: "Creamy, smooth classic milk tea",
  },
  {
    id: "green",
    name: "Green Tea",
    color: "#7FB069",
    description: "Refreshing, earthy green tea",
  },
  {
    id: "citrus",
    name: "Citrus Tea",
    color: "#FFBE0B",
    description: "Bright, tangy citrus tea",
  },
];

const FlavorSelector: React.FC<FlavorSelectorProps> = ({
  selectedFlavor,
  onSelectFlavor,
}) => {
  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium text-gray-700">Select Tea Base</h3>
        <p className="text-sm text-gray-500">Choose one flavor for your tea</p>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {flavors.map((flavor) => (
          <button
            key={flavor.id}
            onClick={() => onSelectFlavor(flavor.id)}
            className={cn(
              "flavor-chip flex items-center justify-center relative overflow-hidden group",
              selectedFlavor === flavor.id ? "selected" : "",
              "border border-gray-100"
            )}
            style={{
              backgroundColor: flavor.color,
              color: flavor.id === "green" ? "white" : "black",
            }}
          >
            <div className="relative z-10">
              <span className="font-medium">{flavor.name}</span>
            </div>
            <div 
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                selectedFlavor === flavor.id ? "opacity-10" : ""
              )}
              style={{ backgroundColor: "#000" }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 h-8">
        {flavors.map((flavor) => (
          <p
            key={flavor.id}
            className={cn(
              "text-sm text-gray-600 transition-all duration-300",
              selectedFlavor === flavor.id ? "opacity-100" : "opacity-0 hidden"
            )}
          >
            {flavor.description}
          </p>
        ))}
      </div>
    </div>
  );
};

export default FlavorSelector;

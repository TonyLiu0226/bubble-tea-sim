
import React from "react";
import { Topping, ToppingOption } from "@/types/bubbleTea";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ToppingSelectorProps {
  selectedToppings: Topping[];
  onToggleTopping: (topping: Topping) => void;
}

const toppings: ToppingOption[] = [
  {
    id: "blackPearl",
    name: "Black Pearls",
    color: "#222222",
    description: "Chewy tapioca pearls",
  },
  {
    id: "pineapple",
    name: "Pineapple",
    color: "#FFDD00",
    description: "Sweet pineapple chunks",
  },
  {
    id: "octopusBall",
    name: "Octopus Balls",
    color: "#6B4226",
    description: "Savory octopus-flavored balls",
  },
  {
    id: "squidLeg",
    name: "Squid Legs",
    color: "#F6D8CE",
    description: "Tender squid pieces",
  },
  {
    id: "jelly",
    name: "Jelly",
    color: "#E0F2E9",
    description: "Soft, translucent jelly cubes",
  },
];

const ToppingSelector: React.FC<ToppingSelectorProps> = ({
  selectedToppings,
  onToggleTopping,
}) => {
  return (
    <div className="w-full animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium text-gray-700">
          Choose Your Toppings
        </h3>
        <p className="text-sm text-gray-500">Select up to 5 toppings</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 mt-4">
        {toppings.map((topping) => {
          const isSelected = selectedToppings.includes(topping.id);
          return (
            <button
              key={topping.id}
              onClick={() => onToggleTopping(topping.id)}
              className={cn(
                "topping-chip flex items-center justify-between gap-2 group",
                isSelected ? "selected" : "",
                "border border-gray-100"
              )}
              style={{
                backgroundColor: topping.color,
                color: topping.id === "blackPearl" ? "white" : "black",
              }}
            >
              <span className="font-medium">{topping.name}</span>
              <span
                className={cn(
                  "size-4 rounded-full flex items-center justify-center transition-all duration-300",
                  isSelected
                    ? "bg-white/70 opacity-100"
                    : "bg-transparent opacity-0"
                )}
              >
                <Check
                  className={cn(
                    "size-3",
                    topping.id === "blackPearl" ? "text-black" : "text-black"
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {selectedToppings.length === 0 ? (
          <p>No toppings selected</p>
        ) : (
          <p>
            Selected: {selectedToppings.length} topping
            {selectedToppings.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default ToppingSelector;

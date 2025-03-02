
import React, { useState } from "react";
import { BubbleTeaConfig, TeaFlavor, Topping } from "@/types/bubbleTea";
import BubbleTeaSimulator from "@/components/BubbleTeaSimulator";
import FlavorSelector from "@/components/FlavorSelector";
import ToppingSelector from "@/components/ToppingSelector";
import { motion } from "framer-motion";

const Index = () => {
  const [bubbleTeaConfig, setBubbleTeaConfig] = useState<BubbleTeaConfig>({
    flavor: "milk",
    toppings: [],
  });

  const handleSelectFlavor = (flavor: TeaFlavor) => {
    setBubbleTeaConfig((prev) => ({
      ...prev,
      flavor,
    }));
  };

  const handleToggleTopping = (topping: Topping) => {
    setBubbleTeaConfig((prev) => {
      const toppings = [...prev.toppings];
      const index = toppings.indexOf(topping);
      
      if (index === -1) {
        // Add topping if not already present
        return {
          ...prev,
          toppings: [...toppings, topping],
        };
      } else {
        // Remove topping if already present
        toppings.splice(index, 1);
        return {
          ...prev,
          toppings,
        };
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-gray-50 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 mb-2">
              Bubble Tea Simulator
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
              Craft your perfect bubble tea with our interactive 3D simulator. 
              Choose a tea base and add your favorite toppings.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full flex flex-col"
          >
            <BubbleTeaSimulator config={bubbleTeaConfig} />
            <div className="glass-panel mt-4 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Drag to rotate. Scroll to zoom.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-6 rounded-xl space-y-8"
          >
            <FlavorSelector
              selectedFlavor={bubbleTeaConfig.flavor}
              onSelectFlavor={handleSelectFlavor}
            />
            
            <div className="w-full h-px bg-gray-100" />
            
            <ToppingSelector
              selectedToppings={bubbleTeaConfig.toppings}
              onToggleTopping={handleToggleTopping}
            />

            <div className="pt-4">
              <div className="glass-panel p-4 rounded-lg bg-white/50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Bubble Tea</h4>
                <p className="text-sm text-gray-600">
                  {bubbleTeaConfig.flavor.charAt(0).toUpperCase() + bubbleTeaConfig.flavor.slice(1)} Tea
                  {bubbleTeaConfig.toppings.length > 0 ? (
                    <> with {bubbleTeaConfig.toppings.map(t => 
                      t.charAt(0).toUpperCase() + 
                      t.slice(1).replace(/([A-Z])/g, ' $1').trim()
                    ).join(', ')}</>
                  ) : (
                    <> (No toppings)</>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;

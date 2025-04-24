"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface ClimateScoreInfoProps {
  className?: string;
}

export default function ClimateScoreInfo({
  className = "",
}: ClimateScoreInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`text-blue-600 text-sm flex items-center hover:underline ${className}`}
        >
          <Info className="w-4 h-4 mr-1" />
          What is Climate Score?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 xl:w-full z-[100]">
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 mb-2">
            Tentang Climate Score
          </h3>

          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Climate Score is an indicator that shows how safe the property
              location is from climate change risks and environmental
              conditions.
            </p>

            <div>
              <h4 className="font-medium text-gray-700">
                LST (Land Surface Temperature)
              </h4>
              <p>
                The land surface temperature in the property area. A high score
                indicates lower and more comfortable temperatures.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">
                NDVI (Normalized Difference Vegetation Index)
              </h4>
              <p>
                Measures the availability of green space around the property. A
                high score indicates more vegetation.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">
                UTFVI (Urban Thermal Field Variance Index)
              </h4>
              <p>
                Measures urban temperature variation. A high score indicates
                more stable temperature variation.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">
                UHI (Urban Heat Island)
              </h4>
              <p>
                Measures the urban heat island effect. A high score indicates
                areas with minimal UHI effect.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Overall Score</h4>
              <p>
                An overall value that combines all the parameters above to
                assess the climate safety of the property.
              </p>
            </div>

            <div className="pt-2">
              <h4 className="font-medium text-gray-700">Score Guide:</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                  <span>80-100: Safe</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span>60-79: Moderate</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  <span>40-59: Caution</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                  <span>0-39: High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
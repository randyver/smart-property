// This file contains structured knowledge about SmartProperty to enhance the AI responses
// Place this file at: frontend/src/services/smartproperty-knowledge.ts

export const smartPropertyKnowledge = {
    // Climate Scores information
    climateScores: {
      overview: `Climate scores in SmartProperty measure how safe a property is from various climate-related risks. 
      The scores range from 0-100, with higher values indicating better climate safety.`,
      
      components: [
        {
          name: "LST (Land Surface Temperature)",
          description: "Measures the temperature of the land surface. Lower temperatures are better for comfort and energy efficiency.",
          importanceRank: 1,
          impactOnPrice: "Properties in areas with lower LST scores typically command 5-10% higher values."
        },
        {
          name: "NDVI (Normalized Difference Vegetation Index)",
          description: "Measures the amount of vegetation in the area. Higher vegetation provides better air quality and natural cooling.",
          importanceRank: 2,
          impactOnPrice: "Areas with abundant vegetation (high NDVI scores) can increase property values by 3-8%."
        },
        {
          name: "UTFVI (Urban Thermal Field Variance Index)",
          description: "Measures temperature variations across urban areas, highlighting heat pockets.",
          importanceRank: 3,
          impactOnPrice: "Properties in areas with stable temperatures tend to maintain better value over time."
        },
        {
          name: "UHI (Urban Heat Island)",
          description: "Measures how much warmer an area is compared to surrounding rural areas due to urban development.",
          importanceRank: 4,
          impactOnPrice: "Lower UHI effect correlates with 2-6% higher property values."
        }
      ],
      
      overallScore: "The overall climate safety score combines all components, with different weights based on their importance."
    },
    
    // Risk levels explanation
    riskLevels: {
      floodRisk: {
        veryLow: "The property is in an elevated area with excellent drainage systems. Historically, this area has not experienced flooding.",
        low: "The property has good elevation and drainage. Minimal risk of flooding even during heavy rainfall.",
        medium: "The property may experience some water accumulation during heavy rainfall, but serious flooding is rare.",
        high: "The property is in an area prone to flooding during monsoon seasons or heavy rainfall events.",
        veryHigh: "The property is in a flood-prone area with poor drainage. Regular flooding is likely during rainy seasons."
      },
      
      temperatureRisk: {
        veryLow: "The area maintains comfortable temperatures year-round with minimal heat events.",
        low: "The area experiences mild temperature variations with occasional warm days.",
        medium: "The area has moderate temperature fluctuations with some hot days during summer months.",
        high: "The area regularly experiences high temperatures during summer months, requiring significant cooling.",
        veryHigh: "The area suffers from extreme heat events with very high temperatures for extended periods."
      },
      
      airQuality: {
        excellent: "The area has pristine air quality with abundant vegetation and minimal pollution sources.",
        good: "The air quality is consistently good with low pollution levels.",
        moderate: "The air quality is acceptable but may occasionally worsen due to traffic or industrial activities.",
        poor: "The air quality is frequently compromised by pollution from traffic, industry, or other sources.",
        veryPoor: "The area suffers from severe air pollution problems, posing significant health risks."
      },
      
      landslideRisk: {
        veryLow: "The area is on stable, flat ground with no history of land movement.",
        low: "The area has stable soil conditions with minimal slope.",
        medium: "The property is on slightly sloped terrain but has adequate stabilization measures.",
        high: "The property is on steeper terrain with some risk of land movement during heavy rainfall.",
        veryHigh: "The property is in an area with unstable soil conditions and steep terrain, vulnerable to landslides."
      }
    },
    
    // Features of the platform
    platformFeatures: {
      mapVisualization: "Interactive map showing properties with climate risk overlays for flood, temperature, vegetation, and urban heat island effects.",
      
      propertyComparison: "Users can select up to 3 properties to compare side-by-side, with detailed climate risk assessments for each.",
      
      analytics: "Comprehensive analytics showing property distribution by district, price ranges, and climate factors across Bandung.",
      
      recommendations: "AI-powered recommendation engine that suggests properties based on user preferences and climate safety priorities."
    },
    
    // Typical user questions and detailed answers
    commonQuestions: [
      {
        question: "How do climate scores affect property values?",
        answer: `Properties with better climate scores (70+ out of 100) typically command a premium of 5-15% over similar properties with poor scores. 
        This is because climate-safe properties offer better long-term value, lower operating costs, and better quality of life. 
        Areas with good vegetation (high NDVI) and lower temperatures (better LST) are particularly valued in the Bandung market.`
      },
      {
        question: "What districts in Bandung have the best climate scores?",
        answer: `Based on our analytics, the districts with the highest overall climate safety scores in Bandung are typically those with more 
        green spaces and away from highly congested urban centers. The northeastern and southern districts generally score better 
        for climate safety due to higher elevation, more vegetation, and better air quality.`
      },
      {
        question: "How is flood risk calculated?",
        answer: `Flood risk is determined using a combination of historical flooding data, terrain elevation models, 
        proximity to water bodies, and drainage infrastructure quality. Our system analyzes these factors to generate 
        a flood risk score from "Very Low" to "Very High" for each property location.`
      },
      {
        question: "What makes a property climate-safe?",
        answer: `A climate-safe property typically has good scores across all four climate metrics: 
        1) Lower land surface temperatures (LST), 
        2) Higher vegetation index (NDVI), 
        3) Better urban thermal field variance (UTFVI), and 
        4) Lower urban heat island effect (UHI). 
        Additionally, properties with low flood and landslide risks, good air quality, and energy-efficient designs 
        contribute to overall climate safety.`
      }
    ]
  };
  
  export default smartPropertyKnowledge;
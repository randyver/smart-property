// This file contains comprehensive knowledge about SmartProperty to enhance AI responses
// Path: frontend/src/services/smartproperty-knowledge.ts

export const smartPropertyKnowledge = {
  // Climate Scores information
  climateScores: {
    overview: `Climate scores in SmartProperty measure how safe a property is from various climate-related risks. 
    The scores range from 0-100, with higher values indicating better climate safety.
    
    These scores are calculated based on geo-spatial data analysis using GIS technology and satellite imagery to evaluate environmental conditions around properties.`,
    
    components: [
      {
        name: "LST (Land Surface Temperature)",
        description: "Measures the temperature of the land surface. Lower temperatures are better for comfort and energy efficiency.",
        detailedExplanation: "LST is measured using thermal satellite imagery that can detect surface temperature differences. Areas with many hard surfaces like asphalt and concrete tend to have higher LST, while areas with more vegetation and water have lower LST.",
        importanceRank: 1,
        impactOnPrice: "Properties in areas with lower LST scores (cooler temperatures) typically command 5-10% higher values due to better comfort and lower cooling costs.",
        bandungContext: "In Bandung, areas with high LST are mainly in the city center and industrial zones, while areas in the higher northern and southern parts tend to have lower LST."
      },
      {
        name: "NDVI (Normalized Difference Vegetation Index)",
        description: "Measures the amount of vegetation in the area. Higher vegetation provides better air quality and natural cooling.",
        detailedExplanation: "NDVI is measured by comparing infrared and red light reflection from the earth's surface. Healthy plants absorb red light and reflect infrared light, so a high NDVI score indicates lush, healthy vegetation.",
        importanceRank: 2,
        impactOnPrice: "Areas with abundant vegetation (high NDVI scores) can increase property values by 3-8% due to healthier environments and better aesthetics.",
        bandungContext: "The Dago area, Ciumbuleuit, and some areas in North Bandung have high NDVI scores due to their abundant trees and parks."
      },
      {
        name: "UTFVI (Urban Thermal Field Variance Index)",
        description: "Measures temperature variations across urban areas, highlighting heat pockets.",
        detailedExplanation: "UTFVI combines LST data with vegetation indices to identify areas most affected by urban heat effects. Lower scores indicate areas that are cooler and more thermally stable.",
        importanceRank: 3,
        impactOnPrice: "Properties in areas with stable temperatures tend to maintain better value over time and experience slower depreciation.",
        bandungContext: "UTFVI variation in Bandung is very noticeable between the dense city center and greener outskirts. Temperature differences can reach 3-5°C during daytime."
      },
      {
        name: "UHI (Urban Heat Island)",
        description: "Measures how much warmer an area is compared to surrounding rural areas due to urban development.",
        detailedExplanation: "The UHI effect occurs when man-made surfaces like asphalt, concrete, and buildings absorb and store more heat than natural vegetation. Areas with high UHI experience higher temperatures, especially at night, which can affect health and energy consumption.",
        importanceRank: 4,
        impactOnPrice: "Lower UHI effect correlates with 2-6% higher property values due to lower cooling costs and more comfortable environments.",
        bandungContext: "Bandung's city center experiences significant UHI effect, with nighttime temperatures that can be 4-7°C higher than the outskirts."
      }
    ],
    
    overallScore: "The overall climate safety score combines all components, with different weights based on their importance. This score provides a comprehensive picture of a property's climate safety. Properties with scores of 80+ are considered very good, while properties with scores below 40 may face significant climate risks.",
    
    scoreMeaning: {
      "80-100": "Excellent - Property has a very healthy environment with minimal climate risks. Typically in areas with abundant vegetation, good drainage systems, and comfortable temperatures.",
      "60-79": "Good - Property has good environmental conditions with low climate risks. May have some areas that need attention but overall safe from a climate perspective.",
      "40-59": "Moderate - Property has some climate risks that need attention. May be in an area with limited vegetation or higher than average temperatures.",
      "20-39": "Poor - Property has significant climate risks. May be in an area with strong heat island effects, minimal vegetation, or drainage issues.",
      "0-19": "Very Poor - Property is at extreme climate risk. Typically in very dense, very hot, flood-prone areas, or areas with poor air quality."
    }
  },
  
  // Risk levels explanation
  riskLevels: {
    floodRisk: {
      explanation: "Flood risk is determined using a combination of historical flooding data, terrain elevation models, proximity to water bodies, and drainage infrastructure quality. Our system analyzes these factors to generate a flood risk score from 'Very Low' to 'Very High' for each property location.",
      veryLow: "The property is in an elevated area with excellent drainage systems. Historically, this area has not experienced flooding.",
      low: "The property has good elevation and drainage. Minimal risk of flooding even during heavy rainfall.",
      medium: "The property may experience some water accumulation during heavy rainfall, but serious flooding is rare.",
      high: "The property is in an area prone to flooding during monsoon seasons or heavy rainfall events.",
      veryHigh: "The property is in a flood-prone area with poor drainage. Regular flooding is likely during rainy seasons."
    },
    
    temperatureRisk: {
      explanation: "Temperature risk measures how hot an area is compared to the city average and the potential for future temperature increases. Contributing factors include lack of vegetation, heat-absorbing building materials, and air pollution.",
      veryLow: "The area maintains comfortable temperatures year-round with minimal heat events.",
      low: "The area experiences mild temperature variations with occasional warm days.",
      medium: "The area has moderate temperature fluctuations with some hot days during summer months.",
      high: "The area regularly experiences high temperatures during dry seasons, requiring significant cooling.",
      veryHigh: "The area suffers from extreme heat events with very high temperatures for extended periods."
    },
    
    airQuality: {
      explanation: "Air quality is measured using data from air monitoring stations, wind patterns, and the presence of pollutant sources such as highways and industries. Vegetation plays a major role in filtering air pollutants.",
      excellent: "The area has pristine air quality with abundant vegetation and minimal pollution sources.",
      good: "The air quality is consistently good with low pollution levels.",
      moderate: "The air quality is acceptable but may occasionally worsen due to traffic or industrial activities.",
      poor: "The air quality is frequently compromised by pollution from traffic, industry, or other sources.",
      veryPoor: "The area suffers from severe air pollution problems, posing significant health risks."
    },
    
    landslideRisk: {
      explanation: "Landslide risk is assessed based on slope steepness, soil type, vegetation cover, rainfall patterns, and historical landslide events. Areas with steep slopes and poor vegetation coverage are at higher risk.",
      veryLow: "The area is on stable, flat ground with no history of land movement.",
      low: "The area has stable soil conditions with minimal slope.",
      medium: "The property is on slightly sloped terrain but has adequate stabilization measures.",
      high: "The property is on steeper terrain with some risk of land movement during heavy rainfall.",
      veryHigh: "The property is in an area with unstable soil conditions and steep terrain, vulnerable to landslides."
    }
  },
  
  // Features of the platform
  platformFeatures: {
    mapVisualization: "Interactive map showing properties with climate risk overlays for flood, temperature, vegetation, and urban heat island effects. Users can toggle different layers to see how various climate factors affect different areas.",
    
    propertyComparison: "Users can select up to 3 properties to compare side-by-side, with detailed climate risk assessments for each property. The comparison tool allows buyers to make informed decisions based on both property features and climate safety.",
    
    analytics: "Comprehensive analytics showing property distribution by district, price ranges, and climate factors across Bandung. The analytics dashboard provides valuable insights for investors, developers, and policy makers.",
    
    recommendations: "AI-powered recommendation engine that suggests properties based on user preferences and climate safety priorities. The system can prioritize different climate factors based on user needs.",
    
    climateFiltering: "Advanced search filters that allow users to set minimum climate safety scores and prioritize specific climate factors such as flood risk or air quality.",
    
    detailedPropertyProfiles: "Each property listing includes comprehensive climate data, including historical climate events, future climate projections, and specific climate risks for the location."
  },
  
  // Specific to Bandung
  bandungSpecific: {
    overview: "Bandung, known as the 'Paris of Java,' has a varied topography that creates diverse microclimates across the city. The city's elevation (768m above sea level) provides cooler temperatures than other Indonesian cities, but urban development has led to increasing temperatures in dense areas.",
    
    districts: {
      north: "North Bandung (including Dago, Ciumbuleuit) generally has better climate scores due to higher elevation, more vegetation, and lower development density. These areas tend to have cooler temperatures and better air quality.",
      
      central: "Central Bandung has the highest development density and experiences significant urban heat island effects. These areas have higher temperatures, lower vegetation, and more drainage issues during heavy rainfall.",
      
      south: "South Bandung has mixed climate profiles, with some areas having good vegetation coverage and others facing drainage issues. The southern outskirts generally have better climate scores than the central areas.",
      
      east: "East Bandung includes some industrial zones that affect air quality. However, there are also residential areas with moderate climate scores.",
      
      west: "West Bandung has varied climate profiles, with some newer developments incorporating better climate adaptation features. Some areas face traffic congestion that affects air quality."
    },
    
    climateChangeTrends: "Bandung has experienced increasing average temperatures over the last few decades, with central areas warming faster than the outskirts. Rainfall patterns have become more erratic, with heavier rainfall events causing more frequent flooding in vulnerable areas."
  },
  
  // Price impacts of climate factors
  priceImpacts: {
    overview: "Climate factors have a measurable impact on property values in Bandung. Properties with better climate scores (70+ out of 100) typically command a premium of 5-15% over similar properties with poor scores. This reflects buyers' increasing awareness of climate risks and the long-term value of climate-resilient properties.",
    
    floodRisk: "Properties in flood-prone areas can see values depressed by 10-25% compared to similar properties in flood-safe locations. After significant flooding events, this gap can widen temporarily.",
    
    temperature: "Properties in cooler areas of Bandung (with good tree coverage and lower urban heat island effects) command premiums of 3-7% due to lower cooling costs and more comfortable living conditions.",
    
    airQuality: "Areas with better air quality, typically those further from major roads and industrial zones, see property values 2-5% higher than comparable properties in polluted areas.",
    
    greenSpace: "Proximity to parks and green spaces can increase property values by 4-8%, reflecting both aesthetic value and climate benefits of vegetation."
  },
  
  // Climate resilience recommendations
  resilienceRecommendations: {
    buildingFeatures: [
      "Good ventilation systems to maintain air flow and reduce need for air conditioning",
      "Proper insulation to keep interiors cool during hot days",
      "Solar panels to reduce energy costs and carbon footprint",
      "Water harvesting systems to collect rainwater for garden use",
      "Green roofs or reflective roofing materials to reduce heat absorption"
    ],
    
    landscaping: [
      "Planting shade trees around the property to reduce direct sunlight exposure",
      "Using permeable paving materials to allow water absorption and reduce runoff",
      "Creating rain gardens to manage stormwater",
      "Choosing native plant species that require less water and maintenance",
      "Implementing proper drainage systems to direct water away from the building foundation"
    ],
    
    locationSelection: [
      "Prioritize areas with abundant vegetation and green spaces",
      "Avoid low-lying areas prone to water accumulation",
      "Consider elevation and natural drainage patterns",
      "Check historical flooding data for the neighborhood",
      "Evaluate proximity to heat-generating urban features like industrial zones"
    ]
  },
  
  // Typical user questions and detailed answers
  commonQuestions: [
    {
      question: "What are climate scores?",
      answer: `Climate scores measure how safe a property is from climate risks. The scoring includes LST (Land Surface Temperature), NDVI (Vegetation Index), UTFVI (Urban Thermal Field), and UHI (Urban Heat Island). 
      
      Scores range from 0-100, with higher scores indicating better climate safety. A property with a high climate score (80+) is in an area with good environmental conditions that minimize climate-related risks such as flooding, extreme heat, and poor air quality.
      
      These scores help buyers make more informed decisions, considering not just the property itself but also its environmental context.`
    },
    {
      question: "How do climate scores affect property values?",
      answer: `Properties with better climate scores (70+ out of 100) typically command a premium of 5-15% over similar properties with poor scores. 
      
      This is because climate-safe properties offer better long-term value, lower operating costs, and better quality of life. Areas with good vegetation (high NDVI) and lower temperatures (better LST) are particularly valued in the Bandung market.
      
      As climate awareness increases, this price gap is expected to widen, making climate-safe properties better long-term investments.`
    },
    {
      question: "What districts in Bandung have the best climate scores?",
      answer: `Based on our analytics, the districts with the highest overall climate safety scores in Bandung are typically those with more green spaces and away from highly congested urban centers. 
      
      The northeastern and southern districts generally score better for climate safety due to higher elevation, more vegetation, and better air quality. Specific areas like Dago, Ciumbuleuit, and parts of Lembang and Padasuka have good climate profiles.
      
      Central Bandung areas generally have lower scores due to higher development density, more heat-absorbing surfaces, and less vegetation.`
    },
    {
      question: "How is flood risk calculated?",
      answer: `Flood risk is determined using a combination of historical flooding data, terrain elevation models, proximity to water bodies, and drainage infrastructure quality. 
      
      Our system analyzes these factors to generate a flood risk score from "Very Low" to "Very High" for each property location. We also consider factors such as:
      
      1. Watershed characteristics and upstream land use
      2. Local soil permeability and groundwater conditions
      3. Flood protection infrastructure like retention basins
      4. Recent land development changes that might affect drainage
      
      This comprehensive approach provides a more accurate assessment than simple elevation maps.`
    },
    {
      question: "What makes a property climate-safe?",
      answer: `A climate-safe property typically has good scores across all four climate metrics: 
      
      1) Lower land surface temperatures (LST)
      2) Higher vegetation index (NDVI)
      3) Better urban thermal field variance (UTFVI)
      4) Lower urban heat island effect (UHI)
      
      Additionally, properties with low flood and landslide risks, good air quality, and energy-efficient designs contribute to overall climate safety. The surrounding neighborhood is as important as the property itself - areas with good tree coverage, proper drainage systems, and away from heat-generating urban features tend to be more climate-safe.`
    },
    {
      question: "How to compare properties?",
      answer: `You can compare properties using our comparison tool:
      
      1. Select up to 3 properties by clicking the "Compare" button on property cards
      2. Once selected, click on the comparison bar at the bottom of the screen
      3. View detailed side-by-side comparisons of property features and climate metrics
      
      The comparison includes all climate scores, specific risk assessments (flood, temperature, air quality, landslides), and price per square meter calculations to help you make informed decisions.`
    },
    {
      question: "How do recommendations work?",
      answer: `Our recommendation engine uses AI to match properties to your preferences:
      
      1. We analyze your search patterns and explicitly stated preferences
      2. We prioritize properties with climate scores matching your minimum requirements
      3. We factor in specific climate concerns you've indicated (e.g., flood risk, air quality)
      4. We balance climate factors with other criteria like price, size, and location
      
      The system continuously improves as you interact with it, refining its understanding of your priorities. You can also explicitly set climate priorities in the advanced search filters.`
    },
    {
      question: "What are the best properties in Bandung?",
      answer: `The "best" properties depend on your specific needs, but from a climate safety perspective, properties with these characteristics tend to rank highly:
      
      1. Located in areas with abundant vegetation (high NDVI scores)
      2. Built on elevated land with good drainage systems
      3. Away from major roads and industrial zones for better air quality
      4. Designed with climate-adaptive features like proper ventilation and insulation
      
      Areas in North and East Bandung, particularly in newer developments that incorporate green building principles, often feature properties with excellent climate scores. The Recommendation page can show you personalized suggestions based on your specific criteria.`
    },
    {
      question: "How reliable are the climate scores?",
      answer: `Our climate scores are based on scientific data from multiple sources:
      
      1. Satellite imagery for vegetation index and surface temperature
      2. Historical weather and flooding data
      3. Topographical and drainage system mapping
      4. Air quality monitoring stations
      
      The scoring system has been validated against real-world climate events and shows strong correlation with actual conditions. However, climate is complex and some local microclimates may not be fully captured. We continuously update our data and models to improve accuracy.`
    }
  ]
};

export default smartPropertyKnowledge;
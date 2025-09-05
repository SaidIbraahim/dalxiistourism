interface Service {
  id: string;
  name: string;
  description: string;
  category: 'accommodation' | 'transport' | 'activity' | 'guide' | 'meal';
  basePrice: number;
  priceType: 'per_person' | 'per_group' | 'per_day' | 'fixed';
  location: string;
  highlights: string[];
  rating?: number;
  reviewCount?: number;
  popularity?: number;
  tags?: string[];
}

interface SelectedService {
  service: Service;
  quantity: number;
  participants: number;
}

interface Recommendation {
  service: Service;
  reason: string;
  type: 'complementary' | 'upgrade' | 'alternative' | 'popular' | 'seasonal';
  confidence: number; // 0-1 score
  potentialSavings?: number;
  bundleDiscount?: number;
}

interface RecommendationOptions {
  participants: number;
  tripStartDate?: string;
  budget?: number;
  preferences?: string[];
  customerType?: 'new' | 'returning';
  previousBookings?: Service[];
}

interface BusinessRule {
  id: string;
  name: string;
  type: 'conflict' | 'dependency' | 'upgrade' | 'complement';
  serviceIds: string[];
  targetServiceIds?: string[];
  condition: (selectedServices: SelectedService[], options: RecommendationOptions) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export class RecommendationEngine {
  private allServices: Service[] = [];
  private businessRules: BusinessRule[] = [];
  private complementaryMatrix: Record<string, string[]> = {};
  private conflictMatrix: Record<string, string[]> = {};
  private upgradeMatrix: Record<string, string[]> = {};

  constructor(services: Service[] = []) {
    this.allServices = services;
    this.initializeBusinessRules();
    this.initializeServiceRelationships();
  }

  private initializeBusinessRules(): void {
    this.businessRules = [
      {
        id: 'accommodation_transport_conflict',
        name: 'Accommodation and Transport Timing',
        type: 'conflict',
        serviceIds: ['accommodation'],
        targetServiceIds: ['transport'],
        condition: (selected, options) => {
          const hasAccommodation = selected.some(s => s.service.category === 'accommodation');
          const hasTransport = selected.some(s => s.service.category === 'transport');
          return hasAccommodation && hasTransport;
        },
        message: 'Consider transport timing with your accommodation check-in/out times',
        severity: 'warning'
      },
      {
        id: 'meal_activity_timing',
        name: 'Meal and Activity Scheduling',
        type: 'dependency',
        serviceIds: ['activity'],
        targetServiceIds: ['meal'],
        condition: (selected, options) => {
          const hasFullDayActivity = selected.some(s => 
            s.service.category === 'activity' && 
            s.service.name.toLowerCase().includes('full day')
          );
          const hasMeal = selected.some(s => s.service.category === 'meal');
          return hasFullDayActivity && !hasMeal;
        },
        message: 'Full day activities work better with meal arrangements',
        severity: 'info'
      },
      {
        id: 'group_size_guide_requirement',
        name: 'Large Group Guide Requirement',
        type: 'dependency',
        serviceIds: ['activity'],
        targetServiceIds: ['guide'],
        condition: (selected, options) => {
          const hasActivity = selected.some(s => s.service.category === 'activity');
          const hasGuide = selected.some(s => s.service.category === 'guide');
          return hasActivity && !hasGuide && options.participants > 6;
        },
        message: 'Groups of 7+ people require a dedicated guide for activities',
        severity: 'warning'
      },
      {
        id: 'budget_accommodation_upgrade',
        name: 'Budget Accommodation Upgrade',
        type: 'upgrade',
        serviceIds: ['accommodation'],
        condition: (selected, options) => {
          const budgetAccommodation = selected.find(s => 
            s.service.category === 'accommodation' && 
            s.service.basePrice < 100
          );
          return !!budgetAccommodation && (options.budget || 0) > 500;
        },
        message: 'Consider upgrading to premium accommodation within your budget',
        severity: 'info'
      }
    ];
  }

  private initializeServiceRelationships(): void {
    // Complementary services matrix - services that work well together
    this.complementaryMatrix = {
      'accommodation': ['transport', 'meal'],
      'transport': ['accommodation', 'guide'],
      'activity': ['guide', 'meal', 'transport'],
      'guide': ['activity', 'transport'],
      'meal': ['activity', 'accommodation']
    };

    // Conflict matrix - services that might conflict
    this.conflictMatrix = {
      'budget_accommodation': ['luxury_transport'],
      'luxury_accommodation': ['budget_transport'],
      'camping': ['luxury_meal']
    };

    // Upgrade matrix - service upgrades
    this.upgradeMatrix = {
      'standard_accommodation': ['luxury_accommodation'],
      'shared_transport': ['private_transport'],
      'basic_meal': ['premium_meal']
    };
  }

  /**
   * Get comprehensive recommendations based on selected services
   */
  public getRecommendations(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Get complementary service recommendations
    recommendations.push(...this.getComplementaryRecommendations(selectedServices, options));

    // Get upgrade recommendations
    recommendations.push(...this.getUpgradeRecommendations(selectedServices, options));

    // Get popular service recommendations
    recommendations.push(...this.getPopularRecommendations(selectedServices, options));

    // Get seasonal recommendations
    recommendations.push(...this.getSeasonalRecommendations(selectedServices, options));

    // Get alternative recommendations for better value
    recommendations.push(...this.getAlternativeRecommendations(selectedServices, options));

    // Remove already selected services
    const selectedServiceIds = selectedServices.map(s => s.service.id);
    const filteredRecommendations = recommendations.filter(r => 
      !selectedServiceIds.includes(r.service.id)
    );

    // Sort by confidence and potential value
    return filteredRecommendations
      .sort((a, b) => {
        const scoreA = a.confidence + (a.potentialSavings || 0) / 100;
        const scoreB = b.confidence + (b.potentialSavings || 0) / 100;
        return scoreB - scoreA;
      })
      .slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Get services that complement the selected services
   */
  private getComplementaryRecommendations(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const selectedCategories = [...new Set(selectedServices.map(s => s.service.category))];
    const selectedServiceIds = selectedServices.map(s => s.service.id);

    for (const category of selectedCategories) {
      const complementaryCategories = this.complementaryMatrix[category] || [];
      
      for (const compCategory of complementaryCategories) {
        // Skip if already have service in this category
        if (selectedCategories.includes(compCategory as any)) continue;

        const complementaryServices = this.allServices.filter(service => 
          service.category === compCategory &&
          !selectedServiceIds.includes(service.id) &&
          this.isServiceSuitableForGroup(service, options.participants)
        );

        for (const service of complementaryServices.slice(0, 2)) {
          const confidence = this.calculateComplementaryConfidence(service, selectedServices, options);
          
          if (confidence > 0.3) {
            recommendations.push({
              service,
              reason: `Complements your ${category} selection perfectly`,
              type: 'complementary',
              confidence,
              bundleDiscount: this.calculateBundleDiscount(service, selectedServices)
            });
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Get upgrade recommendations for selected services
   */
  private getUpgradeRecommendations(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const selectedService of selectedServices) {
      const upgrades = this.findUpgradeOptions(selectedService.service, options);
      
      for (const upgrade of upgrades) {
        const priceDifference = upgrade.basePrice - selectedService.service.basePrice;
        const confidence = this.calculateUpgradeConfidence(upgrade, selectedService.service, options);
        
        if (confidence > 0.4 && (!options.budget || priceDifference <= options.budget * 0.2)) {
          recommendations.push({
            service: upgrade,
            reason: `Upgrade from ${selectedService.service.name} for enhanced experience`,
            type: 'upgrade',
            confidence,
            potentialSavings: this.calculateUpgradeValue(upgrade, selectedService.service)
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Get popular service recommendations
   */
  private getPopularRecommendations(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Recommendation[] {
    const selectedServiceIds = selectedServices.map(s => s.service.id);
    const selectedCategories = selectedServices.map(s => s.service.category);

    // Find popular services not in selected categories
    const popularServices = this.allServices
      .filter(service => 
        !selectedServiceIds.includes(service.id) &&
        !selectedCategories.includes(service.category) &&
        (service.popularity || 0) > 0.7 &&
        (service.rating || 0) > 4.0 &&
        this.isServiceSuitableForGroup(service, options.participants)
      )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 3);

    return popularServices.map(service => ({
      service,
      reason: `Highly rated by ${service.reviewCount || 0}+ customers`,
      type: 'popular' as const,
      confidence: (service.popularity || 0) * 0.8 + (service.rating || 0) / 5 * 0.2
    }));
  }

  /**
   * Get seasonal recommendations
   */
  private getSeasonalRecommendations(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Recommendation[] {
    if (!options.tripStartDate) return [];

    const month = parseInt(options.tripStartDate.substring(5, 7));
    const season = this.getSeason(month);
    const selectedServiceIds = selectedServices.map(s => s.service.id);

    const seasonalServices = this.allServices.filter(service => {
      if (selectedServiceIds.includes(service.id)) return false;
      
      const tags = service.tags || [];
      return tags.includes(season) || tags.includes('year-round');
    });

    return seasonalServices.slice(0, 2).map(service => ({
      service,
      reason: `Perfect for ${season} season travel`,
      type: 'seasonal' as const,
      confidence: 0.6
    }));
  }

  /**
   * Get alternative recommendations for better value
   */
  private getAlternativeRecommendations(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const selectedService of selectedServices) {
      const alternatives = this.findAlternatives(selectedService.service, options);
      
      for (const alternative of alternatives) {
        const savings = selectedService.service.basePrice - alternative.basePrice;
        
        if (savings > 0) {
          recommendations.push({
            service: alternative,
            reason: `Similar experience at lower cost than ${selectedService.service.name}`,
            type: 'alternative',
            confidence: 0.5,
            potentialSavings: savings
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Check for business rule violations and dependencies
   */
  public validateServiceCombination(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Array<{ rule: BusinessRule; message: string; severity: string }> {
    const violations: Array<{ rule: BusinessRule; message: string; severity: string }> = [];

    for (const rule of this.businessRules) {
      if (rule.condition(selectedServices, options)) {
        violations.push({
          rule,
          message: rule.message,
          severity: rule.severity
        });
      }
    }

    return violations;
  }

  /**
   * Get package upgrade recommendations
   */
  public getPackageUpgrades(
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): Array<{
    name: string;
    services: Service[];
    originalPrice: number;
    packagePrice: number;
    savings: number;
    description: string;
  }> {
    const packages = [];
    const selectedCategories = selectedServices.map(s => s.service.category);

    // Complete experience package
    if (selectedServices.length >= 2 && selectedServices.length < 5) {
      const missingCategories = ['accommodation', 'transport', 'activity', 'meal', 'guide']
        .filter(cat => !selectedCategories.includes(cat as any));

      if (missingCategories.length > 0) {
        const additionalServices = missingCategories
          .map(cat => this.allServices.find(s => s.category === cat))
          .filter(Boolean) as Service[];

        if (additionalServices.length > 0) {
          const originalPrice = selectedServices.reduce((sum, s) => sum + s.service.basePrice, 0) +
                               additionalServices.reduce((sum, s) => sum + s.basePrice, 0);
          const packagePrice = originalPrice * 0.85; // 15% package discount
          
          packages.push({
            name: 'Complete Experience Package',
            services: additionalServices,
            originalPrice,
            packagePrice,
            savings: originalPrice - packagePrice,
            description: 'Add these services for a complete travel experience with 15% package discount'
          });
        }
      }
    }

    return packages;
  }

  /**
   * Helper methods
   */
  private calculateComplementaryConfidence(
    service: Service,
    selectedServices: SelectedService[],
    options: RecommendationOptions
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on service rating
    if (service.rating) {
      confidence += (service.rating - 3) / 5 * 0.2;
    }

    // Boost confidence based on location proximity
    const selectedLocations = selectedServices.map(s => s.service.location);
    if (selectedLocations.some(loc => loc === service.location)) {
      confidence += 0.2;
    }

    // Boost confidence based on price compatibility
    const avgSelectedPrice = selectedServices.reduce((sum, s) => sum + s.service.basePrice, 0) / selectedServices.length;
    const priceDifference = Math.abs(service.basePrice - avgSelectedPrice) / avgSelectedPrice;
    if (priceDifference < 0.5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private calculateUpgradeConfidence(
    upgrade: Service,
    original: Service,
    options: RecommendationOptions
  ): number {
    let confidence = 0.4;

    // Consider budget constraints
    if (options.budget) {
      const priceDifference = upgrade.basePrice - original.basePrice;
      const budgetRatio = priceDifference / options.budget;
      if (budgetRatio < 0.1) confidence += 0.3;
      else if (budgetRatio < 0.2) confidence += 0.2;
      else if (budgetRatio > 0.3) confidence -= 0.2;
    }

    // Consider upgrade value
    if (upgrade.rating && original.rating && upgrade.rating > original.rating) {
      confidence += (upgrade.rating - original.rating) / 5 * 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  private calculateBundleDiscount(service: Service, selectedServices: SelectedService[]): number {
    // Simple bundle discount calculation
    if (selectedServices.length >= 3) return 0.1; // 10% discount
    if (selectedServices.length >= 2) return 0.05; // 5% discount
    return 0;
  }

  private calculateUpgradeValue(upgrade: Service, original: Service): number {
    // Calculate value based on rating improvement and features
    const ratingImprovement = (upgrade.rating || 0) - (original.rating || 0);
    const featureImprovement = (upgrade.highlights?.length || 0) - (original.highlights?.length || 0);
    
    return ratingImprovement * 20 + featureImprovement * 5;
  }

  private findUpgradeOptions(service: Service, options: RecommendationOptions): Service[] {
    return this.allServices.filter(s => 
      s.category === service.category &&
      s.id !== service.id &&
      s.basePrice > service.basePrice &&
      s.basePrice <= service.basePrice * 2 && // Max 2x price
      (s.rating || 0) >= (service.rating || 0) &&
      this.isServiceSuitableForGroup(s, options.participants)
    );
  }

  private findAlternatives(service: Service, options: RecommendationOptions): Service[] {
    return this.allServices.filter(s => 
      s.category === service.category &&
      s.id !== service.id &&
      s.basePrice < service.basePrice &&
      (s.rating || 0) >= (service.rating || 0) - 0.5 && // Allow slightly lower rating
      this.isServiceSuitableForGroup(s, options.participants)
    );
  }

  private isServiceSuitableForGroup(service: Service, participants: number): boolean {
    // Check if service can accommodate the group size
    // This would be based on service capacity in a real implementation
    return true; // Simplified for now
  }

  private getSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * Update services list
   */
  public updateServices(services: Service[]): void {
    this.allServices = services;
  }

  /**
   * Add custom business rule
   */
  public addBusinessRule(rule: BusinessRule): void {
    this.businessRules.push(rule);
  }
}
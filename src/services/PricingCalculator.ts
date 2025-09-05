interface Service {
  id: string;
  name: string;
  basePrice: number;
  priceType: 'per_person' | 'per_group' | 'per_day' | 'fixed';
  category: string;
}

interface SelectedService {
  service: Service;
  quantity: number;
  participants: number;
  serviceDate?: string;
}

interface PricingRule {
  id: string;
  name: string;
  ruleType: 'early_bird' | 'group_discount' | 'seasonal' | 'last_minute' | 'multi_service' | 'loyalty';
  serviceIds?: string[]; // null means applies to all services
  conditions: Record<string, any>;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  priority: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
}

interface ServiceCombination {
  id: string;
  name: string;
  serviceIds: string[];
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minParticipants?: number;
  maxParticipants?: number;
  isActive: boolean;
}

interface PricingBreakdown {
  subtotal: number;
  discounts: Array<{
    name: string;
    type: string;
    amount: number;
    description: string;
  }>;
  taxes: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
  total: number;
  savings: number;
  currency: string;
}

interface PricingOptions {
  tripStartDate?: string;
  participants: number;
  customerType?: 'new' | 'returning';
  totalPreviousBookings?: number;
  advanceBookingDays?: number;
  currency?: string;
  taxRate?: number;
}

export class PricingCalculator {
  private pricingRules: PricingRule[] = [];
  private serviceCombinations: ServiceCombination[] = [];
  private seasonalMultipliers: Record<string, number> = {};
  private taxRate: number = 0.08; // 8% default tax rate
  private currency: string = 'USD';

  constructor() {
    this.initializeDefaultRules();
    this.initializeSeasonalMultipliers();
  }

  private initializeDefaultRules(): void {
    this.pricingRules = [
      {
        id: 'early_bird_30',
        name: 'Early Bird Discount (30+ days)',
        ruleType: 'early_bird',
        conditions: { daysInAdvance: 30 },
        discountType: 'percentage',
        discountValue: 15,
        priority: 3,
        isActive: true
      },
      {
        id: 'early_bird_14',
        name: 'Early Bird Discount (14+ days)',
        ruleType: 'early_bird',
        conditions: { daysInAdvance: 14 },
        discountType: 'percentage',
        discountValue: 8,
        priority: 2,
        isActive: true
      },
      {
        id: 'group_large',
        name: 'Large Group Discount (8+ people)',
        ruleType: 'group_discount',
        conditions: { minParticipants: 8 },
        discountType: 'percentage',
        discountValue: 20,
        priority: 4,
        isActive: true
      },
      {
        id: 'group_medium',
        name: 'Group Discount (4+ people)',
        ruleType: 'group_discount',
        conditions: { minParticipants: 4 },
        discountType: 'percentage',
        discountValue: 12,
        priority: 3,
        isActive: true
      },
      {
        id: 'multi_service_5',
        name: 'Multi-Service Package (5+ services)',
        ruleType: 'multi_service',
        conditions: { minServices: 5 },
        discountType: 'percentage',
        discountValue: 18,
        priority: 4,
        isActive: true
      },
      {
        id: 'multi_service_3',
        name: 'Multi-Service Discount (3+ services)',
        ruleType: 'multi_service',
        conditions: { minServices: 3 },
        discountType: 'percentage',
        discountValue: 10,
        priority: 3,
        isActive: true
      },
      {
        id: 'loyalty_returning',
        name: 'Returning Customer Discount',
        ruleType: 'loyalty',
        conditions: { customerType: 'returning', minPreviousBookings: 1 },
        discountType: 'percentage',
        discountValue: 5,
        priority: 2,
        isActive: true
      },
      {
        id: 'last_minute',
        name: 'Last Minute Deal',
        ruleType: 'last_minute',
        conditions: { maxDaysInAdvance: 3 },
        discountType: 'percentage',
        discountValue: 8,
        priority: 1,
        isActive: true
      }
    ];
  }

  private initializeSeasonalMultipliers(): void {
    // Seasonal pricing multipliers by month
    this.seasonalMultipliers = {
      '01': 1.0,  // January - Low season
      '02': 1.0,  // February - Low season
      '03': 1.1,  // March - Shoulder season
      '04': 1.2,  // April - High season
      '05': 1.2,  // May - High season
      '06': 1.3,  // June - Peak season
      '07': 1.3,  // July - Peak season
      '08': 1.3,  // August - Peak season
      '09': 1.2,  // September - High season
      '10': 1.1,  // October - Shoulder season
      '11': 1.0,  // November - Low season
      '12': 1.1   // December - Holiday season
    };
  }

  /**
   * Calculate the total price for selected services with all applicable discounts
   */
  public calculatePrice(
    selectedServices: SelectedService[],
    options: PricingOptions = { participants: 1 }
  ): PricingBreakdown {
    if (selectedServices.length === 0) {
      return this.createEmptyBreakdown();
    }

    // Calculate base subtotal
    const subtotal = this.calculateSubtotal(selectedServices, options);

    // Apply seasonal pricing
    const seasonalAdjustedSubtotal = this.applySeasonalPricing(subtotal, options.tripStartDate);

    // Calculate applicable discounts
    const discounts = this.calculateDiscounts(selectedServices, seasonalAdjustedSubtotal, options);

    // Calculate total discount amount
    const totalDiscountAmount = discounts.reduce((sum, discount) => sum + discount.amount, 0);

    // Calculate taxes
    const taxableAmount = seasonalAdjustedSubtotal - totalDiscountAmount;
    const taxes = this.calculateTaxes(taxableAmount, options.taxRate);

    // Calculate final total
    const total = taxableAmount + taxes.reduce((sum, tax) => sum + tax.amount, 0);

    return {
      subtotal: seasonalAdjustedSubtotal,
      discounts,
      taxes,
      total,
      savings: totalDiscountAmount,
      currency: options.currency || this.currency
    };
  }

  /**
   * Calculate base subtotal before discounts and taxes
   */
  private calculateSubtotal(selectedServices: SelectedService[], options: PricingOptions): number {
    return selectedServices.reduce((total, selectedService) => {
      const { service, quantity, participants } = selectedService;
      let serviceTotal = service.basePrice;

      // Apply price type logic
      switch (service.priceType) {
        case 'per_person':
          serviceTotal *= participants;
          break;
        case 'per_group':
          // Price is for the entire group regardless of size
          break;
        case 'per_day':
          // Would need trip duration - for now assume 1 day
          serviceTotal *= this.calculateTripDuration(options.tripStartDate);
          break;
        case 'fixed':
          // Fixed price regardless of participants or duration
          break;
      }

      return total + (serviceTotal * quantity);
    }, 0);
  }

  /**
   * Apply seasonal pricing multipliers
   */
  private applySeasonalPricing(subtotal: number, tripStartDate?: string): number {
    if (!tripStartDate) return subtotal;

    const month = tripStartDate.substring(5, 7);
    const multiplier = this.seasonalMultipliers[month] || 1.0;
    
    return subtotal * multiplier;
  }

  /**
   * Calculate all applicable discounts
   */
  private calculateDiscounts(
    selectedServices: SelectedService[],
    subtotal: number,
    options: PricingOptions
  ): Array<{ name: string; type: string; amount: number; description: string }> {
    const discounts: Array<{ name: string; type: string; amount: number; description: string }> = [];
    const applicableRules = this.getApplicableRules(selectedServices, options);

    // Sort rules by priority (higher priority first)
    applicableRules.sort((a, b) => b.priority - a.priority);

    let currentSubtotal = subtotal;

    for (const rule of applicableRules) {
      const discountAmount = this.calculateRuleDiscount(rule, currentSubtotal, selectedServices, options);
      
      if (discountAmount > 0) {
        discounts.push({
          name: rule.name,
          type: rule.ruleType,
          amount: discountAmount,
          description: this.getDiscountDescription(rule, selectedServices, options)
        });

        // For percentage discounts, apply to remaining amount to prevent over-discounting
        if (rule.discountType === 'percentage') {
          currentSubtotal -= discountAmount;
        }
      }
    }

    // Check for service combination discounts
    const combinationDiscounts = this.calculateCombinationDiscounts(selectedServices, subtotal, options);
    discounts.push(...combinationDiscounts);

    return discounts;
  }

  /**
   * Get rules that apply to the current booking
   */
  private getApplicableRules(selectedServices: SelectedService[], options: PricingOptions): PricingRule[] {
    const now = new Date();
    const advanceBookingDays = options.advanceBookingDays || this.calculateAdvanceBookingDays(options.tripStartDate);

    return this.pricingRules.filter(rule => {
      if (!rule.isActive) return false;

      // Check date validity
      if (rule.validFrom && new Date(rule.validFrom) > now) return false;
      if (rule.validUntil && new Date(rule.validUntil) < now) return false;

      // Check service-specific rules
      if (rule.serviceIds && rule.serviceIds.length > 0) {
        const selectedServiceIds = selectedServices.map(s => s.service.id);
        const hasMatchingService = rule.serviceIds.some(id => selectedServiceIds.includes(id));
        if (!hasMatchingService) return false;
      }

      // Check rule-specific conditions
      switch (rule.ruleType) {
        case 'early_bird':
          return advanceBookingDays >= rule.conditions.daysInAdvance;
        
        case 'group_discount':
          return options.participants >= rule.conditions.minParticipants;
        
        case 'multi_service':
          return selectedServices.length >= rule.conditions.minServices;
        
        case 'loyalty':
          return options.customerType === rule.conditions.customerType &&
                 (options.totalPreviousBookings || 0) >= rule.conditions.minPreviousBookings;
        
        case 'last_minute':
          return advanceBookingDays <= rule.conditions.maxDaysInAdvance;
        
        default:
          return true;
      }
    });
  }

  /**
   * Calculate discount amount for a specific rule
   */
  private calculateRuleDiscount(
    rule: PricingRule,
    subtotal: number,
    selectedServices: SelectedService[],
    options: PricingOptions
  ): number {
    if (rule.discountType === 'percentage') {
      return subtotal * (rule.discountValue / 100);
    } else {
      return Math.min(rule.discountValue, subtotal); // Don't exceed subtotal
    }
  }

  /**
   * Calculate service combination discounts
   */
  private calculateCombinationDiscounts(
    selectedServices: SelectedService[],
    subtotal: number,
    options: PricingOptions
  ): Array<{ name: string; type: string; amount: number; description: string }> {
    const discounts: Array<{ name: string; type: string; amount: number; description: string }> = [];
    const selectedServiceIds = selectedServices.map(s => s.service.id);

    for (const combination of this.serviceCombinations) {
      if (!combination.isActive) continue;

      // Check if all services in combination are selected
      const hasAllServices = combination.serviceIds.every(id => selectedServiceIds.includes(id));
      if (!hasAllServices) continue;

      // Check participant constraints
      if (combination.minParticipants && options.participants < combination.minParticipants) continue;
      if (combination.maxParticipants && options.participants > combination.maxParticipants) continue;

      // Calculate combination discount
      const combinationSubtotal = selectedServices
        .filter(s => combination.serviceIds.includes(s.service.id))
        .reduce((sum, s) => sum + (s.service.basePrice * s.quantity), 0);

      const discountAmount = combination.discountType === 'percentage'
        ? combinationSubtotal * (combination.discountValue / 100)
        : combination.discountValue;

      discounts.push({
        name: combination.name,
        type: 'combination',
        amount: discountAmount,
        description: `Package discount for ${combination.name}`
      });
    }

    return discounts;
  }

  /**
   * Calculate taxes
   */
  private calculateTaxes(taxableAmount: number, customTaxRate?: number): Array<{ name: string; rate: number; amount: number }> {
    const rate = customTaxRate || this.taxRate;
    const taxAmount = taxableAmount * rate;

    return [
      {
        name: 'Service Tax',
        rate: rate,
        amount: taxAmount
      }
    ];
  }

  /**
   * Helper methods
   */
  private calculateAdvanceBookingDays(tripStartDate?: string): number {
    if (!tripStartDate) return 0;
    
    const now = new Date();
    const tripDate = new Date(tripStartDate);
    const diffTime = tripDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  private calculateTripDuration(tripStartDate?: string): number {
    // For now, assume 1 day. In a real implementation, you'd calculate based on end date
    return 1;
  }

  private getDiscountDescription(rule: PricingRule, selectedServices: SelectedService[], options: PricingOptions): string {
    switch (rule.ruleType) {
      case 'early_bird':
        return `Book ${rule.conditions.daysInAdvance}+ days in advance`;
      case 'group_discount':
        return `${options.participants} participants qualify for group pricing`;
      case 'multi_service':
        return `${selectedServices.length} services selected`;
      case 'loyalty':
        return `Returning customer with ${options.totalPreviousBookings} previous bookings`;
      case 'last_minute':
        return `Last minute booking discount`;
      default:
        return rule.name;
    }
  }

  private createEmptyBreakdown(): PricingBreakdown {
    return {
      subtotal: 0,
      discounts: [],
      taxes: [],
      total: 0,
      savings: 0,
      currency: this.currency
    };
  }

  /**
   * Format currency amount
   */
  public formatCurrency(amount: number, currency?: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || this.currency
    }).format(amount);
  }

  /**
   * Add custom pricing rule
   */
  public addPricingRule(rule: PricingRule): void {
    this.pricingRules.push(rule);
  }

  /**
   * Add service combination
   */
  public addServiceCombination(combination: ServiceCombination): void {
    this.serviceCombinations.push(combination);
  }

  /**
   * Update tax rate
   */
  public setTaxRate(rate: number): void {
    this.taxRate = rate;
  }

  /**
   * Update currency
   */
  public setCurrency(currency: string): void {
    this.currency = currency;
  }
}
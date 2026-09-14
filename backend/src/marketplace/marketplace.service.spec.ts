import { MarketplaceService } from './marketplace.service';

describe('MarketplaceService', () => {
  it('filters providers under the requested budget and keeps the best rated ones first', () => {
    const service = new MarketplaceService();

    const offers = service.listOffers({
      category: 'tourism',
      maxPrice: 50,
    });

    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((offer) => Number(offer.price ?? 0) <= 50)).toBe(true);
    expect(offers[0].rating).toBeGreaterThanOrEqual(offers[1]?.rating ?? 0);
  });

  it('exposes emergency providers that are verified and directly reachable', () => {
    const service = new MarketplaceService();

    const emergency = service.listEmergencyContacts();

    expect(emergency.length).toBeGreaterThan(0);
    expect(emergency.every((offer) => offer.category === 'emergency' && offer.isVerified)).toBe(true);
    expect(emergency[0].contact).toBeDefined();
  });
});

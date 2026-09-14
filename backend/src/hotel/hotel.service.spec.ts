import { HotelService } from './hotel.service';

describe('HotelService', () => {
  it('keeps recommendations within the max budget and includes a family justification', () => {
    const service = new HotelService();

    const recommendations = service.recommendHotels({
      location: 'Paris',
      maxBudget: 100,
      travelers: 2,
      preferences: ['famille', 'enfants'],
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every((hotel) => hotel.nightPrice <= 100)).toBe(true);
    expect(recommendations[0].justification.toLowerCase()).toContain('famille');
  });
});

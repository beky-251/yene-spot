-- =========================================================
-- YENESPOT INITIAL CATEGORY DATA
-- =========================================================

INSERT INTO public.categories (name, slug, description, icon, is_active)
VALUES
    ('Restaurants', 'restaurants', 'Discover restaurants and places to eat.', 'utensils', TRUE),
    ('Cafes and Coffee Shops', 'cafes-coffee-shops', 'Find cafes and traditional coffee shops.', 'coffee', TRUE),
    ('Hotels', 'hotels', 'Discover hotels and accommodation.', 'hotel', TRUE),
    ('Guest Houses', 'guest-houses', 'Find guest houses and local accommodation.', 'house', TRUE),
    ('Bars', 'bars', 'Discover bars and social venues.', 'glass-water', TRUE),
    ('Bakeries', 'bakeries', 'Find bakeries and freshly baked goods.', 'croissant', TRUE),
    ('Cake Shops', 'cake-shops', 'Discover cake shops and dessert businesses.', 'cake', TRUE),
    ('Shopping', 'shopping', 'Explore local shops and retail businesses.', 'shopping-bag', TRUE),
    ('Beauty and Salons', 'beauty-salons', 'Find beauty services, salons, and barbers.', 'scissors', TRUE),
    ('Health and Pharmacy', 'health-pharmacy', 'Discover pharmacies and health services.', 'heart-pulse', TRUE),
    ('Fitness and Gyms', 'fitness-gyms', 'Find gyms and fitness facilities.', 'dumbbell', TRUE),
    ('Entertainment', 'entertainment', 'Discover entertainment and leisure venues.', 'ticket', TRUE),
    ('Tourism', 'tourism', 'Explore tourism services and attractions.', 'map', TRUE),
    ('Car Services', 'car-services', 'Find vehicle maintenance and car services.', 'car', TRUE),
    ('Education', 'education', 'Discover educational institutions and services.', 'graduation-cap', TRUE),
    ('Other Services', 'other-services', 'Explore other local businesses and services.', 'briefcase', TRUE)
ON CONFLICT (slug) DO NOTHING;
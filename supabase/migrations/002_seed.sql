-- Tarweeda Seed Data
-- Run this in Supabase SQL Editor after 001_schema.sql

-- Products: Field Staples
INSERT INTO products (slug, category, name, description, tagline, price_pence, unit, tag, image_path, sort_order) VALUES
('extra-virgin-olive-oil', 'staples', 'Extra Virgin Olive Oil', 'Cold-pressed from Palestinian groves.', 'Liquid gold of the Palestinian kitchen', 1800, '500ml', 'Staple', 'olive-oil.jpg', 1),
('baladi-zaatar', 'staples', 'Baladi Za''atar', 'Wild thyme blended the traditional way.', 'The taste of mornings, bread, and olive oil', 800, '250g', 'Herb Blend', 'zaatar.jpg', 2),
('baladi-sumac', 'staples', 'Baladi Sumac', 'Sun-dried tangy sumac berries.', 'Bright acidity that wakes up every dish', 700, '250g', 'Spice', 'sumac.jpg', 3),
('spices-blend', 'staples', 'Spices Blend', 'Traditional Palestinian spice mix.', 'Warm aromatic notes for everyday cooking', 900, '50g', 'Blend', 'spices-blend.jpg', 4),
('seasoning-blend', 'staples', 'Seasoning Blend', 'Balanced herb and spice seasoning.', 'Perfect for vegetables, meats and grains', 900, '50g', 'Blend', 'seasoning-blend.jpg', 5),
('tahina', 'staples', 'Tahina', 'Stone-ground sesame paste.', 'Creamy foundation of hummus, sauces and sweets', 1200, '400g', 'Pantry', 'tahina.jpg', 6);

-- Products: Home Preserves
INSERT INTO products (slug, category, name, description, tagline, price_pence, unit, tag, image_path, sort_order) VALUES
('red-chilli-paste', 'pantry', 'Red Chilli Paste', 'Slow-roasted chillies, richly flavoured.', 'Heat with depth', 1000, '200g', 'Preserve', 'chilli-paste.jpg', 7),
('makdous', 'pantry', 'Makdous', 'Stuffed baby eggplant preserved in olive oil with walnuts.', 'A jar of patience and tradition', 1400, '300g', 'Preserve', 'makdous.jpg', 8),
('qazha-makhtooma', 'pantry', 'Qazha / Makhtooma', 'Gazan sesame-date paste.', 'Spread on fresh bread, nothing else needed', 1200, '250g', 'Sweet', 'qazha.jpg', 9),
('pickled-lemon', 'pantry', 'Pickled Lemon', 'Salt-cured lemons with spices.', 'A staple condiment for Palestinian cooking', 1000, '300g', 'Preserve', 'pickled-lemon.jpg', 10),
('maamoul', 'pantry', 'Maamoul', 'Shortbread filled with dates or nuts.', 'Baked for celebrations, perfect with coffee', 1600, 'Box of 6', 'Pastry', 'maamoul.jpg', 11),
('kaak', 'pantry', 'Ka''ak', 'Sesame ring biscuits.', 'A Palestinian staple, simple and satisfying', 900, 'Pack of 8', 'Biscuit', 'kaak.jpg', 12);

-- Supper Club Events
INSERT INTO supper_events (slug, name, theme, event_date, event_time, location, total_seats, seats_left, price_pence, is_featured, menu, status) VALUES
('tarweeda-supper-gathering-apr-2026', 'Tarweeda Supper Gathering', 'Commoning', '2026-04-28', '18:00', 'Putney, London', 20, 20, 6000, true,
 '[{"course":"Welcome","dish":"Lemonade","note":"Fresh-squeezed"},{"course":"Starter","dish":"Lenten Soup","note":"Warming & seasonal"},{"course":"First","dish":"Musakhan","note":"Chicken, onion, sumac on taboon"},{"course":"Main","dish":"Maqluba","note":"Upside-down rice, vegetables & lamb"},{"course":"Side","dish":"Fattoush","note":"Herbs, crispy bread, sumac"},{"course":"Dessert","dish":"Maamoul","note":"Date & walnut shortbread"},{"course":"Finish","dish":"Arabic Coffee","note":"Cardamom qahwa"}]',
 'upcoming'),
('a-night-in-gaza-jun-2026', 'A Night in Gaza', 'Gazan Heritage', '2026-06-18', '19:00', 'Peckham, London', 20, 12, 6000, false,
 '[{"course":"Welcome","dish":"Qahwa & Ka''ak","note":"Coffee & sesame rings"},{"course":"Starter","dish":"Fatteh Hummus","note":"Crisp bread, hummus, pine nuts"},{"course":"First","dish":"Fatayer Basket","note":"Spinach, cheese, meat pastries"},{"course":"Main","dish":"Fatteh Ghazawiyeh","note":"Layered, communal, Gazan"},{"course":"Side","dish":"Fattoush & Pickles","note":"Herbs, house pickles"},{"course":"Dessert","dish":"Maamoul & Knafeh","note":"Shortbread & cheese pastry"},{"course":"Finish","dish":"Mint Lemonade","note":"Fresh to close"}]',
 'upcoming'),
('the-olive-harvest-sep-2026', 'The Olive Harvest', 'Village Traditions', '2026-09-12', '18:30', 'Hackney, London', 20, 20, 6000, false,
 '[{"course":"Welcome","dish":"Sage Tea & Olives","note":"From Palestinian groves"},{"course":"Starter","dish":"Baba Ghanoush & Pita","note":"Smoky aubergine"},{"course":"First","dish":"Fattoush Salad","note":"Crispy bread, herbs"},{"course":"Main","dish":"Musakhan","note":"Chicken, onion, sumac, taboon"},{"course":"Side","dish":"Rice & Pickles","note":"Classic accompaniment"},{"course":"Dessert","dish":"Ka''ak & Fruit","note":"Sesame biscuits, fresh fruit"},{"course":"Finish","dish":"Arabic Qahwa","note":"Cardamom coffee"}]',
 'upcoming');

-- Supper Club Packages
INSERT INTO supper_packages (slug, icon, name, price_pence, guests, inclusions, is_featured, is_enquiry, sort_order) VALUES
('individual', '🪑', 'Individual Seat', 6000, 1, '5-course menu · Welcome drink · Community table', false, false, 1),
('couple', '🕯', 'Couple', 11500, 2, '2 seats · 5-course menu · Welcome drinks', true, false, 2),
('table-of-4', '🫂', 'Table of 4', 22000, 4, '4 seats · Full menu · Shared mezze', false, false, 3),
('group-6-8', '🥂', 'Group 6–8', 34000, 6, '6–8 seats · Full menu · Open bar', false, false, 4),
('private-buyout', '✦', 'Private Buyout', 0, 20, 'Full venue · Bespoke menu · Custom invitations', false, true, 5);

-- Gift Hampers
INSERT INTO gift_hampers (slug, name, description, price_pence, contents, sort_order) VALUES
('essentials', 'The Essentials', 'Za''atar, sumac, and extra virgin olive oil — the three pillars of a Palestinian kitchen.', 3800, 'Za''atar, Sumac, Extra Virgin Olive Oil', 1),
('classic', 'The Classic', 'Olive oil, za''atar, sumac, tahina, and red chilli paste — the full Tarweeda experience.', 5500, 'Olive Oil, Za''atar, Sumac, Tahina, Red Chilli Paste', 2),
('grand', 'The Grand', 'The full pantry — olive oil, za''atar, sumac, tahina, makdous, maamoul, and ka''ak. A feast in a box.', 8500, 'Olive Oil, Za''atar, Sumac, Tahina, Makdous, Maamoul, Ka''ak', 3);

-- Hire Roles
INSERT INTO hire_roles (display_num, role_name, description, rate, is_featured, sort_order) VALUES
('01', 'Head Chef — Palestinian Cuisine', 'Our lead chefs plan, prep, cook, and present the full menu — from maqluba to maamoul. Available for events of any scale.', 'From £280 / day', true, 1),
('02', 'Sous Chef / Kitchen Support', 'Prep cooks experienced in Palestinian dishes. Works alongside the head chef or independently.', 'From £180 / day', false, 2),
('03', 'Serving Staff', 'Professional, warm, and well-briefed on menu and culture. Table service, plattering, and guest care.', 'From £110 / day', false, 3),
('04', 'Full Event Kitchen Team', 'Head chef, sous chefs, and service staff — fully coordinated for weddings, dinners, community feasts.', 'Custom quote · Team of 3–8', false, 4);

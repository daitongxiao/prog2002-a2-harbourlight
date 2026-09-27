USE charityevents_db;

-- All names, places in context, campaign details, and figures are fictional sample data.
-- UTC times below correspond to Australia/Sydney local times (AEDT, UTC+11).
INSERT IGNORE INTO organisations (id, name) VALUES
  (1, 'Harbourlight Community Collective');

INSERT IGNORE INTO categories (id, name) VALUES
  (1, 'Community & Family'),
  (2, 'Environment'),
  (3, 'Arts & Culture'),
  (4, 'Health & Wellbeing'),
  (5, 'Food Relief');

INSERT IGNORE INTO events
  (id, organisation_id, category_id, name, start_at_utc, end_at_utc,
   start_local_date, venue, city, purpose, description, ticket_price,
   fundraising_goal, amount_raised, image_path, is_suspended)
VALUES
  (1, 1, 1, 'Neighbourhood Lantern Walk', '2026-10-16 23:00:00', '2026-10-17 02:00:00',
   '2026-10-17', 'Harbourview Community Hall', 'Sydney',
   'Bring neighbours together and fund free family activities.',
   'An accessible morning walk with craft tables, refreshments and a community welcome. Proceeds support free family activity sessions.',
   8.00, 2500.00, 840.00, NULL, FALSE),
  (2, 1, 2, 'Coast Care Planting Day', '2026-10-30 22:30:00', '2026-10-31 02:30:00',
   '2026-10-31', 'Seabreeze Reserve', 'Wollongong',
   'Restore native habitat along a local coastal reserve.',
   'Join a guided planting session with equipment and light refreshments supplied. Donations help purchase native seedlings and tools.',
   0.00, 4000.00, 1260.00, NULL, FALSE),
  (3, 1, 5, 'Shared Table Community Lunch', '2026-11-13 01:00:00', '2026-11-13 04:00:00',
   '2026-11-13', 'Riverside Neighbourhood Kitchen', 'Parramatta',
   'Support community meals for households facing food insecurity.',
   'Enjoy a locally prepared lunch, meet community cooks and learn how weekly meal support works. Vegetarian options are available.',
   22.00, 6000.00, 2150.00, NULL, FALSE),
  (4, 1, 3, 'Art for All Studio Afternoon', '2026-11-28 02:00:00', '2026-11-28 05:00:00',
   '2026-11-28', 'West End Makers Space', 'Newcastle',
   'Fund accessible creative workshops for young people.',
   'Try printmaking and collaborative art activities led by volunteer artists. All materials are included and beginners are welcome.',
   15.00, 3200.00, 970.00, NULL, FALSE),
  (5, 1, 4, 'Steps for Wellbeing', '2026-12-04 21:00:00', '2026-12-05 01:00:00',
   '2026-12-05', 'Lakeview Park', 'Gosford',
   'Raise funds for inclusive community wellbeing sessions.',
   'Choose a gentle or energetic walking loop, then join a short wellbeing workshop. The route includes a step-free option.',
   12.00, 5000.00, 1780.00, NULL, FALSE),
  (6, 1, 1, 'Summer Skills Swap', '2026-12-11 23:00:00', '2026-12-12 03:00:00',
   '2026-12-12', 'Central Community Hub', 'Sydney',
   'Connect volunteers and share practical skills across generations.',
   'Short peer-led sessions cover repairs, gardening and digital basics. Entry donations support free follow-up workshops.',
   5.00, 2800.00, 640.00, NULL, FALSE),
  (7, 1, 5, 'Pantry Partners Market', '2027-01-15 22:00:00', '2027-01-16 03:00:00',
   '2027-01-16', 'Northbank Civic Square', 'Penrith',
   'Stock a community pantry with everyday essentials.',
   'Browse local maker stalls and drop off unopened pantry items. Stall contributions go toward staple food purchases.',
   0.00, 7500.00, 2280.00, NULL, FALSE),
  (8, 1, 2, 'Creek Discovery and Clean-up', '2027-01-29 21:30:00', '2027-01-30 01:30:00',
   '2027-01-30', 'Greenbank Creek Reserve', 'Campbelltown',
   'Protect local waterways and teach practical conservation.',
   'A guided creek walk is followed by a supervised clean-up. Gloves and collection equipment are provided.',
   0.00, 3600.00, 1020.00, NULL, FALSE),
  (9, 1, 3, 'Community Voices Music Night', '2027-02-20 07:00:00', '2027-02-20 10:00:00',
   '2027-02-20', 'Civic Arts Room', 'Liverpool',
   'Create affordable local music opportunities.',
   'A relaxed evening of community performances with seating and a quiet space. Ticket proceeds fund beginner music sessions.',
   18.00, 4500.00, 1190.00, NULL, FALSE),
  (10, 1, 4, 'Mindful Morning in the Garden', '2027-03-12 22:00:00', '2027-03-13 01:00:00',
   '2027-03-13', 'Willow Community Garden', 'Blacktown',
   'Make low-cost wellbeing activities available locally.',
   'Take part in gentle movement, gardening and a guided reflection. The activities can be adapted for different mobility needs.',
   10.00, 3000.00, 560.00, NULL, FALSE),
  (11, 1, 1, 'Planning Session Sample', '2027-03-19 23:00:00', '2027-03-20 01:00:00',
   '2027-03-20', 'Harbourview Community Hall', 'Sydney',
   'Internal draft event.',
   'This suspended sample must never appear through the public API.',
   0.00, 0.00, 0.00, NULL, TRUE);

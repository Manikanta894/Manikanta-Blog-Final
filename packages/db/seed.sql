-- Seed the categories table with Manii's Journal desks.
insert into public.categories (slug, name, kicker, description, accent, sort_order) values
  ('daily-brief', 'Daily Brief',   'Morning Intelligence',   'The signal, distilled.',           '#FF5A1F', 1),
  ('ai',          'AI',            'The AI Desk',            'Frontier models & agents.',        '#7C3AED', 2),
  ('business',    'Business',      'Business & Strategy',    'Markets, moats, and operators.',   '#059669', 3),
  ('mba',         'MBA',           'The MBA Notebook',       'Frameworks and cases.',            '#DB2777', 4),
  ('career',      'Career',        'The Career Desk',        'Playbooks for operators.',         '#EA580C', 5),
  ('productivity','Productivity',  'Systems & Craft',        'Deep work rituals and tools.',     '#0284C7', 6),
  ('essays',      'Essays',        'Long Reads',             'Slow ideas, written to last.',     '#0A0A0A', 7),
  ('projects',    'Projects',      'Studio',                 'Things I am building.',            '#BE185D', 8),
  ('archive',     'Archive',       'The Archive',            'Every issue. Every essay.',        '#525252', 9)
on conflict (slug) do nothing;

insert into public.settings (id, data)
values ('global', '{}'::jsonb)
on conflict (id) do nothing;

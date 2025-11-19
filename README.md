# Drew Boynton's Portfolio Repository

This repository contains the source code for my personal portfolio website. The site serves as a central hub to showcase my projects, skills, and experience in web development.

## Overview

The portfolio is designed to provide a glimpse into my capabilities as a developer, highlighting:

*   **Project Showcase:** Demonstrations of web applications and projects I have built, illustrating my technical skills and problem-solving abilities. I have a specific interest in Data Analysis/Manipulation and Machine Learning Model Implementations
*   **Technical Skills:** Proficiency in modern web technologies, primarily focused on front-end development with frameworks like React and Next.js, along with responsive design principles and UI/UX considerations. I have also worked extensively in Python libraries like NumPy, Pandas, and SciKit.
*   **Design Implementation:** Ability to translate design concepts into functional, aesthetically pleasing, and user-friendly web interfaces.

This project itself is an example of my work, built using Next.js, TypeScript, and Tailwind CSS, demonstrating attention to detail in UI development and modern web practices.

## Sports Edge data plumbing

The Supabase schema + migrations that back the Sports Edge card live in `supabase/migrations/001_sports_edge_schema.sql`. Apply them with `supabase db push --file supabase/migrations/001_sports_edge_schema.sql` and make sure the following env vars are set in your deployment target:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SPORTS_EDGE_CRON_SECRET
```

To keep the `/api/sports-edges` route warm (and to provide a hook for future batch jobs), a scheduled GitHub Action (`.github/workflows/ping-sports-edge-api.yml`) POSTs to the same endpoint by hitting your deployed URL stored in the `SPORTS_EDGE_CRON_URL` repo secret together with the shared `SPORTS_EDGE_CRON_SECRET`.

## Contact

If you'd like to discuss potential opportunities or collaborations, feel free to reach out:

*   **Email:** dmboynton6@gmail.com
*   **LinkedIn:** [Drew Boynton](https://www.linkedin.com/in/drew-boynton-1bba16180/)
*   **GitHub:** [dmboynton56](https://github.com/dmboynton56)

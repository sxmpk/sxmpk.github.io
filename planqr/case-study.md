## Summary

PlanQR is a university room scheduling and attendance system. It displays live class schedules on tablets outside classrooms, lets administrators manage those tablets centrally, and supports attendance tracking through student card readers.

The main challenge was integration: connecting tablet views, an admin panel, backend APIs, LDAP authentication, university schedule data, VPN-restricted infrastructure, and card-reader events into one working product.

## My Role

I worked as a hands-on full-stack developer in a 4-person team. I contributed to frontend and backend implementation, integration planning, deployment documentation, and preparing the project for presentation and review.

Because the system had several connected parts, a key part of the work was keeping UI flows, API contracts, database structure, authentication, tablet workflows, and attendance features aligned across the team.

## What I Worked On

- Built React and TypeScript interfaces for room tablets, lecturers, and administrators.
- Developed backend features with Express, Prisma, and PostgreSQL.
- Helped integrate LDAP authentication, tablet registration, room assignment, priority messages, and attendance workflows.
- Helped connect a Python card-reader service with the main backend API.

## Main Challenge

The hardest part was making several independent systems work together reliably. PlanQR depended on university infrastructure, external schedule data, LDAP, VPN access, Docker/nginx deployment, tablets, and physical card readers.

The project was also built by a 4-person team, so coordination mattered. Frontend screens, backend APIs, database models, authentication, tablet registration, and attendance flows all had to evolve together while requirements were still changing.

## Outcome

We delivered a working demonstrable system with tablet views, admin workflows, a backend API, database-backed configuration, LDAP-based access, and attendance integration.

The project gave me practical experience with full-stack development, system integration, and small-team engineering work where communication and module alignment were as important as writing the code itself.

## Links

- [GitHub repository](https://github.com/sxmpk/planqr)

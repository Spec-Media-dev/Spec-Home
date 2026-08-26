# SPEC Home — Final Implementation Brief

## Status

This document is the complete approved product brief.

The existing Supabase database is FINAL and is the source of truth.

Do not redesign the database.
Do not recreate tables.
Do not recreate RLS.
Do not create new Storage buckets.
Do not modify Supabase unless I explicitly approve a future database change.

Before implementation, produce one final implementation plan based on:

1. the actual repository,
2. the complete Figma inspection already performed,
3. the final Supabase post-fix audit,
4. this brief.

After producing the plan, STOP and wait for:

PLAN APPROVED – START IMPLEMENTATION


---

# 1. Design Direction

The Figma contains two main visual directions.

The final product must deliberately combine the strongest parts of both.

## Design #1

Design #1 is authoritative for:

- brand colors
- color shades
- contrast
- overall visual mood
- premium identity
- accent treatment

Do not replace Design #1's palette with arbitrary colors from Design #2.

## Design #2

Design #2 may improve:

- layout
- hierarchy
- component structure
- card composition
- navigation
- forms
- responsive behavior
- Admin UX
- information density

The final result must look like ONE coherent SPEC Home design system.

It must not look like two templates stitched together.

Use the measured Figma geometry already collected where appropriate.


---

# 2. Product Scope

SPEC Home is a premium bilingual real-estate platform.

Public website:

- Home
- Projects
- Project Detail
- Properties
- Property Detail
- Search
- Contact / Enquiry
- English
- Arabic
- Light Mode
- Dark Mode
- Responsive desktop/tablet/mobile

Admin:

- Login
- Dashboard Overview
- Projects
- Properties
- Property Images
- Property Specifications
- Enquiries / Lead Inbox
- Site Settings
- Admin Profile
- Password Change

Do NOT implement:

- customer registration
- customer login
- customer accounts
- Analytics charts
- maps
- lat/lng
- geolocation search


---

# 3. Language and Routing

Use next-intl.

English is the default language.

English:

/
 /projects
 /projects/[slug]
 /properties
 /properties/[slug]
 /search
 /contact

Arabic:

/ar
/ar/projects
/ar/projects/[slug]
/ar/properties
/ar/properties/[slug]
/ar/search
/ar/contact

English:

lang="en"
dir="ltr"

Arabic:

lang="ar"
dir="rtl"

RTL must be structural.

Use logical CSS directions where appropriate:

- start / end
- ps / pe
- ms / me
- text-start / text-end

Do not fake RTL with only text-align.

Admin may remain English / LTR.

Admin bilingual forms should use:

English | العربية

English fields:
LTR

Arabic fields:
RTL


---

# 4. Theme

Required:

- Light Mode
- Dark Mode

Default:

LIGHT

Do not default to System theme.

Persist explicit user choice.

Avoid hydration flash.

The theme must work across:

- public pages
- Admin
- forms
- dialogs
- tables
- cards
- dropdowns
- navigation
- loading states
- Sonner toasts

Dark Mode must remain visually connected to Design #1's brand palette.


---

# 5. Supabase Source of Truth

Use the final post-fix audit.

Actual core structure:

auth.users
→ admin_profiles

projects
→ properties

properties
→ property_images

properties
→ property_specs

projects
→ enquiries

properties
→ enquiries

site_settings

Do not use old proposed schemas.


---

# 6. Admin Authentication

Supabase Auth owns:

- email
- password
- sessions

admin_profiles owns application profile information.

Actual admin_profiles fields:

- id
- name
- avatar_path
- created_at
- updated_at

Relationship:

admin_profiles.id
→ auth.users.id
ON DELETE CASCADE

No password column in admin_profiles.

No public signup.

Authenticated does NOT automatically mean Admin.

Admin access must respect public.is_admin().

Every sensitive Admin Server Action must verify authorization server-side.


---

# 7. Projects

Use the actual projects table.

Relevant fields include:

- id
- name_en
- name_ar
- slug
- developer_en
- developer_ar
- location_en
- location_ar
- type_en
- type_ar
- status
- handover_en
- handover_ar
- portfolio
- price_min
- price_max
- currency
- area_min_sqft
- area_max_sqft
- installment_en
- installment_ar
- down_payment_en
- down_payment_ar
- monthly_installment_en
- monthly_installment_ar
- cash_discount_en
- cash_discount_ar
- notes_en
- notes_ar
- description_en
- description_ar
- cover_image_path
- is_featured
- is_published
- created_at
- updated_at

Location is plain text only.

Do not implement:

- maps
- latitude
- longitude
- location picker

Slug:

Generate automatically from name_en.

Admin should not manually type the normal slug.

Once a published URL exists, ordinary name editing should not silently change the slug.


---

# 8. Properties

Every Property MUST belong to a Project.

Relationship:

properties.project_id
→ projects.id
ON DELETE RESTRICT

Actual fields include:

- id
- project_id
- reference_code
- title_en
- title_ar
- slug
- description_en
- description_ar
- property_type_en
- property_type_ar
- price
- currency
- bedrooms
- bathrooms
- size_sqft
- status
- is_featured
- is_published
- created_at
- updated_at

Generate slug automatically from:

title_en + reference_code

Example concept:

2-bedroom-apartment-shp-10235

Do not require Admin to type slug.


---

# 9. Project → Property Flow

A Property cannot exist without a Project.

When creating Property:

- project_id is required
- verify the Project server-side
- Admin must select an existing Project

If there are no Projects:

Do not show the normal Property form.

Show:

"No Projects available"

"Properties must belong to a Project."

CTA:

"Create Project First"

When viewing a Project:

show only Properties where:

properties.project_id = projects.id

When deleting a Project that still has Properties:

respect ON DELETE RESTRICT.

Show a clean Sonner error.

Never show raw PostgreSQL errors.


---

# 10. Property Images

Use the actual property_images table.

Fields:

- id
- property_id
- image_url
- display_order
- is_cover
- created_at

Relationship:

property_images.property_id
→ properties.id
ON DELETE CASCADE

Business rule:

Draft Property:
0–4 images

Published Property:
1–4 images

Maximum:
4 images

The fifth image must be rejected BEFORE uploading.

Example:

existing = 3
new = 2
total = 5

Reject.

Count existing images server-side before accepting upload.

Use:

display_order

for ordering.

Use:

is_cover

for cover image behavior.

Avoid orphaned Storage objects if DB/file operations fail.

Do not assume the database itself enforces max-4.
The application must enforce it safely.


---

# 11. Property Specifications

Use the actual property_specs table.

Fields:

- id
- property_id
- key_en
- key_ar
- value_en
- value_ar
- created_at

Relationship:

property_specs.property_id
→ properties.id
ON DELETE CASCADE

Specs are optional.

A Property may have:

0 specs

or

multiple specs.

Admin UI:

+ Add Specification

Each row contains:

English Key
Arabic Key
English Value
Arabic Value

The current database has no ordering column for specs.

Do not invent database ordering.

Use a deterministic display strategy supported by the existing schema.


---

# 12. Enquiries

Actual enquiries fields:

- id
- name
- email
- phone
- message
- project_id
- property_id
- status
- created_at
- updated_at

Relationships:

enquiries.project_id
→ projects.id
ON DELETE SET NULL

enquiries.property_id
→ properties.id
ON DELETE SET NULL

Anonymous database INSERT is intentionally blocked.

Do NOT add anon INSERT RLS.

Final public flow:

Visitor Form
→ Next.js Server Action
→ Zod
→ honeypot
→ rate limiting
→ Turnstile when credentials exist
→ server-only privileged Supabase client
→ enquiries

Use:

SUPABASE_SERVICE_ROLE_KEY

SERVER-SIDE ONLY.

Never expose it to browser/client code.

Server forces system-controlled values.

For example:

status = 'new'

The visitor cannot submit arbitrary status.

Plan a simple Admin lead workflow based on the existing text status field.

Recommended application values:

- new
- contacted
- closed

Do not change the database schema for this unless explicitly approved.


---

# 13. Storage

Two buckets exist:

- media
- site-media

THE APPLICATION MUST USE:

site-media

Do not use `media` for new uploads.

Do not delete the legacy `media` bucket.

site-media currently provides:

- public read
- Admin-only mutation policies
- 5 MB maximum PER FILE
- JPEG
- PNG
- WebP

5 MB is a per-file upload limit, not the total Supabase Storage quota.

Use clear namespaces:

site/
admin/{admin_id}/
projects/{project_id}/
properties/{property_id}/

Examples:

site/logo/logo.webp

admin/{admin_id}/avatar.webp

projects/{project_id}/cover.webp

properties/{property_id}/1.webp


---

# 14. Site Settings

Actual site_settings fields:

- key
- logo_path
- created_at
- updated_at

Singleton key:

main

Do not use the old proposed boolean-id settings schema.

Do not add fictional fields.

Current site settings UI should manage:

- Site Logo

Admin account settings separately manage:

- Admin Name
- Admin Avatar
- Password


---

# 15. Contact Information

The current database does NOT contain:

- public phone
- WhatsApp
- contact email

The Figma may visually require them.

For the current implementation:

keep these as typed static application configuration / localized config.

Do NOT change the database for them.

Keep them centralized so they can be migrated to database-managed settings later if needed.

Do not scatter hard-coded contact values throughout components.


---

# 16. Homepage

Required major sections:

- Hero
- Search
- Featured Properties
- Browse by Project
- Recently Added Properties
- premium contact / enquiry CTA

Featured Properties:

is_published = true
AND
is_featured = true

Recently Added:

is_published = true
ORDER BY created_at DESC

Do NOT create:

is_recent


---

# 17. Projects Public Experience

Projects listing should use the actual Project fields.

Useful presentation:

- cover
- name
- developer
- location
- type
- status
- price range
- area
- handover where useful

Project Detail:

- premium hero
- project overview
- pricing
- area
- payment information
- description
- related available Properties
- enquiry CTA

Only show Properties belonging to that Project.


---

# 18. Properties Public Experience

Properties listing should be a premium inventory experience.

Use supported filtering only.

Possible filters based on actual schema:

- Project
- Property Type
- Bedrooms
- Price
- Status

Property Detail should support:

- image gallery
- cover image
- title
- reference
- price
- bedrooms
- bathrooms
- size
- property type
- Project
- description
- optional specifications
- enquiry CTA


---

# 19. Search

Search at minimum:

Projects:

- name_en
- name_ar

Properties:

- title_en
- title_ar
- reference_code

Project must be a first-class discovery path.

Do not add:

- tsvector
- pg_trgm
- custom search SQL
- database search extensions

unless explicitly approved later.


---

# 20. Admin Dashboard

No Analytics charts.

Dashboard Overview may contain useful KPI cards:

- Total Projects
- Total Properties
- Published Properties
- Featured Properties
- New Enquiries

Recent useful lists are allowed.

Do not add fake analytics.


---

# 21. Admin Projects

Provide:

- list
- search/filter where useful
- create
- view
- edit
- publish/unpublish
- feature/unfeature
- delete

The Project form has many fields.

Do not create one giant confusing form.

Group into sensible sections such as:

Basic Information
Location / Classification
Pricing / Area
Payment Details
Description / Notes
Media / Publishing

Bilingual sections should remain easy to understand.


---

# 22. Admin Properties

Inventory should show useful columns/cards such as:

- Property
- Reference
- Project
- Price
- Status
- Published
- Featured

Actions:

- Create
- Edit
- Manage Images
- Manage Specs
- Publish / Unpublish
- Feature / Unfeature
- Delete


---

# 23. Lead Inbox

Admin Enquiries page should show:

- Name
- Email
- Phone
- Related Project
- Related Property
- Status
- Date

Provide a clear detail view.

Admin can update the enquiry status.

Do not expose raw IDs unnecessarily in normal UI.


---

# 24. Sonner

Sonner is REQUIRED.

Use consistently for meaningful actions.

Examples:

- login failed
- Project created
- Project updated
- Project deleted
- blocked Project deletion
- Property created
- Property updated
- Property deleted
- publish rejected
- image uploaded
- image removed
- fifth image rejected
- specs saved
- settings updated
- profile updated
- password updated
- enquiry status updated
- server/network failure

Do not show raw:

- PostgreSQL
- Supabase
- RLS

error messages.

Map expected errors into clear user messages.

Public-site toast language must follow the active locale.

Do not spam duplicate toast + field error for every validation error.


---

# 25. Forms / Validation

Use:

- Zod
- React Hook Form where appropriate

Client validation:
UX

Server validation:
authoritative

Never trust:

- hidden inputs
- client-provided IDs
- statuses
- slugs
- URL parameters
- upload metadata
- client-side authorization state


---

# 26. Technical Foundation

Current stack:

- Next.js 16
- React 19
- TypeScript

Use modern Next.js 16-compatible patterns.

Use:

- @supabase/ssr
- next-intl
- Zod
- React Hook Form where appropriate
- Sonner
- next-themes if appropriate

Respect async Next.js APIs:

- cookies()
- headers()
- params
- searchParams

Use the correct Next.js 16 proxy architecture.

Do not use outdated middleware examples.


---

# 27. Environment Variables

Use the existing .env.local.

Do not overwrite it.

Public Supabase browser variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Server-only:

SUPABASE_SERVICE_ROLE_KEY

Figma only:

FIGMA_ACCESS_TOKEN

Never expose:

SUPABASE_SERVICE_ROLE_KEY
FIGMA_ACCESS_TOKEN

Never move them into NEXT_PUBLIC_*.


---

# 28. Responsive Requirements

Target at minimum:

360
390
768
1024
1440+

Pay particular attention to:

- Header
- Hero
- Search
- Filters
- Property Cards
- Project Cards
- Gallery
- Forms
- Admin Sidebar
- Admin Tables
- Mobile Admin navigation
- Sticky mobile CTA

No page-level horizontal overflow.


---

# 29. SEO

Plan and implement:

- page metadata
- titles
- descriptions
- canonical URLs
- Arabic / English alternates
- sitemap
- robots
- Open Graph
- semantic headings
- optimized images

Use dynamic Project/Property metadata where appropriate.


---

# 30. Performance

Prefer Server Components where appropriate.

Avoid unnecessary client components.

Use sensible caching/revalidation.

Optimize images.

Use loading/skeleton states where useful.

Do not overengineer.


---

# 31. Accessibility

Include:

- semantic HTML
- keyboard navigation
- visible focus
- form labels
- dialog accessibility
- accessible theme switch
- accessible locale switch
- image alt strategy
- sufficient contrast
- mobile tap targets


---

# 32. Implementation Order

Plan roughly in this dependency order:

1. Repository cleanup / dependency foundation
2. Supabase SSR
3. Database types
4. next-intl
5. RTL / LTR
6. Light / Dark theme
7. shared visual design system
8. Admin auth
9. Admin shell
10. Projects CRUD
11. Properties CRUD
12. Property Image Manager
13. Property Specs
14. Public Home
15. Public Projects
16. Project Detail
17. Public Properties
18. Property Detail
19. Search
20. Enquiry secure server flow
21. Lead Inbox
22. Settings / Profile / Password
23. SEO
24. Responsive / accessibility
25. complete verification


---

# 33. Required Planning Output

Before implementation, produce ONE plan with:

A. Current Project Findings

B. Figma Findings

C. Design Synthesis

Include a matrix:

Element
Preferred Source
Final Approach
Reason

Cover at minimum:

- Header
- Hero
- Search
- Property Card
- Project Card
- Filters
- Project Detail
- Property Detail
- Mobile Navigation
- Sticky Mobile CTA
- Admin Sidebar
- Dashboard Cards
- Admin Tables
- Forms
- Lead Inbox

D. Final Route Map

E. Database → UI Mapping

For:

- admin_profiles
- projects
- properties
- property_images
- property_specs
- enquiries
- site_settings

F. Admin Dashboard Plan

G. Public Website Plan

H. Component / Design System Plan

I. Data / Server Flow

J. Implementation Phases

For each phase include:

- goal
- files/modules likely affected
- dependencies
- acceptance criteria

K. Testing / Verification Plan

L. Blockers / Credentials


---

# 34. Verification Requirements

Before final completion later, run:

- lint
- TypeScript typecheck
- appropriate automated tests
- production build

Verify:

- Figma was actually followed
- Design #1 palette preserved
- English LTR
- Arabic RTL
- Light default
- Dark persistence
- Admin auth
- unauthorized Admin rejection
- Projects CRUD
- Properties CRUD
- Property requires Project
- Project delete RESTRICT UX
- image limit 4
- published Property requires image
- optional Specs
- Featured Properties
- Recently Added Properties
- Project-filtered Properties
- public published-only reads
- secure enquiry flow
- Settings singleton
- logo
- Profile
- Password via Auth
- Sonner
- responsive layout
- accessibility
- no secret in client bundle


---

# 35. Current Task

PLAN ONLY.

Do not implement yet.

Do not modify application code.

Do not modify Supabase.

Do not install packages yet.

Read:

- repository
- Figma findings
- final Supabase audit
- this complete brief

Then return ONE final implementation plan.

After the plan, STOP.

Implementation starts only after:

PLAN APPROVED – START IMPLEMENTATION
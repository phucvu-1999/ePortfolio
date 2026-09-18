# Fitness System — Updated Tech Stack Plan

## Architecture Overview

```
[Website — Commerce Platform]          [Mobile App — Consumer Experience]
  Register / Login                      Use purchased benefits
  Browse classes, courses, plans         BMI Calculator
  Buy courses, plans, coaching           Track food calories (camera)
  Payment (Stripe)                       Check workout form (camera)
  Manage subscriptions                   View meal/workout plans
                                         Push notifications
              |                                    |
              +----------------+-------------------+
                               |
                    [Backend API — ASP.NET Core 9]
                               |
              +----------------+-------------------+
              |                |                   |
        [PostgreSQL]     [Redis Cache]     [AI/ML Services]
        (Supabase)       (Upstash)         (FastAPI + OpenAI)
```

---

## Task 1: Backend (C# / ASP.NET Core 9) — Scalable Monolith

Clean Architecture with modular vertical slices. Start as a single deployable, split into microservices later.

- **Framework**: ASP.NET Core 9 — REST API + minimal APIs
- **Architecture**: Clean Architecture (4 layers: Domain, Application, Infrastructure, Presentation)
- **ORM**: Entity Framework Core 9 + PostgreSQL
- **Auth**: ASP.NET Identity + JWT Bearer + Refresh Tokens
- **Payment**: Stripe.NET (Stripe API wrapper for C#)
- **Validation**: FluentValidation
- **Caching**: Redis via StackExchange.Redis (Upstash for free tier)
- **Background Jobs**: Hangfire (plan generation, email confirmations)
- **AI Orchestration**: Microsoft Semantic Kernel (LLM meal/workout plan generation)
- **File Storage**: Supabase Storage (course images, workout videos)
- **Email**: Resend API (transactional emails — purchase confirmations, welcome)
- **Testing**: xUnit + Moq + FluentAssertions
- **API Docs**: Swashbuckle (OpenAPI/Swagger)

### Key API Modules

| Module | Endpoints | Purpose |
|---|---|---|
| Auth | /api/auth/* | Register, login, refresh, forgot password |
| Users | /api/users/* | Profile, BMI history, preferences |
| Catalog | /api/catalog/* | Classes, courses, plans, coaching packages |
| Payments | /api/payments/* | Stripe checkout, webhooks, subscription management |
| Orders | /api/orders/* | Purchase history, entitlements |
| Nutrition | /api/nutrition/* | Food recognition, calorie tracking, meal plans |
| Workout | /api/workout/* | Form checking, workout plans, exercise library |
| AI | /api/ai/* | Plan generation, recommendations |

---

## Task 2: AI/ML Microservices (Python / FastAPI)

Separate lightweight service for ML inference. Called from .NET backend via HTTP.

- **Food Recognition**: YOLOv8 (camera image -> food class detection)
- **Calorie Estimation**: Open Food Facts API + custom lookup model
- **Workout Form Check**: MediaPipe Pose (keypoint skeleton analysis)
- **Model Runtime**: ONNX / TensorFlow Lite / PyTorch
- **API Wrapper**: FastAPI — called from .NET backend via HTTP/gRPC
- **LLM for Plans**: OpenAI GPT-4o via Semantic Kernel or direct API

---

## Task 3: Website — Commerce Platform (TypeScript / Next.js 15)

The website is the **storefront + admin**. Users register, browse, and purchase. Not the primary usage app.

- **Framework**: Next.js 15 (App Router, SSR for SEO on catalog pages)
- **UI**: shadcn/ui + Tailwind CSS v4
- **State**: Zustand
- **Data Fetching**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Auth**: NextAuth.js v5 (OAuth + JWT, shares user DB with mobile)
- **Payment UI**: @stripe/react-stripe-js (Stripe Elements for checkout)
- **Charts**: Recharts (BMI history, progress dashboards)
- **Rich Text**: Tiptap (course description editor for admin)

### Website Pages

| Route | Purpose |
|---|---|
| / | Landing page |
| /register | Sign up / Sign in |
| /catalog | Browse all classes, courses, plans |
| /catalog/[slug] | Course/plan detail page |
| /checkout | Stripe payment flow |
| /dashboard | User purchases, BMI history |
| /admin | Admin: manage catalog, view orders |

---

## Task 4: Mobile App — Consumer Experience (TypeScript / React Native + Expo)

The mobile app is where users **use** what they bought. No purchasing flow on mobile initially.

- **Framework**: Expo SDK 52 (React Native, iOS + Android)
- **Navigation**: Expo Router (file-based, tab + stack navigation)
- **UI**: NativeWind (Tailwind for RN) + custom components
- **Camera**: expo-camera (food photo capture, workout form video)
- **On-device Pose**: TensorFlow.js + MoveNet (workout form, no server round-trip)
- **State**: Zustand (shared logic with web)
- **Data Fetching**: TanStack Query v5
- **Notifications**: Expo Notifications (meal reminders, workout alerts, new content)
- **Auth**: Same JWT flow as website (shared identity)

### Mobile App Tabs

| Tab | Purpose |
|---|---|
| Home | Dashboard, active plan summary |
| Nutrition | Food tracking (camera), calorie log, meal plan |
| Workout | Form check (camera), workout plan, exercise library |
| Profile | BMI calculator, settings, purchased content |

---

## Task 5: Database & Storage

- **Primary DB**: PostgreSQL 16 via Supabase (free tier, scales to Pro)
- **Cache**: Redis via Upstash (free tier, serverless-compatible)
- **File Storage**: Supabase Storage (course thumbnails, workout demo videos)
- **Search** (later): Supabase pg_trgm or Meilisearch (catalog search)

### Core Database Tables

| Table | Purpose |
|---|---|
| users | Identity, profile, BMI history |
| products | Classes, courses, plans, coaching (polymorphic catalog) |
| product_variants | Duration tiers, coaching slots |
| orders | Purchase records |
| order_items | Line items per order |
| subscriptions | Recurring plan memberships |
| entitlements | What user has access to (unlocked content) |
| nutrition_logs | Daily calorie/food entries |
| workout_logs | Completed workouts, form scores |
| meal_plans | AI-generated meal plans |
| workout_plans | AI-generated workout plans |

---

## Task 6: Platforms to Register (Free Tier First, Scalable Later)

| Platform | Free Tier | Purpose | Scales To |
|---|---|---|---|
| **Supabase** | 500 MB DB, 1 GB storage | PostgreSQL + Auth + Storage | Pro $25/mo, auto-scales |
| **Stripe** | No monthly fee (2.9% + 30c/txn) | Payments, subscriptions, checkout | Enterprise available |
| **Upstash** | 10K commands/day | Serverless Redis cache | Pay-per-request, auto-scales |
| **Vercel** | 100 GB bandwidth, Hobby tier | Deploy Next.js website | Pro $20/mo per member |
| **Railway** | $5 free credit/month | Deploy .NET backend + FastAPI | Usage-based, auto-scales |
| **Expo** | Free (EAS Build 30/mo) | Mobile app build + OTA updates | EAS Production $3000/yr |
| **GitHub** | Free (unlimited private repos) | Source control + GitHub Actions CI/CD | Team $4/user/mo |
| **Resend** | 100 emails/day free | Transactional email | Pro $20/mo |
| **OpenAI** | Pay-as-you-go | GPT-4o for plan generation | Volume discounts |
| **Sentry** | 5K errors/mo free | Error tracking (backend + web + mobile) | Team $26/mo |

### Total Monthly Cost at MVP Stage: $0 (all free tiers) + OpenAI usage

---

## Task 7: Monorepo Folder Structure

```
fitness-system/
|
+-- .github/
|   +-- workflows/
|       +-- backend-ci.yml
|       +-- web-ci.yml
|       +-- mobile-ci.yml
|       +-- ai-service-ci.yml
|
+-- backend/
|   +-- src/
|   |   +-- FitnessApp.Domain/           # Entities, value objects, enums
|   |   |   +-- Entities/
|   |   |   |   +-- User.cs
|   |   |   |   +-- Product.cs
|   |   |   |   +-- Order.cs
|   |   |   |   +-- Subscription.cs
|   |   |   |   +-- Entitlement.cs
|   |   |   |   +-- NutritionLog.cs
|   |   |   |   +-- WorkoutLog.cs
|   |   |   |   +-- MealPlan.cs
|   |   |   |   +-- WorkoutPlan.cs
|   |   |   +-- ValueObjects/
|   |   |   +-- Enums/
|   |   +-- FitnessApp.Application/       # Use cases, DTOs, interfaces
|   |   |   +-- Common/Interfaces/
|   |   |   +-- Auth/
|   |   |   +-- Catalog/
|   |   |   +-- Payments/
|   |   |   +-- Orders/
|   |   |   +-- Nutrition/
|   |   |   +-- Workout/
|   |   |   +-- AI/
|   |   +-- FitnessApp.Infrastructure/    # EF Core, Stripe, Redis, Supabase
|   |   |   +-- Persistence/
|   |   |   |   +-- Configurations/       # EF Fluent API configs
|   |   |   |   +-- Migrations/
|   |   |   |   +-- Repositories/
|   |   |   +-- Payments/StripeService.cs
|   |   |   +-- Cache/RedisService.cs
|   |   |   +-- Storage/SupabaseStorageService.cs
|   |   |   +-- Email/ResendEmailService.cs
|   |   |   +-- AI/SemanticKernelService.cs
|   |   +-- FitnessApp.WebAPI/            # ASP.NET Core host
|   |       +-- Controllers/
|   |       +-- Middleware/
|   |       +-- Program.cs
|   |       +-- appsettings.json
|   +-- tests/
|   |   +-- FitnessApp.UnitTests/
|   |   +-- FitnessApp.IntegrationTests/
|   +-- FitnessApp.sln
|
+-- ai-service/
|   +-- app/
|   |   +-- main.py                      # FastAPI entry
|   |   +-- routers/
|   |   |   +-- food_recognition.py
|   |   |   +-- form_check.py
|   |   |   +-- plan_generator.py
|   |   +-- models/                      # YOLOv8 weights, MediaPipe config
|   |   +-- services/
|   |       +-- yolo_service.py
|   |       +-- mediapipe_service.py
|   |       +-- openai_service.py
|   +-- requirements.txt
|   +-- Dockerfile
|
+-- web/
|   +-- src/
|   |   +-- app/                         # Next.js App Router
|   |   |   +-- (auth)/
|   |   |   |   +-- register/page.tsx
|   |   |   |   +-- login/page.tsx
|   |   |   +-- (store)/
|   |   |   |   +-- page.tsx             # Landing
|   |   |   |   +-- catalog/page.tsx
|   |   |   |   +-- catalog/[slug]/page.tsx
|   |   |   |   +-- checkout/page.tsx
|   |   |   +-- (dashboard)/
|   |   |   |   +-- dashboard/page.tsx
|   |   |   |   +-- dashboard/orders/page.tsx
|   |   |   |   +-- dashboard/bmi/page.tsx
|   |   |   +-- admin/
|   |   |       +-- page.tsx
|   |   |       +-- catalog/page.tsx
|   |   |       +-- orders/page.tsx
|   |   +-- components/
|   |   |   +-- ui/                      # shadcn/ui
|   |   |   +-- layout/
|   |   |   +-- catalog/
|   |   |   +-- checkout/
|   |   |   +-- dashboard/
|   |   +-- lib/
|   |   |   +-- api.ts                   # Backend API client
|   |   |   +-- stripe.ts
|   |   |   +-- auth.ts                  # NextAuth config
|   |   +-- hooks/
|   |   +-- stores/
|   +-- public/
|   +-- package.json
|   +-- next.config.ts
|
+-- mobile/
|   +-- src/
|   |   +-- app/                         # Expo Router
|   |   |   +-- (auth)/login.tsx
|   |   |   +-- (tabs)/
|   |   |   |   +-- _layout.tsx
|   |   |   |   +-- home/index.tsx
|   |   |   |   +-- nutrition/index.tsx
|   |   |   |   +-- workout/index.tsx
|   |   |   |   +-- profile/index.tsx
|   |   |   +-- _layout.tsx
|   |   +-- components/
|   |   |   +-- ui/
|   |   |   +-- camera/
|   |   |   +-- nutrition/
|   |   |   +-- workout/
|   |   +-- lib/
|   |   |   +-- api.ts                   # Same backend API client
|   |   |   +-- auth.ts
|   |   +-- hooks/
|   |   +-- stores/
|   +-- app.json
|   +-- package.json
|
+-- shared/
|   +-- types/                           # Shared TS types (web + mobile)
|   +-- constants/
|
+-- docker-compose.yml                   # Local dev: Postgres + Redis
```

**Total: 5 top-level project folders** (`backend`, `ai-service`, `web`, `mobile`, `shared`)

---

## Task 8: Phase-by-Phase Rollout

### Phase 1 — Foundation (Weeks 1-3)
1. Set up monorepo, backend Clean Architecture skeleton
2. Supabase project + initial migration (users, products tables)
3. Auth flow (register/login) on website + mobile
4. Deploy backend to Railway, website to Vercel

### Phase 2 — Commerce (Weeks 4-6)
1. Product catalog CRUD (admin on website)
2. Stripe Checkout integration (one-time + subscriptions)
3. Entitlement system (purchase unlocks content)
4. Order history dashboard

### Phase 3 — Consumer Features (Weeks 7-10)
1. BMI Calculator (website + mobile)
2. Food calorie tracking (mobile camera + FastAPI YOLOv8)
3. Workout form check (mobile camera + MediaPipe)
4. Nutrition/workout logging with charts

### Phase 4 — AI Plans (Weeks 11-13)
1. OpenAI GPT-4o integration for meal plan generation
2. Workout plan generation based on user profile
3. Hangfire background job for plan scheduling
4. Push notifications for plan reminders

---

## Summary: Free Tier MVP Starting Stack

| Concern | Choice | Free Tier |
|---|---|---|
| Backend | ASP.NET Core 9 on Railway | $5 credit/mo |
| Database | PostgreSQL via Supabase | 500 MB |
| Cache | Redis via Upstash | 10K cmds/day |
| Web | Next.js 15 on Vercel | 100 GB bandwidth |
| Mobile | Expo (React Native) | 30 EAS builds/mo |
| Payments | Stripe | No monthly fee |
| AI (early) | OpenAI API | Pay-as-you-go |
| Pose (mobile) | TensorFlow.js MoveNet (on-device) | Free |
| Email | Resend | 100 emails/day |
| CI/CD | GitHub Actions | 2000 min/mo |
| Errors | Sentry | 5K events/mo |

**Total monthly cost at MVP: $0 + OpenAI usage fees**

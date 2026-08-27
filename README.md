A flashcard study app for the Microsoft Fabric Analytics Engineer (DP-600) certification, built on Fabric Apps / Rayfin (public preview) and connected live to a Fabric semantic model.

What it does

102 flashcards across 19 exam domains—DAX fundamentals, storage modes, Direct Lake, lakehouse/warehouse admin, performance optimization, security & governance, and exam-style scenario questions. Deck-by-deck study flow with flip-to-reveal answers and "Got it" progress tracking. Per-category progress summary and a full searchable card table. Pulls data live from an existing Fabric semantic model.

How it was built Rayfin/Fabric Apps entered public preview at Build 2026 — a TypeScript SDK+CLI that lets you define data models with decorators and get a GraphQL API, auth, and static hosting auto-provisioned inside your Fabric tenant. Create the Fabric App item — in the Fabric portal: New item → Fabric App, named Quiz app. Scaffold with the data app template:

npm create @microsoft/rayfin@latest -- "Quiz app" --template dataapp --workspace "dp600_flashcards" cd quiz-app

Connect to the semantic model — pass Copilot the model's share link directly: Connect this app to my semantic model at . Build a flashcard quiz UI using the Flashcards table (Category, Question, Answer columns), with a data grid view and a per-category progress summary. Run and deploy:

bash 
npm run dev 
npx rayfin up

Apps connected to a semantic model currently can't be opened outside the Fabric portal. That means there's no standalone public URL for this demo yet; it has to be opened from inside Fabric. The screen recording in this repo/submission was captured that way, not from a public link. Watch here: https://youtu.be/jvVST2gV6qo?si=YbNL3yt9OdRN0QYf

Tech stack 
Rayfin (Fabric Apps SDK/CLI, public preview) 
TypeScript + React (data app template) 
Fabric semantic model as the live data source 
Fabric SSO for auth

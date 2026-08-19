# Safely

Build a complete working web app called SAFELY for the hackathon theme “Safety Net.”

I need a WORKING MVP immediately. Do not explain anything to me. Do not ask questions. Build the app directly in the existing project.

Core idea

SAFELY is a personal safety web app that helps a user quickly get help when they feel unsafe.

Build these features:

Landing/Dashboard

Clean modern safety-focused UI.

App name: SAFELY.

Main button: “I NEED HELP”

Secondary button: “START SAFE JOURNEY”

Show current safety status: Safe / Monitoring / Emergency.

Emergency Mode

When “I NEED HELP” is clicked:

Change status to EMERGENCY.

Show a large emergency screen.

Start a visible 10-second countdown.

Provide buttons:

CALL EMERGENCY

ALERT CONTACTS

CANCEL

For demo purposes, use tel:112 for the emergency call.

Alert Contacts should simulate sending an SOS and visibly show “Emergency contacts alerted.”

Safe Journey

User enters destination.

Start journey.

Show:

Journey active

elapsed time

destination

safety status

Include “I’m Safe” button.

Include “End Journey” button.

If the user does not check in, display a warning/alert state.

AI Safety Assistant

Add a chat-style safety assistant called SafeAI.

User can type situations such as:

“I’m walking home alone”

“Someone is following me”

“I feel unsafe”

Give practical immediate safety advice.

Since no API key is available, implement this with intelligent predefined responses/keyword detection so it works offline.

Nearby Safety

Create a section showing:

Police Station

Hospital

Safe/Public Place

Use demo locations/data if real geolocation/API is unavailable.

Add a “Use My Location” button using browser geolocation when available.

Emergency Contacts

Allow adding a name and phone number.

Save contacts using localStorage.

Display saved contacts.

Allow deleting contacts.

Persistence

Use localStorage for:

emergency contacts

journey state

basic user settings

Everything must still exist after page refresh.

Important

Use the existing project structure.

Do NOT introduce a backend/database unless absolutely necessary.

Use HTML, CSS and vanilla JavaScript if that is what the current project uses.

Make the UI polished and responsive.

Add smooth transitions and clear visual states.

Make every button actually work.

No placeholder buttons.

No fake broken links.

No unnecessary features.

Prioritize a working demo over complexity.

Final requirement

After building everything, RUN the project and make sure it works.

If there is an existing localhost setup, preserve it.

Also make sure the app can be deployed easily as a static website and that there is a clear index.html entry point.

START BUILDING NOW. Do not stop at explaining or generating a plan.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://safetynow-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5af4bf9f-abdc-4cbb-8d83-0cbc535cf15a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

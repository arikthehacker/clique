# Clique

Clique is a React Native mobile app prototype for private friend groups. It combines group chats, shared memories, lightweight planning, and profile customization into one social space.

I built the working MVP in Expo and TypeScript with a business-student partner. I handled the app development and technical implementation, while my partner helped shape the product concept, research direction, business model, and pitch. The project was presented at a venture competition and placed 2nd.

## Project Status

This repo contains the MVP/prototype version of Clique. It is not a production app yet.

The current version focuses on:

- mobile UI and navigation
- onboarding flow
- group chat structure
- memory feature prototypes
- calendar feature prototypes
- settings and profile sidebar overlays
- demo-ready app flow

Firebase setup has been started for future Auth and Firestore support, but the main completed work in this repo is the front-end mobile experience.

## Why I Built It

Clique was designed around close friend groups instead of public social feeds. The idea was to create a space where people could share small updates, save group memories, and plan things together without the pressure of posting to a large audience.

The main product question was:

> What would a social app look like if it was built around private circles, memories, and coordination instead of scrolling?

## Core Features

- Welcome, sign up, and login screens
- Avatar upload and username selection flow
- Profile question onboarding
- Swipeable home layout with Group, Memory, and Calendar tabs
- Custom animated tab bar
- Group chat home screen
- Group chat creation flow
- Individual group chat room with sender/receiver message layout
- Group settings modal
- Profile peek modal
- Memory capture/prototype screens
- Frame and caption memory flow
- Widget preview mockup
- Master calendar screen with add-event modal
- Settings sidebar overlay
- User profile sidebar overlay

## Tech Stack

| Area | Tools |
|---|---|
| Mobile framework | React Native, Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| UI/UX | Figma, custom React Native styling |
| Camera / media | Expo Camera, Expo Image Picker |
| Haptics | Expo Haptics |
| Backend direction | Firebase Auth, Firestore |
| Testing/demo | Expo Go |

## My Role

I was responsible for the technical build of the MVP, including:

- setting up the Expo project structure
- building the onboarding flow
- implementing screen navigation
- creating the group chat interface
- building sidebar overlays for settings and user profile views
- prototyping the memory and calendar flows
- styling the app around the intended visual identity
- testing different feature ideas in separate prototype files
- preparing the app for live demo use

This project helped me practice translating a product idea into a working mobile app while balancing design, user flow, and implementation constraints.

## Project Structure

```text
app/
  calendar/
    index.tsx
    master.tsx

  components/
    AnimatedTabBar.tsx
    BackButton.tsx

  groupchat/
    [id].tsx
    create.tsx
    createtest.tsx

  home/
    GroupChatScreen.tsx
    SettingsSidebar.tsx
    UserProfileSidebar.tsx
    index.tsx

  memory/
    camera.tsx
    index.tsx
    post.tsx

  avatar.tsx
  index.tsx
  login.tsx
  questions.tsx
  signup.tsx
  username.tsx
  welcome.tsx

src/
  firebase/
    firebaseConfig.ts
    userService.ts
    groupService.ts
    messageService.ts

# Trickster Maker

A strategic battle game where you assemble tricksters with unique traits and watch them compete in a battle of wits and cunning. Created for my Tricksters in World Culture class at Columbia - the best global core there can be :) 

![Trickster Maker](https://i.imgur.com/asbyEo1.png)

## Play Now

🎮 **[Play Trickster Maker](https://trickster-maker.vercel.app/)**

## About

Trickster Maker is an interactive game where you customize two tricksters—one powerless and one powerful—by selecting their traits (head, body, and accessory). Each trait combination unlocks different battle moves and strategies. Watch as your tricksters battle it out in a turn-based combat system where moves, credibility, momentum, and crowd support determine the winner.

## Features

- **Trait Customization**: Choose from various head, body, and accessory combinations
- **Dynamic Battle System**: Each trait combination unlocks unique moves and strategies
- **Turn-Based Combat**: Watch your tricksters battle with narrated moves and effects
- **Strategic Depth**: Different moves have varying success rates, cooldowns, and effects

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trickster-maker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Project Structure

- `app/` - Next.js app directory with pages and global styles
- `src/battle/` - Battle system logic (moves, resolution, narration, policy)
- `src/components/` - React components (character canvas, trait menu, etc.)
- `src/types/` - TypeScript type definitions
- `public/` - Static assets and images

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)

## Deploy

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

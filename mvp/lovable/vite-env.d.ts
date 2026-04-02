@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. 
All colors MUST be HSL.
*/

@layer base {
  :root {
    --background: 225 30% 10%;
    --foreground: 200 20% 85%;

    --card: 225 25% 14%;
    --card-foreground: 200 20% 85%;

    --popover: 225 25% 14%;
    --popover-foreground: 200 20% 85%;

    --primary: 185 100% 42%;
    --primary-foreground: 225 30% 8%;

    --secondary: 225 20% 18%;
    --secondary-foreground: 200 20% 75%;

    --muted: 225 15% 16%;
    --muted-foreground: 200 10% 50%;

    --accent: 185 100% 42%;
    --accent-foreground: 225 30% 8%;

    --destructive: 0 60% 45%;
    --destructive-foreground: 0 0% 100%;

    --border: 185 40% 22%;
    --input: 225 20% 20%;
    --ring: 185 100% 42%;

    --radius: 0.25rem;

    --board-bg: 225 25% 14%;
    --board-cell: 200 30% 18%;
    --board-cell-hover: 200 35% 25%;
    --board-border: 185 40% 22%;
    --board-border-outer: 185 40% 40%;
    --mirror-cell: 225 15% 12%;
    --mirror-cell-border: 225 15% 18%;
    --piece-black: 0 0% 10%;
    --piece-black-border: 0 0% 22%;
    --piece-white: 0 0% 90%;
    --piece-white-border: 0 0% 72%;

    --sidebar-background: 225 25% 12%;
    --sidebar-foreground: 200 20% 85%;
    --sidebar-primary: 185 100% 42%;
    --sidebar-primary-foreground: 225 30% 8%;
    --sidebar-accent: 225 20% 18%;
    --sidebar-accent-foreground: 200 20% 75%;
    --sidebar-border: 185 40% 22%;
    --sidebar-ring: 185 100% 42%;
  }

  .dark {
    --background: 225 30% 10%;
    --foreground: 200 20% 85%;
    --card: 225 25% 14%;
    --card-foreground: 200 20% 85%;
    --popover: 225 25% 14%;
    --popover-foreground: 200 20% 85%;
    --primary: 185 100% 42%;
    --primary-foreground: 225 30% 8%;
    --secondary: 225 20% 18%;
    --secondary-foreground: 200 20% 75%;
    --muted: 225 15% 16%;
    --muted-foreground: 200 10% 50%;
    --accent: 185 100% 42%;
    --accent-foreground: 225 30% 8%;
    --destructive: 0 60% 45%;
    --destructive-foreground: 0 0% 100%;
    --border: 185 40% 22%;
    --input: 225 20% 20%;
    --ring: 185 100% 42%;
    --sidebar-background: 225 25% 12%;
    --sidebar-foreground: 200 20% 85%;
    --sidebar-primary: 185 100% 42%;
    --sidebar-primary-foreground: 225 30% 8%;
    --sidebar-accent: 225 20% 18%;
    --sidebar-accent-foreground: 200 20% 75%;
    --sidebar-border: 185 40% 22%;
    --sidebar-ring: 185 100% 42%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    scrollbar-gutter: stable both-edges;
    overflow-y: scroll;
  }
}

/* Capture animation: jump up then shrink */
@keyframes capture {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  40% {
    transform: translateY(-12px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(-8px) scale(0);
    opacity: 0;
  }
}

.animate-capture {
  animation: capture 0.4s ease-out forwards;
}

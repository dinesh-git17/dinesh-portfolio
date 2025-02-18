# Dinesh Portfolio

This is a personal portfolio website built with Next.js and TypeScript that showcases my projects, experience, and technical skills. This version features a modern, responsive layout with an interactive "Connecting Dots" background effect for a dynamic user experience.

## Features

- **Modern Responsive Design** 
    Clean layout with a grid-based design, smooth hover animations, and fully responsive pages.

- **Connecting Dots Effect** 
    A dynamic background effect that draws connecting dots and lines for an engaging visual experience.

- **Optimized Performance** 
    Built with Next.js using modern best practices for performance and accessibility.

- **Easy Deployment** 
    Deployed on Vercel with continuous integration from GitHub.

## Project Structure

```
dinesh-portfolio/
├───src/
  ├───app/
    ├──global.css        // Global CSS for the entire app (located in the app folder)
    ├──layout.tsx        // Root layout including the Connecting Dots component
  ├───components/
    ├──Hero.tsx        // Hero section component
    ├──Navbar.tsx        // Navbar component
    ├──ConnectingDots.tsx    // Client component that renders the connecting dots effect
  ├──styles/
    ├─    ( any CSS Modules as needed )
├──public/
    ├──favicon.ico        // Site favicon
├──package.json
├──tsconfig.json
├──README.md
```

*Note*: The connecting dots effect is implemented in `ConnectingDots.tsx` as a client component (it uses React hooks such as `useEffect`, so it’s marked with `"use client"` at the top).

## Getting Started

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/dinesh-git17/dinesh-portfolio.git
```

2. **Navigate into the project directory:**
```bash
cd dinesh-portfolio
```

3. **Install dependencies:**
```bash
npm install
```
(or if you use Yarn:
```bash
yarn install
```

### Running Locally

Start the development server:
```bash
npm run dev
```
(or with Yarn:
```bash
yarn dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser to see your portfolio with the connecting dots effect.

### Deployment

This project is set up for deployment on Vercel. Simply push your changes to GitHub, and Vercel will automatically deploy the latest version.

## Technologies Used

- **Next.js** (App Directory and Server/Client Components)
- **React** and **TypeScript**
- **CSS Modules** and global CSS (in `src/app/global.css`)
- **Vercel** for hosting and deployment

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements or fixes. If you find any issues, feel free to open an issue on GitHub.

## License

This project is licensed under the MIT License.
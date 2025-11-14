## ----- BUILT FOR THE FUN OF BUILDING      -----
## ----- KEEP YOUR EXPECTATIONS LOW         ----- 
## ----- ALL CODE AND PROSE IS AI GENERATED -----
## ----- USE WITH CAUTION !!!               -----
##

# BudgetFlow

BudgetFlow is a Next.js based budgeting application. It allows you to create scenarios and manage income or expense categories with synchronized sliders and charts. The project uses Firebase for optional deployment and integrates with Tailwind CSS for styling.

![image](https://github.com/user-attachments/assets/4fa06969-79fe-4e54-b152-1018dc70a270)


## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available on <http://localhost:3000> by default.

3. **Build for production**
   ```bash
   npm run build
   ```
4. **Run the production server**
   ```bash
   npm start
   ```

## Scripts

- `npm run dev` - Start Next.js in development mode.
- `npm run build` - Create an optimized production build.
- `npm start` - Start the production server after building.
- `npm run genkit:dev` - Start Genkit locally for AI features.
- `npm run genkit:watch` - Start Genkit in watch mode.
- `npm run lint` - Run ESLint checks.
- `npm run typecheck` - Run TypeScript type checking.

## Environment

BudgetFlow requires **Node.js 20** or later. The `.idx/dev.nix` file is configured to use Node 20 when developing with Nix.

## Firebase Deployment (Optional)

The repository includes `apphosting.yaml` for Firebase App Hosting. To deploy:

1. Install the Firebase CLI and log in:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Build the application:
   ```bash
   npm run build
   ```
3. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

Customize `projectId` in `.idx/dev.nix` and `firebase.json` if needed.


# Typing Competitor - Real-time Multiplayer Typing Game

A modern, real-time multiplayer typing speed application built with Next.js 14, Socket.IO, and MongoDB. Features
comprehensive TypeScript support, Zod validation, and both authenticated and guest modes.

![Typing Competitor Landing Page](assets/img/ui1.png)

## Table of Contents

- [🧾 Overview](#-overview)
- [🎮 How to Play](#-how-to-play)
- [🚀 Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Installation & Setup](#-installation--setup)
- [📝 Available Scripts](#-available-scripts)
- [🔧 Configuration](#-configuration)
  - [Socket.IO Events](#socketio-events)
  - [Customization Options](#customization-options)

---

## 🏗️ Architecture Overview

This application follows a modular architecture with a clear separation of concerns. The frontend is built using Next.js 14 with the App Router, while the backend utilizes Socket.IO for real-time communication and MongoDB for data storage.

![Architecture Overview](assets/img/architecture.png)

### Multiplayer Flow

![Multiplayer Sequence Diagram](assets/img/multiplayer-sequence.png)

### Data Flow/Storage

![Data Flow](assets/img/data-storage.png)

### Tech Stack Overview

![Tech Stack Overview](assets/img/tech-stack.png)

---

## 🚀 Features

### 🎯 Core Features

- **Solo Practice Mode**: Improve typing with timed tests and instant feedback
- **Real-time Multiplayer Racing**: Compete with friends in live typing races
- **Guest Mode**: Practice without account creation with local data storage
- **Comprehensive Statistics**: Track WPM, accuracy, and improvement over time
- **Anti-cheat System**: Advanced detection for impossible speeds and bot patterns
- **Live Chat**: Real-time communication during multiplayer races
- **Dark/Light Theme**: Seamless theme switching with system preference detection

### 🔐 Authentication & Security

- **NextAuth.js Integration**: Secure authentication with JWT strategy
- **Guest Mode Support**: Full functionality without account requirement
- **Cheat Detection**: Real-time analysis of typing patterns
- **Data Validation**: Runtime validation with Zod schemas
- **Type Safety**: Comprehensive TypeScript coverage

### 📊 Data & Analytics

- **MongoDB Integration**: Scalable database with migration system
- **Performance Tracking**: Detailed statistics and progress charts
- **Leaderboards**: Global and room-specific rankings
- **Data Export**: Guest users can export their progress
- **Historical Analysis**: Track improvement over time

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript** with strict configuration
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Socket.IO Client** for real-time communication
- **NextAuth.js** for authentication
- **Recharts** for data visualization
- **Zod** for runtime validation

### Backend

- **Node.js** with Express.js
- **Socket.IO Server** for WebSocket communication
- **MongoDB** with native driver
- **TypeScript** with TSX runtime
- **Zod** for data validation
- **bcryptjs** for password hashing

### Development Tools

- **TSX** for TypeScript execution
- **ESLint** with TypeScript rules
- **Prettier** for code formatting
- **Husky** for git hooks (optional)
- **Concurrently** for parallel development
- **Nodemon** for backend auto-reloading

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or MongoDB Atlas)
- **macOS Terminal** or compatible shell

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd typing-competitor

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create environment files:

```bash
# Create main environment file
touch .env.local

# Create server environment file (if needed)
touch server/.env
```

Add the following to `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/typing-competitor
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typing-competitor

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Socket.IO Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Migration Secret (for production)
MIGRATION_SECRET=your-migration-secret

# Environment
NODE_ENV=development
```

### 3. Database Setup

a. Check migration status

```bash
npm run migrate -- status
```

b. Run database migrations

```bash
npm run migrate -- up
```

c. Seed development data (optional)

```bash
npm run seed
```

### 4. Development Server

Choose one of the following options:

**Option A: Run both frontend and backend together**

```bash
npm run dev
```

- Runs frontend in Next.js dev mode.
- Runs backend with **nodemon** (auto-restart on changes).

**Option B: Run separately in different terminals**

Terminal 1 (Frontend):

```bash
npm run dev:FE
```

Terminal 2 (Backend):

```bash
npm run dev:BE
```

### 5. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend Health Check**: [http://localhost:3001/health](http://localhost:3001/health)
- **Socket.IO Server**: ws\://localhost:3001

### System Components

1. **Frontend (Next.js 14)**
   - App Router with TypeScript
   - Real-time Socket.IO integration
   - Guest mode with local storage
   - Responsive design with Tailwind CSS

2. **Backend Services**
   - Socket.IO server for real-time features
   - Next.js API routes for REST endpoints
   - NextAuth.js for authentication

3. **Database Layer**
   - MongoDB with native driver
   - Migration system with versioning
   - Automated seeding for development

4. **Type Safety & Validation**
   - Comprehensive TypeScript coverage
   - Zod schemas for runtime validation
   - Type-safe Socket.IO events

## 📝 Available Scripts

### Development

```bash
npm run dev:FE              # Start Next.js development server (Frontend)
npm run dev:BE           # Start backend server with auto-reload (Nodemon)
npm run dev          # Run both frontend & backend together
npm run type-check       # TypeScript type checking
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier (if configured)
```

### Database Management

```bash
npm run migrate -- status   # Check migration status
npm run migrate -- up       # Run pending migrations
npm run migrate -- down 1     # Rollback to specific version
npm run seed     # Seed development data
```

### Production

```bash
npm run build            # Build Next.js frontend for production
npm run start:FE         # Start production frontend (Next.js)
npm run start:BE         # Start backend server in production
```

## 🎮 How to Play

### Solo Practice

1. Visit the homepage
2. Click "Start Solo Practice"
3. Choose test duration (15s, 30s, 60s, 120s)
4. Start typing when ready
5. View detailed results and improvement tips

### Multiplayer Racing

1. **With Account**: Sign up/in and click "Join Multiplayer Race"
2. **As Guest**: Enter display name for guest racing
3. Create a new room or join existing one
4. Wait for other players to join
5. Host starts the race countdown
6. Type as fast and accurately as possible!
7. Chat with other players during races

### Guest Mode Features

- ✅ Full solo practice functionality
- ✅ Local statistics tracking
- ✅ Data export capability
- ✅ Multiplayer racing participation
- ✅ Real-time chat in races
- ❌ No persistent cross-device data
- ❌ No global leaderboards

## 🔧 Configuration

### Socket.IO Events

**Client → Server:**

```typescript
interface ClientToServerEvents {
  "user:join": (userData: SocketUserData) => void;
  "room:create": (roomData: RoomCreateData) => void;
  "room:join": (data: RoomJoinData) => void;
  "room:leave": () => void;
  "race:start": () => void;
  "typing:update": (data: TypingUpdateData) => void;
  "chat:message": (data: ChatMessageData) => void;
}
```

**Server → Client:**

```typescript
interface ServerToClientEvents {
  "rooms:list": (rooms: RoomListItem[]) => void;
  "room:joined": (data: { room: RoomInfo; players: Player[] }) => void;
  "race:countdown": (data: { countdown: number }) => void;
  "race:started": (data: { startTime: number; text: string }) => void;
  "player:progress": (data: PlayerProgressData) => void;
  "chat:message": (message: ChatMessage) => void;
  error: (error: SocketError) => void;
}
```

### Customization Options

**Race Texts**: Edit the `raceTexts` array in `server/index.ts`

**Styling**: Modify Tailwind classes or extend the theme in `tailwind.config.ts`

**Validation**: Update Zod schemas in `lib/validation/schemas.ts`

**Database Schema**: Add new migrations in `lib/database/migrations.ts`

## 🚀 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variables:

   ```env
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   NEXT_PUBLIC_SOCKET_URL=https://your-server-domain.com
   ```

3. Deploy automatically on push

### Backend (Railway/Render/DigitalOcean)

1. Deploy the `server/` directory
2. Set environment variables:

   ```env
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://...
   ```

3. Update CORS origins in `server/index.ts`
4. Ensure WebSocket support is enabled

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Configure network access and database users
3. Update connection string in environment variables
4. Run migrations in production:

   ```bash
   npm run migrate -- up
   ```

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Manual Testing Checklist

- [ ] Solo practice mode functionality
- [ ] Guest mode data persistence
- [ ] Multiplayer room creation/joining
- [ ] Real-time race synchronization
- [ ] Chat functionality
- [ ] Authentication flow
- [ ] Statistics tracking
- [ ] Theme switching
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Run linting and type checking: `npm run lint && npm run type-check`
5. Test your changes thoroughly
6. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Use Zod schemas for all data validation
- Maintain comprehensive error handling
- Write self-documenting code with proper types
- Follow ESLint rules and conventions

## 📊 Performance Considerations

### Frontend Optimization

- Next.js App Router for optimal loading
- Component lazy loading where appropriate
- Efficient Socket.IO event handling
- Local storage optimization for guest mode

### Backend Optimization

- MongoDB indexing for query performance
- Socket.IO room management optimization
- Memory-efficient data structures
- Proper error handling and logging

### Database Optimization

- Compound indexes for common queries
- TTL indexes for temporary data
- Aggregation pipelines for statistics
- Connection pooling and optimization

## 🐛 Troubleshooting

### Common Issues

**Socket.IO Connection Failed**

```bash
# Check if server is running
curl http://localhost:3001/health

# Verify environment variables
echo $NEXT_PUBLIC_SOCKET_URL
```

**Database Connection Issues**

```bash
# Test MongoDB connection
npm run migrate -- status

# Check MongoDB service (macOS)
brew services list | grep mongodb
```

**TypeScript Errors**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Build Errors**

```bash
# Type check before building
npm run type-check

# Check for ESLint errors
npm run lint
```

### Debug Mode

Enable debug logging:

```bash
# Frontend debug
DEBUG=socket.io-client:* npm run dev

# Backend debug
DEBUG=socket.io:* npm run dev:BE
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Upcoming Features

- [ ] **Advanced Statistics**: Heat maps, keystroke analysis
- [ ] **Tournament Mode**: Bracket-style competitions
- [ ] **Custom Texts**: User-uploaded practice content
- [ ] **Voice Chat**: Real-time voice communication
- [ ] **Mobile App**: React Native implementation
- [ ] **AI Opponents**: Practice against AI players
- [ ] **Achievements System**: Badges and milestones
- [ ] **Team Competitions**: Group vs group racing

### Technical Improvements

- [ ] **Unit Testing**: Jest and React Testing Library
- [ ] **E2E Testing**: Playwright test suite
- [ ] **Performance Monitoring**: Real-time metrics
- [ ] **CDN Integration**: Asset optimization
- [ ] **Redis Caching**: Session and data caching
- [ ] **Microservices**: Service decomposition
- [ ] **GraphQL API**: Alternative to REST endpoints

## 📞 Support

For issues and questions:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review this README and troubleshooting section
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment details (OS, Node.js version, etc.)
   - Error messages and logs

---

**Built with ❤️ using Next.js, TypeScript, and Socket.IO**

_Happy typing! 🎯⌨️_

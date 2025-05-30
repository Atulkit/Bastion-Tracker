const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://localhost:3000",
    "https://localhost:3001"
  ],
  credentials: true
}));

app.use(express.json());

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000", 
      "https://localhost:3001"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage for bastions
const bastions = new Map();

// Generate room code
function generateRoomCode() {
  const adjectives = ['Dragon', 'Stone', 'Iron', 'Golden', 'Silver', 'Crystal', 'Shadow', 'Fire'];
  const nouns = ['Keep', 'Tower', 'Fort', 'Hold', 'Bastion', 'Castle', 'Stronghold', 'Citadel'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${adjective}-${noun}-${number}`.toUpperCase();
}

// Create default bastion data
function createDefaultBastion() {
  return {
    id: uuidv4(),
    party: [],
    bastionGold: 5000,
    bastionDefenders: 0,
    bastionTurn: 1,
    defensiveWalls: 0,
    armoryStocked: false,
    basicFacilities: [
      { 
        name: 'Bedroom', 
        space: 'Cramped', 
        id: 1,
        hirelings: [{ id: 1, name: 'Martha', race: 'Human', role: 'Caretaker' }]
      },
      { 
        name: 'Kitchen', 
        space: 'Roomy', 
        id: 2,
        hirelings: [{ id: 2, name: 'Cook', race: 'Halfling', role: 'Caretaker' }]
      }
    ],
    specialFacilities: [],
    connectedPlayers: new Map(),
    createdAt: new Date(),
    lastActivity: new Date()
  };
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/bastion/create', (req, res) => {
  const roomCode = generateRoomCode();
  const bastion = createDefaultBastion();
  bastion.roomCode = roomCode;
  bastions.set(roomCode, bastion);
  
  console.log(`Created new bastion with room code: ${roomCode}`);
  res.json({ roomCode, bastionId: bastion.id });
});

app.get('/api/bastion/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  const bastion = bastions.get(roomCode.toUpperCase());
  
  if (!bastion) {
    return res.status(404).json({ error: 'Bastion not found' });
  }
  
  // Convert connectedPlayers Map to array for JSON response
  const bastionData = {
    ...bastion,
    connectedPlayers: Array.from(bastion.connectedPlayers.values())
  };
  
  res.json(bastionData);
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Join bastion room
  socket.on('joinBastion', ({ roomCode, playerName }) => {
    const upperRoomCode = roomCode.toUpperCase();
    const bastion = bastions.get(upperRoomCode);
    
    if (!bastion) {
      socket.emit('error', { message: 'Bastion not found' });
      return;
    }
    
    // Leave any previous rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    
    // Join the bastion room
    socket.join(upperRoomCode);
    socket.roomCode = upperRoomCode;
    socket.playerName = playerName || `Player ${socket.id.slice(-4)}`;
    
    // Add player to connected players
    bastion.connectedPlayers.set(socket.id, {
      id: socket.id,
      name: socket.playerName,
      joinedAt: new Date()
    });
    
    bastion.lastActivity = new Date();
    
    console.log(`Player ${socket.playerName} joined bastion ${upperRoomCode}`);
    
    // Send current bastion state to the joining player
    const bastionData = {
      ...bastion,
      connectedPlayers: Array.from(bastion.connectedPlayers.values())
    };
    socket.emit('bastionState', bastionData);
    
    // Notify all players in the room about the new player
    socket.to(upperRoomCode).emit('playerJoined', {
      id: socket.id,
      name: socket.playerName,
      joinedAt: new Date()
    });
    
    // Send updated connected players list to all players
    io.to(upperRoomCode).emit('connectedPlayersUpdate', Array.from(bastion.connectedPlayers.values()));
  });
  
  // Handle bastion data updates
  socket.on('updateBastion', (updateData) => {
    if (!socket.roomCode) {
      socket.emit('error', { message: 'Not connected to a bastion' });
      return;
    }
    
    const bastion = bastions.get(socket.roomCode);
    if (!bastion) {
      socket.emit('error', { message: 'Bastion not found' });
      return;
    }
    
    // Update bastion data
    Object.assign(bastion, updateData);
    bastion.lastActivity = new Date();
    
    console.log(`Bastion ${socket.roomCode} updated by ${socket.playerName}:`, Object.keys(updateData));
    
    // Broadcast update to all players in the room
    const bastionData = {
      ...bastion,
      connectedPlayers: Array.from(bastion.connectedPlayers.values())
    };
    
    io.to(socket.roomCode).emit('bastionState', bastionData);
  });
  
  // Handle chat messages (optional feature)
  socket.on('chatMessage', (message) => {
    if (!socket.roomCode) return;
    
    const chatData = {
      id: uuidv4(),
      playerId: socket.id,
      playerName: socket.playerName,
      message: message.trim(),
      timestamp: new Date()
    };
    
    io.to(socket.roomCode).emit('chatMessage', chatData);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    if (socket.roomCode) {
      const bastion = bastions.get(socket.roomCode);
      if (bastion) {
        // Remove player from connected players
        bastion.connectedPlayers.delete(socket.id);
        bastion.lastActivity = new Date();
        
        // Notify remaining players
        socket.to(socket.roomCode).emit('playerLeft', {
          id: socket.id,
          name: socket.playerName
        });
        
        // Send updated connected players list
        io.to(socket.roomCode).emit('connectedPlayersUpdate', Array.from(bastion.connectedPlayers.values()));
        
        console.log(`Player ${socket.playerName} left bastion ${socket.roomCode}`);
      }
    }
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

// Cleanup old bastions (remove bastions inactive for more than 24 hours)
setInterval(() => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  for (const [roomCode, bastion] of bastions.entries()) {
    if (now - bastion.lastActivity > maxAge && bastion.connectedPlayers.size === 0) {
      bastions.delete(roomCode);
      console.log(`Cleaned up inactive bastion: ${roomCode}`);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🏰 D&D Bastion Tracker Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time collaboration`);
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
import string
import random
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Socket.io setup
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asgi')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# In-memory storage for room management
rooms = {}  # room_code -> {players: [], bastion_data: {}}

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class BastionData(BaseModel):
    party: List[Dict[str, Any]] = []
    bastionGold: int = 5000
    bastionDefenders: int = 0
    bastionTurn: int = 1
    defensiveWalls: int = 0
    armoryStocked: bool = False
    basicFacilities: List[Dict[str, Any]] = []
    specialFacilities: List[Dict[str, Any]] = []
    connectedPlayers: List[Dict[str, str]] = []

class CreateBastionResponse(BaseModel):
    roomCode: str
    bastionData: BastionData

def generate_room_code() -> str:
    """Generate a unique 6-character room code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms:
            return code

# Basic API routes
@api_router.get("/")
async def root():
    return {"message": "Bastion Tracker API is running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Bastion management endpoints
@api_router.post("/bastion/create", response_model=CreateBastionResponse)
async def create_bastion():
    """Create a new bastion with a unique room code"""
    room_code = generate_room_code()
    bastion_data = BastionData()
    
    rooms[room_code] = {
        "players": [],
        "bastion_data": bastion_data.dict()
    }
    
    # Store in MongoDB for persistence
    await db.bastions.insert_one({
        "room_code": room_code,
        "bastion_data": bastion_data.dict(),
        "created_at": datetime.utcnow()
    })
    
    return CreateBastionResponse(
        roomCode=room_code,
        bastionData=bastion_data
    )

@api_router.get("/bastion/{room_code}")
async def get_bastion(room_code: str):
    """Get bastion data by room code"""
    room_code = room_code.upper()
    
    # Try memory first
    if room_code in rooms:
        return rooms[room_code]["bastion_data"]
    
    # Try database
    bastion_doc = await db.bastions.find_one({"room_code": room_code})
    if bastion_doc:
        # Load into memory
        rooms[room_code] = {
            "players": [],
            "bastion_data": bastion_doc["bastion_data"]
        }
        return bastion_doc["bastion_data"]
    
    raise HTTPException(status_code=404, detail="Bastion not found")

# Socket.io event handlers
@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    logging.info(f"Client {sid} connected")
    await sio.emit('connect_status', {'status': 'connected'}, room=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logging.info(f"Client {sid} disconnected")
    
    # Find and remove player from all rooms
    for room_code, room_data in rooms.items():
        for i, player in enumerate(room_data["players"]):
            if player.get("sid") == sid:
                # Remove player
                removed_player = room_data["players"].pop(i)
                
                # Update connected players list in bastion data
                room_data["bastion_data"]["connectedPlayers"] = [
                    p for p in room_data["bastion_data"]["connectedPlayers"] 
                    if p.get("id") != removed_player.get("id")
                ]
                
                # Notify other players in the room
                await sio.emit('playerLeft', removed_player, room=room_code)
                await sio.emit('connectedPlayersUpdate', 
                             room_data["bastion_data"]["connectedPlayers"], 
                             room=room_code)
                break

@sio.event
async def joinBastion(sid, data):
    """Handle player joining a bastion"""
    try:
        room_code = data['roomCode'].upper()
        player_name = data['playerName']
        
        # Check if room exists
        if room_code not in rooms:
            # Try to load from database
            bastion_doc = await db.bastions.find_one({"room_code": room_code})
            if not bastion_doc:
                await sio.emit('error', {'message': 'Bastion not found'}, room=sid)
                return
            
            # Load room into memory
            rooms[room_code] = {
                "players": [],
                "bastion_data": bastion_doc["bastion_data"]
            }
        
        # Create player object
        player = {
            "id": str(uuid.uuid4()),
            "name": player_name,
            "sid": sid
        }
        
        # Add player to room
        rooms[room_code]["players"].append(player)
        
        # Add player to Socket.io room
        await sio.enter_room(sid, room_code)
        
        # Update connected players in bastion data
        rooms[room_code]["bastion_data"]["connectedPlayers"] = [
            {"id": p["id"], "name": p["name"]} 
            for p in rooms[room_code]["players"]
        ]
        
        # Send current bastion state to the new player
        await sio.emit('bastionState', rooms[room_code]["bastion_data"], room=sid)
        
        # Notify other players about the new player
        await sio.emit('playerJoined', {"id": player["id"], "name": player["name"]}, room=room_code)
        
        # Send updated connected players list to all players in room
        await sio.emit('connectedPlayersUpdate', 
                     rooms[room_code]["bastion_data"]["connectedPlayers"], 
                     room=room_code)
        
        logging.info(f"Player {player_name} joined bastion {room_code}")
        
    except Exception as e:
        logging.error(f"Error in joinBastion: {e}")
        await sio.emit('error', {'message': 'Failed to join bastion'}, room=sid)

@sio.event
async def updateBastion(sid, data):
    """Handle bastion data updates"""
    try:
        # Find which room this player is in
        player_room = None
        for room_code, room_data in rooms.items():
            for player in room_data["players"]:
                if player["sid"] == sid:
                    player_room = room_code
                    break
            if player_room:
                break
        
        if not player_room:
            await sio.emit('error', {'message': 'Player not in any room'}, room=sid)
            return
        
        # Update bastion data
        rooms[player_room]["bastion_data"].update(data)
        
        # Update connected players list to maintain consistency
        rooms[player_room]["bastion_data"]["connectedPlayers"] = [
            {"id": p["id"], "name": p["name"]} 
            for p in rooms[player_room]["players"]
        ]
        
        # Broadcast updated state to all players in the room
        await sio.emit('bastionState', rooms[player_room]["bastion_data"], room=player_room)
        
        # Save to database for persistence
        await db.bastions.update_one(
            {"room_code": player_room},
            {"$set": {"bastion_data": rooms[player_room]["bastion_data"]}}
        )
        
        logging.info(f"Bastion {player_room} updated by player {sid}")
        
    except Exception as e:
        logging.error(f"Error in updateBastion: {e}")
        await sio.emit('error', {'message': 'Failed to update bastion'}, room=sid)

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.io ASGI app after including routes
socket_app = socketio.ASGIApp(sio, app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Bastion Tracker API starting up...")
    
    # Create database indexes
    try:
        await db.bastions.create_index("room_code", unique=True)
        await db.status_checks.create_index("timestamp")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Could not create database indexes: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Clean up on shutdown"""
    client.close()
    logger.info("Database connection closed")

# Use the socket app as the main app for Socket.io support
app = socket_app



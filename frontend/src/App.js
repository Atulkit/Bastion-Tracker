import React, { useState, useEffect } from 'react';
import './App.css';

// Complete facility data based on D&D 2024 rules
const BASIC_FACILITIES = [
  { name: 'Bedroom', description: 'A basic sleeping area' },
  { name: 'Dining Room', description: 'An area for meals and gatherings' },
  { name: 'Parlor', description: 'A comfortable social area' },
  { name: 'Courtyard', description: 'An open area within the bastion' },
  { name: 'Kitchen', description: 'Food preparation area' },
  { name: 'Storage', description: 'Area for storing goods and supplies' }
];

const SPECIAL_FACILITIES = [
  // Level 5 Facilities
  {
    name: 'Arcane Study',
    level: 5,
    prerequisite: 'Ability to use an Arcane Focus or tool as a Spellcasting Focus',
    space: 'Roomy',
    hirelings: 1,
    order: 'Craft',
    description: 'A place of quiet research with desks and bookshelves.',
    charm: 'Arcane Study Charm: Cast Identify without spell slot once per week',
    craftOptions: ['Arcane Focus (7 days, free)', 'Book (7 days, 10 GP)', 'Magic Item - Arcana (level 9+)']
  },
  {
    name: 'Armory',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Trade',
    description: 'Contains mannequins, weapon racks, and armor storage.',
    tradeOptions: ['Stock Armory: 100 GP + 100 GP per Bastion Defender (50% off with Smithy)'],
    effect: 'Stocked armory: Roll d8 instead of d6 for defender losses'
  },
  {
    name: 'Barrack',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Recruit',
    description: 'Sleeping quarters for up to 12 Bastion Defenders.',
    recruitOptions: ['Recruit up to 4 Bastion Defenders (free, 7 days)'],
    enlargement: 'Vast: 2,000 GP, houses 25 defenders'
  },
  {
    name: 'Garden',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Harvest',
    description: 'Choose type: Decorative, Food, Herb, or Poison garden.',
    harvestOptions: {
      'Decorative': '10 bouquets (5 GP each), 10 perfumes, or 10 candles',
      'Food': '100 days of rations',
      'Herb': '10 Healer\'s Kits or 1 Potion of Healing',
      'Poison': '2 vials Antitoxin or 1 vial Basic Poison'
    },
    enlargement: 'Vast: 2,000 GP, equivalent to 2 gardens'
  },
  {
    name: 'Library',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Research',
    description: 'Collection of books with desks and reading chairs.',
    researchOptions: ['Topical Lore: Research any topic, gain 3 accurate pieces of info (7 days)']
  },
  {
    name: 'Sanctuary',
    level: 5,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    space: 'Roomy',
    hirelings: 1,
    order: 'Craft',
    description: 'Icons of your religion with a quiet place for worship.',
    charm: 'Sanctuary Charm: Cast Healing Word without spell slot once per week',
    craftOptions: ['Sacred Focus: Druidic Focus or Holy Symbol (7 days, free)']
  },
  {
    name: 'Smithy',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 2,
    order: 'Craft',
    description: 'Contains forge, anvil, and smithing tools.',
    craftOptions: ['Smith\'s Tools crafting', 'Magic Item - Armaments (level 9+)']
  },
  {
    name: 'Storehouse',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Trade',
    description: 'Cool, dark space for storing trade goods.',
    tradeOptions: ['Buy/sell goods: 500 GP limit (2,000 GP at lvl 9, 5,000 GP at lvl 13)'],
    profit: 'Sell for +10% (+20% lvl 9, +50% lvl 13, +100% lvl 17)'
  },
  {
    name: 'Workshop',
    level: 5,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 3,
    order: 'Craft',
    description: 'Creative space with 6 different Artisan\'s Tools.',
    craftOptions: ['Adventuring Gear with chosen tools', 'Magic Item - Implements (level 9+)'],
    bonus: 'Source of Inspiration: Gain Heroic Inspiration after short rest',
    enlargement: 'Vast: 2,000 GP, +2 hirelings, +3 tools'
  },

  // Level 9 Facilities
  {
    name: 'Gaming Hall',
    level: 9,
    prerequisite: 'None',
    space: 'Vast',
    hirelings: 4,
    order: 'Trade',
    description: 'Recreational activities like chess, cards, dice.',
    tradeOptions: ['Gambling Hall (7 days): Roll d100 for winnings 1d6×10 to 10d6×10 GP']
  },
  {
    name: 'Greenhouse',
    level: 9,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Harvest',
    description: 'Controlled climate for rare plants and fungi.',
    bonus: 'Fruit of Restoration: 3 fruits daily, each gives Lesser Restoration effect',
    harvestOptions: ['Potion of Healing (greater) (7 days)', 'Poison: Assassin\'s Blood, Malice, Pale Tincture, or Truth Serum (7 days)']
  },
  {
    name: 'Laboratory',
    level: 9,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Craft',
    description: 'Alchemical supplies and crafting workspaces.',
    craftOptions: ['Alchemist\'s Supplies crafting', 'Poison: Burnt Othur Fumes, Essence of Ether, or Torpor (7 days, half cost)']
  },
  {
    name: 'Sacristy',
    level: 9,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    space: 'Roomy',
    hirelings: 1,
    order: 'Craft',
    description: 'Preparation and storage for sacred items and vestments.',
    craftOptions: ['Holy Water (7 days, free, +100 GP for +1d8 damage up to 500 GP)', 'Magic Item - Relics'],
    bonus: 'Spell Refreshment: Regain 1 spell slot (level 5 or lower) after short rest'
  },
  {
    name: 'Scriptorium',
    level: 9,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Craft',
    description: 'Desks and writing supplies for document creation.',
    craftOptions: ['Book Replica (7 days, needs blank book)', 'Spell Scroll (Cleric/Wizard spell level 3 or lower)', 'Paperwork (50 copies, 7 days, 1 GP per copy)']
  },
  {
    name: 'Stable',
    level: 9,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Trade',
    description: 'Houses 3 Large animals. Comes with 1 Riding Horse/Camel, 2 Ponies/Mules.',
    tradeOptions: ['Buy/sell mounts at standard cost (7 days)'],
    profit: 'Sell for +20% (+50% lvl 13, +100% lvl 17)',
    bonus: 'Animal Handling advantage after 14 days in facility',
    enlargement: 'Vast: 2,000 GP, houses 6 Large animals'
  },
  {
    name: 'Teleportation Circle',
    level: 9,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Recruit',
    description: 'Permanent teleportation circle inscribed on floor.',
    recruitOptions: ['Spellcaster: Roll die, even = friendly NPC spellcaster arrives for 14 days'],
    spellcasting: 'Cast Wizard spell level 4 or lower (level 8 or lower at level 17+)'
  },
  {
    name: 'Theater',
    level: 9,
    prerequisite: 'None',
    space: 'Vast',
    hirelings: 4,
    order: 'Empower',
    description: 'Stage, backstage, and seating area for small audience.',
    empowerOptions: ['Theatrical Event: 14 days rehearsal + 7+ days performance'],
    bonus: 'Theater die (d6, d8 at lvl 13, d10 at lvl 17) if performance succeeds'
  },
  {
    name: 'Training Area',
    level: 9,
    prerequisite: 'None',
    space: 'Vast',
    hirelings: 4,
    order: 'Empower',
    description: 'Courtyard, gymnasium, or training gauntlet with expert trainer.',
    empowerOptions: ['Training (7 days, 8 hours daily): Battle, Skills, Tools, Unarmed Combat, or Weapon Expert'],
    trainers: 'Choose trainer type: affects benefit gained from training'
  },
  {
    name: 'Trophy Room',
    level: 9,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Research',
    description: 'Collection of mementos, weapons, mounted heads, trinkets.',
    researchOptions: ['Lore: Research topic, gain 3 info pieces (7 days)', 'Trinket Trophy: Roll die, even = find Common magic item (7 days)']
  },

  // Level 13 Facilities
  {
    name: 'Archive',
    level: 13,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Research',
    description: 'Repository of valuable books, maps, scrolls behind locked door.',
    researchOptions: ['Helpful Lore: Hireling gains Legend Lore knowledge (7 days)'],
    referenceBook: 'Choose 1: Arcana, History, Investigation, Nature, or Religion advantage',
    enlargement: 'Vast: 2,000 GP, gain 2 additional reference books'
  },
  {
    name: 'Meditation Chamber',
    level: 13,
    prerequisite: 'None',
    space: 'Cramped',
    hirelings: 1,
    order: 'Empower',
    description: 'Relaxing space for aligning mind, body, and spirit.',
    empowerOptions: ['Inner Peace: Roll twice for next Bastion event, choose result'],
    bonus: 'Fortify Self: 7-day meditation grants advantage on 2 random saving throw types'
  },
  {
    name: 'Menagerie',
    level: 13,
    prerequisite: 'None',
    space: 'Vast',
    hirelings: 2,
    order: 'Recruit',
    description: 'Enclosures for up to 4 Large creatures (or equivalent Small/Medium).',
    recruitOptions: ['Creature: Add beast from table (7 days, various costs)'],
    creatures: 'Ape, Bears, Snakes, Crocodile, Dire Wolf, etc. (50-3,500 GP)',
    bonus: 'Creatures count as Bastion Defenders'
  },
  {
    name: 'Observatory',
    level: 13,
    prerequisite: 'Ability to use a Spellcasting Focus',
    space: 'Roomy',
    hirelings: 1,
    order: 'Empower',
    description: 'Telescope aimed at night sky atop bastion.',
    charm: 'Observatory Charm: Cast Contact Other Plane without spell slot once per week',
    empowerOptions: ['Eldritch Discovery: 7 nights study, odd roll = gain Charm (Darkvision, Heroism, or Vitality)']
  },
  {
    name: 'Pub',
    level: 13,
    prerequisite: 'None',
    space: 'Roomy',
    hirelings: 1,
    order: 'Research',
    description: 'Bar, coffee shop, or tea room with spy network.',
    researchOptions: ['Information Gathering: Locate familiar creature within 50 miles (7 days)'],
    pubSpecial: 'Choose magical beverage: Burden, Spider Kiss, Moonlight, Positive, or Sterner',
    enlargement: 'Vast: 2,000 GP, 2 beverages, +3 server hirelings'
  },
  {
    name: 'Reliquary',
    level: 13,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    space: 'Cramped',
    hirelings: 1,
    order: 'Harvest',
    description: 'Vault holding sacred objects.',
    charm: 'Reliquary Charm: Cast Greater Restoration without spell slot once per week',
    harvestOptions: ['Talisman: Replace spell components up to 1,000 GP value (7 days, reusable)']
  },

  // Level 17 Facilities
  {
    name: 'Demiplane',
    level: 17,
    prerequisite: 'Ability to use an Arcane Focus or tool as a Spellcasting Focus',
    space: 'Vast',
    hirelings: 1,
    order: 'Empower',
    description: 'Door leads to extradimensional stone room.',
    empowerOptions: ['Arcane Resilience: Magical runes give temp HP = 5×level after long rest (7 days)'],
    bonus: 'Fabrication: Create 5 GP nonmagical object once per long rest'
  },
  {
    name: 'Guildhall',
    level: 17,
    prerequisite: 'Expertise in a skill',
    space: 'Vast',
    hirelings: 1,
    order: 'Recruit',
    description: 'Meeting room for your guild (~50 members).',
    recruitOptions: ['Guild Assignment: Send members on special mission'],
    guilds: 'Adventurers, Bakers, Brewers, Masons, Shipbuilders, or Thieves'
  },
  {
    name: 'Sanctum',
    level: 17,
    prerequisite: 'Ability to use a Holy Symbol or Druidic Focus as a Spellcasting Focus',
    space: 'Roomy',
    hirelings: 4,
    order: 'Empower',
    description: 'Place of solace and healing.',
    charm: 'Sanctum Charm: Cast Heal without spell slot once per week',
    empowerOptions: ['Fortifying Rites: Target gains temp HP = your level after long rests (7 days)'],
    bonus: 'Sanctum Recall: Word of Recall always prepared, can target Sanctum'
  },
  {
    name: 'War Room',
    level: 17,
    prerequisite: 'Fighting Style feature or Unarmored Defense feature',
    space: 'Vast',
    hirelings: '2+',
    order: 'Recruit',
    description: 'War planning with loyal Veteran lieutenants.',
    recruitOptions: ['Lieutenant: Add up to 10 total', 'Soldiers: 100 Guards per lieutenant (or 20 mounted)'],
    bonus: 'Lieutenants in bastion reduce attack dice by 1 each'
  }
];

const SPACE_LIMITS = {
  'Cramped': 4,
  'Roomy': 16,
  'Vast': 36
};

const FACILITY_COSTS = {
  'Cramped': { cost: 500, time: 20 },
  'Roomy': { cost: 1000, time: 45 },
  'Vast': { cost: 3000, time: 125 }
};

function App() {
  // Party Management
  const [party, setParty] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [combinedBastion, setCombinedBastion] = useState(false);

  // Single character states (for active character)
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [activeTab, setActiveTab] = useState('party');

  // Load party from localStorage on mount
  useEffect(() => {
    const savedParty = localStorage.getItem('dnd-bastion-party');
    if (savedParty) {
      try {
        const partyData = JSON.parse(savedParty);
        if (Array.isArray(partyData) && partyData.length > 0) {
          setParty(partyData);
          setActiveCharacterId(partyData[0].id);
        }
      } catch (error) {
        console.error('Error loading party data:', error);
        localStorage.removeItem('dnd-bastion-party');
      }
    }
  }, []);

  // Save party to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dnd-bastion-party', JSON.stringify(party));
    } catch (error) {
      console.error('Error saving party data:', error);
    }
  }, [party]);

  // Get active character
  const activeCharacter = party.find(char => char.id === activeCharacterId);

  // Add new character
  const addCharacter = () => {
    if (newCharacterName.trim() && party.length < 6) {
      const newCharacter = {
        id: Date.now(),
        name: newCharacterName.trim(),
        level: 5,
        gold: 1000,
        bastionDefenders: 0,
        bastionTurn: 1,
        basicFacilities: [
          { name: 'Bedroom', space: 'Cramped', id: Date.now() + 1 },
          { name: 'Kitchen', space: 'Roomy', id: Date.now() + 2 }
        ],
        specialFacilities: []
      };
      const updatedParty = [...party, newCharacter];
      setParty(updatedParty);
      setActiveCharacterId(newCharacter.id);
      setNewCharacterName('');
      setShowAddCharacter(false);
      setActiveTab('overview');
    }
  };

  // Remove character
  const removeCharacter = (characterId) => {
    const updatedParty = party.filter(char => char.id !== characterId);
    setParty(updatedParty);
    if (activeCharacterId === characterId) {
      setActiveCharacterId(updatedParty.length > 0 ? updatedParty[0].id : null);
    }
  };

  // Update active character
  const updateActiveCharacter = (updates) => {
    if (!activeCharacterId) return;
    setParty(party.map(char => 
      char.id === activeCharacterId 
        ? { ...char, ...updates }
        : char
    ));
  };

  // Calculate special facility slots based on level
  const getSpecialFacilitySlots = (level) => {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    return 2;
  };

  // Get available special facilities based on level and prerequisites
  const getAvailableSpecialFacilities = () => {
    if (!activeCharacter) return [];
    return SPECIAL_FACILITIES.filter(facility => 
      facility.level <= activeCharacter.level &&
      !activeCharacter.specialFacilities.find(sf => sf.name === facility.name)
    );
  };

  // Add special facility
  const addSpecialFacility = (facility) => {
    if (!activeCharacter) return;
    if (activeCharacter.specialFacilities.length < getSpecialFacilitySlots(activeCharacter.level)) {
      const updatedFacilities = [...activeCharacter.specialFacilities, {
        ...facility,
        id: Date.now()
      }];
      updateActiveCharacter({ specialFacilities: updatedFacilities });
      setShowAddFacility(false);
    }
  };

  // Remove special facility
  const removeSpecialFacility = (id) => {
    if (!activeCharacter) return;
    const updatedFacilities = activeCharacter.specialFacilities.filter(f => f.id !== id);
    updateActiveCharacter({ specialFacilities: updatedFacilities });
  };

  // Add basic facility
  const addBasicFacility = (facilityName, space) => {
    if (!activeCharacter) return;
    const cost = FACILITY_COSTS[space].cost;
    if (activeCharacter.gold >= cost) {
      const updatedBasicFacilities = [...activeCharacter.basicFacilities, {
        name: facilityName,
        space: space,
        id: Date.now()
      }];
      updateActiveCharacter({ 
        basicFacilities: updatedBasicFacilities,
        gold: activeCharacter.gold - cost
      });
    }
  };

  // Remove basic facility
  const removeBasicFacility = (id) => {
    if (!activeCharacter) return;
    const updatedBasicFacilities = activeCharacter.basicFacilities.filter(f => f.id !== id);
    updateActiveCharacter({ basicFacilities: updatedBasicFacilities });
  };

  // Calculate party totals for combined view
  const getPartyTotals = () => {
    return party.reduce((totals, char) => ({
      totalGold: totals.totalGold + char.gold,
      totalDefenders: totals.totalDefenders + char.bastionDefenders,
      totalFacilities: totals.totalFacilities + char.basicFacilities.length + char.specialFacilities.length,
      totalHirelings: totals.totalHirelings + char.basicFacilities.length + 
        char.specialFacilities.reduce((sum, f) => sum + (typeof f.hirelings === 'number' ? f.hirelings : 1), 0),
      totalSquares: totals.totalSquares + 
        [...char.basicFacilities, ...char.specialFacilities].reduce((sum, f) => sum + SPACE_LIMITS[f.space], 0)
    }), {
      totalGold: 0,
      totalDefenders: 0,
      totalFacilities: 0,
      totalHirelings: 0,
      totalSquares: 0
    });
  };

  if (party.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">D&D 2024 Bastion Tracker</h1>
          <p className="text-gray-600 mb-6 text-center">Create your first character to start managing bastions</p>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Character Name"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
            />
            <button
              onClick={addCharacter}
              disabled={!newCharacterName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Create Character
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Supports up to 6 characters</p>
            <p>Each character gets their own bastion at level 5</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">D&D 2024 Bastion Tracker</h1>
          <p className="text-gray-600">Party Management • {party.length}/6 Characters</p>
        </header>

        {/* Character Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700">Active Character:</span>
            {party.map((character) => (
              <button
                key={character.id}
                onClick={() => {
                  setActiveCharacterId(character.id);
                  if (activeTab === 'party') setActiveTab('overview');
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeCharacterId === character.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {character.name} (Lvl {character.level})
              </button>
            ))}
            {party.length < 6 && (
              <button
                onClick={() => setShowAddCharacter(true)}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium"
              >
                + Add Character
              </button>
            )}
          </div>
          
          {activeCharacter && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Playing as: <span className="font-medium text-gray-900">{activeCharacter.name}</span>
              </span>
              <button
                onClick={() => removeCharacter(activeCharacter.id)}
                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
              >
                Remove Character
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mb-6">
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            {['party', 'overview', 'facilities', 'resources', 'turns'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={tab !== 'party' && !activeCharacter}
                className={`px-4 py-2 rounded-md capitalize font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 disabled:text-gray-400'
                }`}
              >
                {tab === 'party' ? 'Party Overview' : tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Party Overview Tab */}
        {activeTab === 'party' && (
          <div className="space-y-6">
            {/* Party Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Party Summary</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={combinedBastion}
                    onChange={(e) => setCombinedBastion(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Combined Bastion View</span>
                </label>
              </div>
              
              {combinedBastion ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(() => {
                    const totals = getPartyTotals();
                    return (
                      <>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{totals.totalGold}</p>
                          <p className="text-sm text-gray-600">Total Gold</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{totals.totalDefenders}</p>
                          <p className="text-sm text-gray-600">Total Defenders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{totals.totalFacilities}</p>
                          <p className="text-sm text-gray-600">Total Facilities</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{totals.totalHirelings}</p>
                          <p className="text-sm text-gray-600">Total Hirelings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-600">{totals.totalSquares}</p>
                          <p className="text-sm text-gray-600">Total Squares</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {party.map((character) => (
                    <div key={character.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-lg">{character.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Level {character.level}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Turn {character.bastionTurn}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Gold:</span>
                              <span className="font-medium ml-1">{character.gold} GP</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Defenders:</span>
                              <span className="font-medium ml-1">{character.bastionDefenders}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Facilities:</span>
                              <span className="font-medium ml-1">
                                {character.specialFacilities.length}/{getSpecialFacilitySlots(character.level)} Special,{' '}
                                {character.basicFacilities.length} Basic
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Hirelings:</span>
                              <span className="font-medium ml-1">
                                {character.basicFacilities.length + 
                                 character.specialFacilities.reduce((sum, f) => sum + (typeof f.hirelings === 'number' ? f.hirelings : 1), 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Space:</span>
                              <span className="font-medium ml-1">
                                {[...character.basicFacilities, ...character.specialFacilities]
                                  .reduce((sum, f) => sum + SPACE_LIMITS[f.space], 0)} sq
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveCharacterId(character.id);
                            setActiveTab('overview');
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Combined Bastion Rules */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Combined Bastion Rules</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Multiple characters can combine bastions into a single structure</p>
                <p>• Each bastion retains its own facilities, hirelings, and orders</p>
                <p>• Bastion Defenders can be shared between combined bastions during attacks</p>
                <p>• Each character still issues orders to their own facilities independently</p>
              </div>
            </div>
          </div>
        )}

        {/* Individual Character Tabs (only if activeCharacter exists) */}
        {activeCharacter && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Character Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">{activeCharacter.name}'s Bastion</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Character Level</label>
                  <select
                    value={activeCharacter.level}
                    onChange={(e) => updateActiveCharacter({ level: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value={5}>Level 5</option>
                    <option value={9}>Level 9</option>
                    <option value={13}>Level 13</option>
                    <option value={17}>Level 17</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gold (GP)</label>
                  <input
                    type="number"
                    value={activeCharacter.gold}
                    onChange={(e) => updateActiveCharacter({ gold: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bastion Defenders</label>
                  <input
                    type="number"
                    value={activeCharacter.bastionDefenders}
                    onChange={(e) => updateActiveCharacter({ bastionDefenders: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bastion Turn</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={activeCharacter.bastionTurn}
                      onChange={(e) => updateActiveCharacter({ bastionTurn: parseInt(e.target.value) || 1 })}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      onClick={() => updateActiveCharacter({ bastionTurn: activeCharacter.bastionTurn + 1 })}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bastion Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Bastion Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Special Facility Slots:</span>
                    <span className="font-medium">{activeCharacter.specialFacilities.length} / {getSpecialFacilitySlots(activeCharacter.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Facilities:</span>
                    <span className="font-medium">{activeCharacter.basicFacilities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hirelings:</span>
                    <span className="font-medium">
                      {activeCharacter.basicFacilities.length + activeCharacter.specialFacilities.reduce((sum, f) => sum + (typeof f.hirelings === 'number' ? f.hirelings : 1), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Space Used:</span>
                    <span className="font-medium">
                      {[...activeCharacter.basicFacilities, ...activeCharacter.specialFacilities].reduce((sum, f) => sum + SPACE_LIMITS[f.space], 0)} squares
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddFacility(true)}
                    disabled={activeCharacter.specialFacilities.length >= getSpecialFacilitySlots(activeCharacter.level)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add Special Facility ({activeCharacter.specialFacilities.length}/{getSpecialFacilitySlots(activeCharacter.level)})
                  </button>
                  <button
                    onClick={() => setActiveTab('turns')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Advance Bastion Turn
                  </button>
                  <button
                    onClick={() => setActiveTab('facilities')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Manage Facilities
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facilities Tab */}
        {activeCharacter && activeTab === 'facilities' && (
          <div className="space-y-6">
            {/* Special Facilities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Special Facilities ({activeCharacter.specialFacilities.length}/{getSpecialFacilitySlots(activeCharacter.level)})</h3>
                <button
                  onClick={() => setShowAddFacility(true)}
                  disabled={activeCharacter.specialFacilities.length >= getSpecialFacilitySlots(activeCharacter.level)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Add Facility
                </button>
              </div>
              
              {activeCharacter.specialFacilities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No special facilities added yet</p>
              ) : (
                <div className="space-y-3">
                  {activeCharacter.specialFacilities.map((facility) => (
                    <div key={facility.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-lg">{facility.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Level {facility.level}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {facility.space}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {facility.order}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{facility.description}</p>
                          {facility.prerequisite !== 'None' && (
                            <p className="text-orange-600 text-xs mb-2">
                              <span className="font-medium">Prerequisite:</span> {facility.prerequisite}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Hirelings: {facility.hirelings} | Space: {SPACE_LIMITS[facility.space]} squares
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedFacility(facility)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => removeSpecialFacility(facility.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Facilities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Facilities ({activeCharacter.basicFacilities.length})</h3>
              
              <div className="space-y-3 mb-4">
                {activeCharacter.basicFacilities.map((facility) => (
                  <div key={facility.id} className="flex justify-between items-center border rounded-lg p-3">
                    <div>
                      <span className="font-medium">{facility.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({facility.space} - {SPACE_LIMITS[facility.space]} squares)</span>
                    </div>
                    <button
                      onClick={() => removeBasicFacility(facility.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Add Basic Facility</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {BASIC_FACILITIES.map((facility) => (
                    <div key={facility.name} className="border rounded p-2">
                      <h5 className="font-medium text-sm">{facility.name}</h5>
                      <p className="text-xs text-gray-600 mb-2">{facility.description}</p>
                      <div className="space-y-1">
                        {Object.entries(FACILITY_COSTS).map(([space, {cost, time}]) => (
                          <button
                            key={space}
                            onClick={() => addBasicFacility(facility.name, space)}
                            disabled={activeCharacter.gold < cost}
                            className="w-full text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {space}: {cost} GP, {time} days
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeCharacter && activeTab === 'resources' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">{activeCharacter.name}'s Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Financials</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Gold:</span>
                    <span className="font-medium">{activeCharacter.gold} GP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facility Maintenance:</span>
                    <span className="text-green-600">Covered by income</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Personnel</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bastion Defenders:</span>
                    <span className="font-medium">{activeCharacter.bastionDefenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Hirelings:</span>
                    <span className="font-medium">
                      {activeCharacter.basicFacilities.length + activeCharacter.specialFacilities.reduce((sum, f) => sum + (typeof f.hirelings === 'number' ? f.hirelings : 1), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Space Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Squares:</span>
                    <span className="font-medium">
                      {[...activeCharacter.basicFacilities, ...activeCharacter.specialFacilities].reduce((sum, f) => sum + SPACE_LIMITS[f.space], 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facilities:</span>
                    <span className="font-medium">{activeCharacter.basicFacilities.length + activeCharacter.specialFacilities.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Turns Tab */}
        {activeCharacter && activeTab === 'turns' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">{activeCharacter.name}'s Bastion Turn Management</h3>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Current Bastion Turn: {activeCharacter.bastionTurn}</h4>
                <p className="text-blue-700 text-sm">
                  Bastion turns occur every 7 days of in-game time. Issue orders to your special facilities or use the Maintain order.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Available Orders</h4>
                  <div className="space-y-2">
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Craft</h5>
                      <p className="text-xs text-gray-600">Create items in facilities with crafting capabilities</p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Empower</h5>
                      <p className="text-xs text-gray-600">Gain temporary empowerments from certain facilities</p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Harvest</h5>
                      <p className="text-xs text-gray-600">Gather resources from gardens and similar facilities</p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Maintain</h5>
                      <p className="text-xs text-gray-600">Focus on bastion upkeep, triggers event roll</p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Recruit</h5>
                      <p className="text-xs text-gray-600">Add defenders, creatures, or specialists</p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Research</h5>
                      <p className="text-xs text-gray-600">Gather information and lore</p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Trade</h5>
                      <p className="text-xs text-gray-600">Buy, sell, or manage commercial activities</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Turn Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => updateActiveCharacter({ bastionTurn: activeCharacter.bastionTurn + 1 })}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Advance to Turn {activeCharacter.bastionTurn + 1}
                    </button>
                    <button
                      onClick={() => {
                        // Roll d100 for Bastion Event
                        const roll = Math.floor(Math.random() * 100) + 1;
                        let event = "All Is Well";
                        if (roll >= 51 && roll <= 55) event = "Attack";
                        else if (roll >= 56 && roll <= 58) event = "Criminal Hireling";
                        else if (roll >= 59 && roll <= 63) event = "Extraordinary Opportunity";
                        else if (roll >= 64 && roll <= 72) event = "Friendly Visitors";
                        else if (roll >= 73 && roll <= 76) event = "Guest";
                        else if (roll >= 77 && roll <= 79) event = "Lost Hirelings";
                        else if (roll >= 80 && roll <= 83) event = "Magical Discovery";
                        else if (roll >= 84 && roll <= 91) event = "Refugees";
                        else if (roll >= 92 && roll <= 98) event = "Request for Aid";
                        else if (roll >= 99) event = "Treasure";
                        
                        alert(`${activeCharacter.name}'s Bastion Event (d100: ${roll}): ${event}\n\nConsult the Bastion Events table in your DM's Guide for details.`);
                      }}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Roll Bastion Event (Maintain Order)
                    </button>
                    <div className="text-xs text-gray-600 mt-2">
                      <p><strong>Note:</strong> Events occur when using the Maintain order. Roll d100 and consult your DM's Guide for event details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Character Modal */}
        {showAddCharacter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add New Character</h3>
                  <button
                    onClick={() => setShowAddCharacter(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Character Name"
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddCharacter(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addCharacter}
                      disabled={!newCharacterName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Add Character
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Facility Modal */}
        {showAddFacility && activeCharacter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add Special Facility</h3>
                  <button
                    onClick={() => setShowAddFacility(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  {getAvailableSpecialFacilities().map((facility) => (
                    <div key={facility.name} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{facility.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Level {facility.level}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {facility.space}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{facility.description}</p>
                          {facility.prerequisite !== 'None' && (
                            <p className="text-xs text-orange-600">
                              <span className="font-medium">Prerequisite:</span> {facility.prerequisite}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => addSpecialFacility(facility)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facility Details Modal */}
        {selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{selectedFacility.name}</h3>
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 mb-2">{selectedFacility.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Level {selectedFacility.level}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {selectedFacility.space} ({SPACE_LIMITS[selectedFacility.space]} squares)
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {selectedFacility.order} Order
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {selectedFacility.hirelings} Hireling{selectedFacility.hirelings > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {selectedFacility.prerequisite !== 'None' && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <p className="text-sm text-orange-800">
                        <span className="font-medium">Prerequisite:</span> {selectedFacility.prerequisite}
                      </p>
                    </div>
                  )}

                  {selectedFacility.charm && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Charm:</span> {selectedFacility.charm}
                      </p>
                    </div>
                  )}

                  {selectedFacility.craftOptions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Craft Options:</h4>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        {selectedFacility.craftOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedFacility.tradeOptions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Trade Options:</h4>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        {selectedFacility.tradeOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedFacility.recruitOptions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recruit Options:</h4>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        {selectedFacility.recruitOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedFacility.harvestOptions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Harvest Options:</h4>
                      {typeof selectedFacility.harvestOptions === 'object' ? (
                        <ul className="text-sm text-gray-700 space-y-1">
                          {Object.entries(selectedFacility.harvestOptions).map(([type, result]) => (
                            <li key={type}><span className="font-medium">{type}:</span> {result}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                          {selectedFacility.harvestOptions.map((option, idx) => (
                            <li key={idx}>{option}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {selectedFacility.researchOptions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Research Options:</h4>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        {selectedFacility.researchOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedFacility.empowerOptions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Empower Options:</h4>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        {selectedFacility.empowerOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedFacility.bonus && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Special Benefit:</span> {selectedFacility.bonus}
                      </p>
                    </div>
                  )}

                  {selectedFacility.enlargement && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Enlargement:</span> {selectedFacility.enlargement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
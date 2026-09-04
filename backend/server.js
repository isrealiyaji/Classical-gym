import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'gym-data.json');

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createSeedData = () => ({
  members: [
    {
      id: 'M-1001',
      name: 'Alicia Thompson',
      email: 'alicia@example.com',
      phone: '+1 555 101 3344',
      plan: 'Premium',
      joined: '2025-01-18',
      status: 'active',
      goal: 'Strength transformation',
    },
    {
      id: 'M-1002',
      name: 'Marcus Hill',
      email: 'marcus@example.com',
      phone: '+1 555 321 8765',
      plan: 'Elite',
      joined: '2025-02-08',
      status: 'active',
      goal: 'Body recomposition',
    },

    {
      id: 'M-1003',
      name: 'Sofia Nguyen',
      email: 'sofia@example.com',
      phone: '+1 555 420 4531',
      plan: 'Starter',
      joined: '2025-03-22',
      status: 'paused',
      goal: 'Muscle endurance',
    },
  ],
  trainers: [
    {
      id: 'T-5001',
      name: 'Coach Jordan',
      specialty: 'Strength & HIIT',
      experience: '8 years',
      rating: 4.9,
    },
    {
      id: 'T-5002',
      name: 'Coach Maya',
      specialty: 'Pilates & Mobility',
      experience: '6 years',
      rating: 4.8,
    },
    {
      id: 'T-5003',
      name: 'Coach Luis',
      specialty: 'Athletic Conditioning',
      experience: '7 years',
      rating: 4.9,
    },
  ],
  classes: [
    { id: 'C-2001', name: 'Power Lift', time: '06:30 AM', day: 'Monday', coach: 'Coach Jordan', capacity: 18, enrolled: 14 },
    { id: 'C-2002', name: 'Spin Blast', time: '12:00 PM', day: 'Wednesday', coach: 'Coach Maya', capacity: 20, enrolled: 17 },
    { id: 'C-2003', name: 'Bootcamp Circuit', time: '06:00 PM', day: 'Friday', coach: 'Coach Luis', capacity: 22, enrolled: 20 },
    { id: 'C-2004', name: 'Mobility Flow', time: '07:15 AM', day: 'Saturday', coach: 'Coach Maya', capacity: 16, enrolled: 11 },
  ],
  plans: [
    { id: 'P-3001', name: 'Starter', price: 39, description: 'Access to gym floor + one class per week', features: ['Gym access', '1 class per week', 'Locker room'] },
    { id: 'P-3002', name: 'Premium', price: 69, description: 'Unlimited access plus personal training perks', features: ['Unlimited classes', '2 PT sessions/month', 'Nutrition guidance'] },
    { id: 'P-3003', name: 'Elite', price: 109, description: 'Priority support for serious performance goals', features: ['Unlimited coaching', 'Priority booking', 'Body analysis'] },
  ],
  bookings: [
    { id: 'B-4001', memberId: 'M-1001', classId: 'C-2001', memberName: 'Alicia Thompson', className: 'Power Lift', status: 'confirmed' },
    { id: 'B-4002', memberId: 'M-1002', classId: 'C-2003', memberName: 'Marcus Hill', className: 'Bootcamp Circuit', status: 'confirmed' },
  ],
  attendance: [
    { id: 'A-7001', memberName: 'Alicia Thompson', date: '2026-08-27', checkIn: '06:42 AM' },
    { id: 'A-7002', memberName: 'Marcus Hill', date: '2026-08-27', checkIn: '07:05 AM' },
  ],
});

const ensureDataFile = () => {
  const storeDir = path.dirname(DATA_FILE);

  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(createSeedData(), null, 2));
  }
};

const readStore = () => {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
};

const writeStore = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Classical Gym',
    message: 'Gym API is running successfully.',
  });
});

app.get('/api/dashboard/summary', (req, res) => {
  const store = readStore();
  const totalMembers = store.members.length;
  const activeMembers = store.members.filter((member) => member.status === 'active').length;
  const revenue = store.plans.reduce((sum, plan) => sum + plan.price, 0);

  res.json({
    totalMembers,
    activeMembers,
    totalTrainers: store.trainers.length,
    totalClasses: store.classes.length,
    upcomingBookings: store.bookings.length,
    attendanceToday: store.attendance.length,
    monthlyRevenue: revenue * 12,
  });
});

app.get('/api/members', (req, res) => {
  const data = readStore();
  res.json(data.members);
});

app.post('/api/members', (req, res) => {
  const { name, email, phone, plan, goal } = req.body;

  if (!name || !email || !plan) {
    return res.status(400).json({ message: 'Name, email, and plan are required.' });
  }

  const store = readStore();
  const newMember = {
    id: generateId('M'),
    name,
    email,
    phone: phone || 'Not provided',
    plan,
    joined: new Date().toISOString().slice(0, 10),
    status: 'active',
    goal: goal || 'General fitness',
  };

  store.members.unshift(newMember);
  writeStore(store);
  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const memberIndex = store.members.findIndex((member) => member.id === id);

  if (memberIndex === -1) {
    return res.status(404).json({ message: 'Member not found.' });
  }

  store.members[memberIndex] = {
    ...store.members[memberIndex],
    ...req.body,
  };

  writeStore(store);
  res.json(store.members[memberIndex]);
});

app.delete('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const initialLength = store.members.length;
  store.members = store.members.filter((member) => member.id !== id);

  if (store.members.length === initialLength) {
    return res.status(404).json({ message: 'Member not found.' });
  }

  writeStore(store);
  res.json({ message: 'Member deleted successfully.' });
});

app.get('/api/trainers', (req, res) => {
  const data = readStore();
  res.json(data.trainers);
});

app.post('/api/trainers', (req, res) => {
  const { name, specialty, experience, rating } = req.body;

  if (!name || !specialty) {
    return res.status(400).json({ message: 'Trainer name and specialty are required.' });
  }

  const store = readStore();
  const newTrainer = {
    id: generateId('T'),
    name,
    specialty,
    experience: experience || 'New coach',
    rating: rating || 4.8,
  };

  store.trainers.push(newTrainer);
  writeStore(store);
  res.status(201).json(newTrainer);
});

app.get('/api/classes', (req, res) => {
  const data = readStore();
  res.json(data.classes);
});

app.post('/api/classes', (req, res) => {
  const { name, time, day, coach, capacity } = req.body;

  if (!name || !time || !day || !coach) {
    return res.status(400).json({ message: 'Class name, time, day, and coach are required.' });
  }

  const store = readStore();
  const newClass = {
    id: generateId('C'),
    name,
    time,
    day,
    coach,
    capacity: capacity || 15,
    enrolled: 0,
  };

  store.classes.push(newClass);
  writeStore(store);
  res.status(201).json(newClass);
});

app.get('/api/plans', (req, res) => {
  const data = readStore();
  res.json(data.plans);
});

app.post('/api/plans', (req, res) => {
  const { name, price, description, features } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Plan name and price are required.' });
  }

  const store = readStore();
  const newPlan = {
    id: generateId('P'),
    name,
    price: Number(price),
    description: description || 'New membership plan',
    features: features || [],
  };

  store.plans.push(newPlan);
  writeStore(store);
  res.status(201).json(newPlan);
});

app.get('/api/bookings', (req, res) => {
  const data = readStore();
  res.json(data.bookings);
});

app.post('/api/bookings', (req, res) => {
  const { memberId, classId, memberName, className } = req.body;

  if (!memberId || !classId) {
    return res.status(400).json({ message: 'Member ID and class ID are required.' });
  }

  const store = readStore();
  const booking = {
    id: generateId('B'),
    memberId,
    classId,
    memberName: memberName || 'Guest Member',
    className: className || 'Gym Class',
    status: 'confirmed',
  };

  store.bookings.push(booking);
  writeStore(store);
  res.status(201).json(booking);
});

app.get('/api/attendance', (req, res) => {
  const data = readStore();
  res.json(data.attendance);
});

app.post('/api/attendance', (req, res) => {
  const { memberName, date, checkIn } = req.body;

  if (!memberName || !date || !checkIn) {
    return res.status(400).json({ message: 'Member name, date, and check-in time are required.' });
  }

  const store = readStore();
  const entry = {
    id: generateId('A'),
    memberName,
    date,
    checkIn,
  };

  store.attendance.unshift(entry);
  writeStore(store);
  res.status(201).json(entry);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Classical Gym API is running on http://localhost:${PORT}`);
});

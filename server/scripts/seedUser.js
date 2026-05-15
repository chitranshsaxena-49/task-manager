import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

async function seedUser({ mongoUri, email, password, name, title, role, isAdmin }) {
    try {
        const uri = mongoUri || process.env.MONGODB_URI;
        if (!uri) {
            console.error('No MONGODB_URI provided.');
            process.exit(1);
        }

        await mongoose.connect(uri, { dbName: process.env.DB_NAME || undefined });
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email }).exec();
        if (existing) {
            console.log(`User with email ${email} already exists (id=${existing._id}). Exiting.`);
            process.exit(0);
        }

        const user = new User({ name, title, role, email, password, isAdmin });
        await user.save();

        console.log('User created:', { id: user._id.toString(), email: user.email, isAdmin: user.isAdmin });
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding user:', err);
        try { await mongoose.disconnect(); } catch (e) { }
        process.exit(1);
    }
}

// Basic CLI parsing
const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
        const k = a.replace(/^--/, '');
        const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
        args[k] = v;
        if (v !== true) i++;
    }
}

// Resolve inputs with sensible environment fallbacks. Require a password to
// avoid committing or using weak defaults accidentally.
const email = args.email || process.env.SEED_EMAIL || 'admin2@taskmanager.local';
const password = args.password || process.env.SEED_PASSWORD || null;
const name = args.name || process.env.SEED_NAME || 'Admin Two';
const title = args.title || process.env.SEED_TITLE || 'Administrator';
const role = args.role || process.env.SEED_ROLE || 'admin';
const isAdmin = args.isAdmin ? String(args.isAdmin).toLowerCase() === 'true' : false;
const mongoUri = args.mongo || process.env.MONGODB_URI;

if (!password) {
    console.error('Seed password is required. Provide --password or set SEED_PASSWORD environment variable.');
    process.exit(1);
}

seedUser({ mongoUri, email, password, name, title, role, isAdmin });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const { Pool } = pg;
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database Configuration
if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL is not set. Database features will fail.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Force SSL for Render
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware to log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 1. Database Initialization
const initDb = async () => {
  try {
    const client = await pool.connect();
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL
      )
    `);
    // Create Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        email TEXT PRIMARY KEY REFERENCES users(email),
        name TEXT,
        bio TEXT,
        avatar_url TEXT,
        mood_vibe TEXT,
        mood_color TEXT,
        now_playing_title TEXT,
        now_playing_artist TEXT,
        now_playing_album_art TEXT,
        now_playing_is_playing BOOLEAN,
        photo_widget_text TEXT,
        links JSONB
      )
    `);
    client.release();
    console.log("✅ PostgreSQL Tables Synced & Connected 🚀");
  } catch (err) {
    console.error("❌ DB Init Error:", err.message);
  }
};

initDb();

// Test Route
app.get('/api/db-test', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', time: dbRes.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ping', (req, res) => res.send('pong'));

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    await pool.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3)', [email, password, name]);
    
    // Generate unique ID (username)
    const baseUsername = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Ensure username is unique (simple retry logic)
    let usernameExists = true;
    let attempts = 0;
    while (usernameExists && attempts < 5) { // Limit attempts to prevent infinite loop
      const existingUsername = await pool.query('SELECT 1 FROM profiles WHERE username = $1', [username]);
      if (existingUsername.rows.length === 0) {
        usernameExists = false;
      } else {
        username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`;
        attempts++;
      }
    }
    if (usernameExists) {
      // Fallback if unique username couldn't be generated
      username = `${baseUsername}-${Date.now().toString().slice(-5)}`;
    }

    // Initialize profile
    const defaultProfile = {
      name,
      username, // Add username here
      bio: "New to VibeCheck! 👋",
      avatar_url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      mood_vibe: "Fresh Start ✨",
      mood_color: "#8b5cf6",
      now_playing_title: "No music playing",
      now_playing_artist: "---",
      now_playing_album_art: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      now_playing_is_playing: false,
      photo_widget_text: "Current Setup Vibe",
      links: JSON.stringify([])
    };

    await pool.query(`
      INSERT INTO profiles (
        email, name, username, bio, avatar_url, mood_vibe, mood_color, 
        now_playing_title, now_playing_artist, now_playing_album_art, 
        now_playing_is_playing, photo_widget_text, links
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      email, defaultProfile.name, defaultProfile.username, defaultProfile.bio, defaultProfile.avatar_url,
      defaultProfile.mood_vibe, defaultProfile.mood_color, defaultProfile.now_playing_title,
      defaultProfile.now_playing_artist, defaultProfile.now_playing_album_art,
      defaultProfile.now_playing_is_playing, defaultProfile.photo_widget_text, defaultProfile.links
    ]);

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const profileRes = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    const p = profileRes.rows[0];

    // Map DB fields back to sync with local vibe-config structure
    const profile = {
      profile: {
        name: p.name,
        bio: p.bio,
        avatarUrl: p.avatar_url
      },
      mood: { vibe: p.mood_vibe, color: p.mood_color },
      nowPlaying: { 
        title: p.now_playing_title, 
        artist: p.now_playing_artist, 
        albumArt: p.now_playing_album_art, 
        isPlaying: p.now_playing_is_playing 
      },
      photoWidgetText: p.photo_widget_text,
      links: Array.isArray(p.links) ? p.links : (typeof p.links === 'string' ? JSON.parse(p.links) : [])
    };

    res.json({ user: { email, name: userRes.rows[0].name }, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile: Update
app.post('/api/profile/update', async (req, res) => {
  const { email, profileData } = req.body;
  try {
    const { profile, mood, nowPlaying, photoWidgetText, links } = profileData;
    
    await pool.query(`
      UPDATE profiles SET 
        name = $1, bio = $2, avatar_url = $3, 
        mood_vibe = $4, mood_color = $5, 
        now_playing_title = $6, now_playing_artist = $7, now_playing_album_art = $8, 
        now_playing_is_playing = $9, photo_widget_text = $10,
        links = $11
      WHERE email = $12
    `, [
      profile.name, profile.bio, profile.avatarUrl,
      mood.vibe, mood.color,
      nowPlaying.title, nowPlaying.artist, nowPlaying.albumArt,
      nowPlaying.isPlaying, photoWidgetText, JSON.stringify(links), email
    ]);

    // Fetch updated profile to return
    const updated = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    const p = updated.rows[0];
    const finalProfile = {
      profile: {
        name: p.name,
        bio: p.bio,
        avatarUrl: p.avatar_url
      },
      mood: { vibe: p.mood_vibe, color: p.mood_color },
      nowPlaying: { title: p.now_playing_title, artist: p.now_playing_artist, albumArt: p.now_playing_album_art, isPlaying: p.now_playing_is_playing },
      photoWidgetText: p.photo_widget_text,
      links: Array.isArray(p.links) ? p.links : (typeof p.links === 'string' ? JSON.parse(p.links) : [])
    };

    res.json({ profile: finalProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Serve Frontend (Unified Hosting)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all to serve index.html for SPA routing
  app.use((req, res, next) => {
    const isHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (req.method === 'GET' && !req.path.startsWith('/api') && isHtml) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`VibeCheck Full-Stack running on port ${PORT}`);
});

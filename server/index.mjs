import express from 'express';
// VibeCheck Server V1.2.1 - Social Update
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const { Pool } = pg;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust Error Logging for Production
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

console.log("🚀 Server Starting...");

// Ensure stories directory exists
const uploadDir = path.join(__dirname, 'public', 'stories');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../dist')));

// Middleware to log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 1. Database Initialization
const initDb = async () => {
  console.log("⏳ Initializing Database...");
  try {
    const client = await pool.connect();
    console.log("🔗 Connected to Pool");
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
        links JSONB,
        username TEXT UNIQUE,
        music_url TEXT,
        theme_name TEXT DEFAULT 'Cyberpunk'
      )
    `);

    // Migration for existing tables
    try {
      await client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS music_url TEXT');
      await client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_name TEXT DEFAULT \'Cyberpunk\'');
    } catch (migErr) {
      console.warn("⚠️ Migration Note (schema updates):", migErr.message);
    }

    // Create Stories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        email TEXT REFERENCES users(email),
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Create Posts table (Instagram-style)
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        email TEXT REFERENCES users(email),
        image_url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Followers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS followers (
        id SERIAL PRIMARY KEY,
        follower_email TEXT REFERENCES users(email),
        following_email TEXT REFERENCES users(email),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_email, following_email)
      )
    `);

    // Create Likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        email TEXT REFERENCES users(email),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, email)
      )
    `);

    // Create Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        email TEXT REFERENCES users(email),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Vibes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vibes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        email TEXT REFERENCES users(email),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, email)
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
    
    // ENSURE username column exists (Migration)
    await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE');

    // Backfill: Ensure all existing users have a username
    const missing = await pool.query('SELECT email, name FROM profiles WHERE username IS NULL');
    for (const user of missing.rows) {
      const base = user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const unique = `${base}-${Math.floor(10000000 + Math.random() * 90000000)}`; // 8 NUMERIC digits
      await pool.query('UPDATE profiles SET username = $1 WHERE email = $2', [unique, user.email]);
    }

    // Generate unique ID (username) - 8 NUMERIC DIGITS
    const baseUsername = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let username = `${baseUsername}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    // Ensure username is unique (simple retry logic)
    let usernameExists = true;
    let attempts = 0;
    while (usernameExists && attempts < 5) {
      const existingUsername = await pool.query('SELECT 1 FROM profiles WHERE username = $1', [username]);
      if (existingUsername.rows.length === 0) {
        usernameExists = false;
      } else {
        username = `${baseUsername}-${Math.floor(10000000 + Math.random() * 90000000)}`;
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
        avatarUrl: p.avatar_url,
        username: p.username
      },
      mood: { vibe: p.mood_vibe, color: p.mood_color },
      nowPlaying: { 
        title: p.now_playing_title, 
        artist: p.now_playing_artist, 
        albumArt: p.now_playing_album_art, 
        isPlaying: p.now_playing_is_playing 
      },
      photoWidgetText: p.photo_widget_text,
      links: Array.isArray(p.links) ? p.links : (typeof p.links === 'string' ? JSON.parse(p.links) : []),
      musicUrl: p.music_url || '',
      theme_name: p.theme_name || 'Cyberpunk',
      theme_name: p.theme_name || 'Cyberpunk'
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
        links = $11, music_url = $12, theme_name = $13
      WHERE email = $14
    `, [
      profile.name, profile.bio, profile.avatarUrl,
      mood.vibe, mood.color,
      nowPlaying.title, nowPlaying.artist, nowPlaying.albumArt,
      nowPlaying.isPlaying, photoWidgetText, JSON.stringify(links), 
      profileData.musicUrl || '', 
      profileData.theme_name || 'Cyberpunk',
      email
    ]);

    // Fetch updated profile to return
    const updated = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    const p = updated.rows[0];
    const finalProfile = {
      profile: {
        name: p.name,
        bio: p.bio,
        avatarUrl: p.avatar_url,
        username: p.username
      },
      mood: { vibe: p.mood_vibe, color: p.mood_color },
      nowPlaying: { title: p.now_playing_title, artist: p.now_playing_artist, albumArt: p.now_playing_album_art, isPlaying: p.now_playing_is_playing },
      photoWidgetText: p.photo_widget_text,
      links: Array.isArray(p.links) ? p.links : (typeof p.links === 'string' ? JSON.parse(p.links) : []),
      musicUrl: p.music_url || '',
      theme_name: p.theme_name || 'Cyberpunk'
    };

    res.json({ profile: finalProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile: Public Fetch
app.get('/api/p/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const profileRes = await pool.query('SELECT * FROM profiles WHERE username = $1', [username]);
    if (profileRes.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    
    const p = profileRes.rows[0];
    const profile = {
      profile: { 
        name: p.name, 
        bio: p.bio, 
        avatarUrl: p.avatar_url,
        username: p.username 
      },
      mood: { vibe: p.mood_vibe, color: p.mood_color },
      nowPlaying: { title: p.now_playing_title, artist: p.now_playing_artist, albumArt: p.now_playing_album_art, isPlaying: p.now_playing_is_playing },
      photoWidgetText: p.photo_widget_text,
      links: Array.isArray(p.links) ? p.links : (typeof p.links === 'string' ? JSON.parse(p.links) : []),
      musicUrl: p.music_url || '',
      theme_name: p.theme_name || 'Cyberpunk'
    };
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users: Search
app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  try {
    const searchRes = await pool.query(
      'SELECT name, username, avatar_url FROM profiles WHERE username ILIKE $1 OR name ILIKE $1 LIMIT 10',
      [`%${q}%`]
    );
    res.json({ results: searchRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stories: Create
// NATIVE STORY UPLOAD
app.post('/api/stories/upload', upload.single('image'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageUrl = `/stories/${req.file.filename}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      'INSERT INTO stories (email, image_url, expires_at) VALUES ($1, $2, $3)',
      [email, imageUrl, expiresAt]
    );

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Stories: Feed
app.get('/api/stories/feed', async (req, res) => {
  try {
    const feedRes = await pool.query(`
      SELECT 
        p.username, p.name, p.avatar_url as avatar,
        s.id, s.image_url
      FROM stories s
      JOIN profiles p ON s.email = p.email
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `);
    
    // Group by user manually for reliability
    const feedMap = {};
    feedRes.rows.forEach(row => {
      if (!feedMap[row.username]) {
        feedMap[row.username] = { username: row.username, name: row.name, avatar: row.avatar, stories: [] };
      }
      feedMap[row.username].stories.push({ id: row.id, image_url: row.image_url });
    });
    
    res.json({ feed: Object.values(feedMap) });
  } catch (err) {
    console.error("Feed Error Details:", err);
    res.status(500).json({ error: 'Failed to fetch stories feed' });
  }
});

// POSTS: Create (Native)
app.post('/api/posts/create', upload.single('image'), async (req, res) => {
  try {
    const { email, caption } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageUrl = `/stories/${req.file.filename}`; // reusing stories folder for simplicity
    await pool.query(
      'INSERT INTO posts (email, image_url, caption) VALUES ($1, $2, $3)',
      [email, imageUrl, caption || '']
    );

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Post failed' });
  }
});

// POSTS: Fetch for User (Refactored to include counts)
app.get('/api/posts/:username', async (req, res) => {
  const { username } = req.params;
  const { me } = req.query; // current user's email to check like/vibe status
  try {
    const postsRes = await pool.query(`
      SELECT 
        po.*,
        (SELECT COUNT(*) FROM likes WHERE post_id = po.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = po.id) as comments_count,
        (SELECT COUNT(*) FROM vibes WHERE post_id = po.id) as vibes_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = po.id AND email = $2) as has_liked,
        EXISTS(SELECT 1 FROM vibes WHERE post_id = po.id AND email = $2) as has_vibed
      FROM posts po
      JOIN profiles pr ON po.email = pr.email
      WHERE pr.username = $1
      ORDER BY po.created_at DESC
    `, [username, me || '']);
    res.json({ posts: postsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INTERACTION: Like/Unlike
app.post('/api/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    await pool.query('INSERT INTO likes (post_id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    await pool.query('DELETE FROM likes WHERE post_id = $1 AND email = $2', [id, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INTERACTION: Vibe
app.post('/api/posts/:id/vibe', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    await pool.query('INSERT INTO vibes (post_id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INTERACTION: Comments
app.get('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const commentsRes = await pool.query(`
      SELECT c.*, p.username, p.avatar_url 
      FROM comments c
      JOIN profiles p ON c.email = p.email
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    res.json({ comments: commentsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { email, content } = req.body;
  try {
    const comRes = await pool.query(
      'INSERT INTO comments (post_id, email, content) VALUES ($1, $2, $3) RETURNING id',
      [id, email, content]
    );
    res.json({ success: true, commentId: comRes.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INTERACTION: Delete Post
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    const postOwner = await pool.query('SELECT email FROM posts WHERE id = $1', [id]);
    if (postOwner.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    if (postOwner.rows[0].email !== email) return res.status(403).json({ error: 'Unauthorized to delete' });

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// FOLLOW SYSTEM: Follow
app.post('/api/follow', async (req, res) => {
  const { followerEmail, targetUsername } = req.body;
  try {
    const target = await pool.query('SELECT email FROM profiles WHERE username = $1', [targetUsername]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'Target user not found' });
    const followingEmail = target.rows[0].email;

    if (followerEmail === followingEmail) return res.status(400).json({ error: "Cannot follow yourself" });
    
    await pool.query(
      'INSERT INTO followers (follower_email, following_email) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerEmail, followingEmail]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FOLLOW SYSTEM: Unfollow
app.post('/api/unfollow', async (req, res) => {
  const { followerEmail, targetUsername } = req.body;
  try {
    const target = await pool.query('SELECT email FROM profiles WHERE username = $1', [targetUsername]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'Target user not found' });
    const followingEmail = target.rows[0].email;

    await pool.query(
      'DELETE FROM followers WHERE follower_email = $1 AND following_email = $2',
      [followerEmail, followingEmail]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FOLLOW SYSTEM: Status
app.get('/api/follow/status/:meEmail/:targetUsername', async (req, res) => {
  const { meEmail, targetUsername } = req.params;
  try {
    const target = await pool.query('SELECT email FROM profiles WHERE username = $1', [targetUsername]);
    if (target.rows.length === 0) return res.json({ following: false });
    const followingEmail = target.rows[0].email;

    const statusRes = await pool.query(
      'SELECT 1 FROM followers WHERE follower_email = $1 AND following_email = $2',
      [meEmail, followingEmail]
    );
    res.json({ following: statusRes.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FOLLOW SYSTEM: List (Followers or Following)
app.get('/api/follow/list/:username', async (req, res) => {
  const { username } = req.params;
  const { type } = req.query; // 'followers' or 'following'
  try {
    const userRes = await pool.query('SELECT email FROM profiles WHERE username = $1', [username]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userEmail = userRes.rows[0].email;

    let listRes;
    if (type === 'followers') {
      listRes = await pool.query(`
        SELECT p.name, p.username, p.avatar_url
        FROM followers f
        JOIN profiles p ON f.follower_email = p.email
        WHERE f.following_email = $1
      `, [userEmail]);
    } else {
      listRes = await pool.query(`
        SELECT p.name, p.username, p.avatar_url
        FROM followers f
        JOIN profiles p ON f.following_email = p.email
        WHERE f.follower_email = $1
      `, [userEmail]);
    }

    res.json({ users: listRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FOLLOW SYSTEM: Counts
app.get('/api/follow/counts/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // We need the email for the username first
    const userRes = await pool.query('SELECT email FROM profiles WHERE username = $1', [username]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const email = userRes.rows[0].email;
    
    const followersCount = await pool.query('SELECT COUNT(*) FROM followers WHERE following_email = $1', [email]);
    const followingCount = await pool.query('SELECT COUNT(*) FROM followers WHERE follower_email = $1', [email]);
    
    res.json({
      followers: parseInt(followersCount.rows[0].count),
      following: parseInt(followingCount.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // 3. Serve Frontend (Unified Hosting)
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
  console.log(`✅ VibeCheck Full-Stack running on port ${PORT}`);
});


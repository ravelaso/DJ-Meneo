// server.ts

import express, { Request, Response } from 'express';
import path from 'path'; // Import the 'path' module
import bot from './Client';

const server = express();

// Serve the static frontend files (index.html, app.js, and styles.css)
const publicPath = path.join(__dirname, 'public', 'express');
server.use(express.static(publicPath));

server.get('/status',(req: Request, res: Response) => {
    const status = {
        botTag: bot.user?.tag,
        guildCount: bot.guilds.cache.size,
        userCount: bot.users.cache.size,
        memoryUsage: process.memoryUsage(),
        uptime: bot.uptime,
    };
    res.json(status);
})

server.get('/', (req: Request, res: Response) => {
    // Use 'path.join' to construct the absolute path to the index.html file
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath);
  });

  
const PORT = 8080;
server.listen(PORT, () => {
    console.log('Web Portal server is running')
})

export default server // Export the Express.js app instance

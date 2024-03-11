const express = require('express');
const axios = require('axios');
const Docker = require('dockerode');
const docker = new Docker({socketPath: 'npipe:////./pipe/docker_engine'});
const app = express();
const port = 3000;

// Simple Dockerfile templates for demonstration
const dockerfileTemplates = {
  python: 'FROM python:3.8-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD ["python", "app.py"]',
  node: 'FROM node:14\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD ["node", "app.js"]',
  Java: 'FROM openjdk:11\n WORKDIR /app \nCOPY . . \nEXPOSE 8080 \nCMD ["java", "-jar", "your-java-application.jar"]'
  // Add more templates as needed
};




app.use(express.json());
app.post('/generateDockerfile', async (req, res) => {
  const { githubUrl , token } = req.body;
  console.log('githubUrl:', githubUrl);
  
  
  if (!githubUrl) return res.status(400).send('Missing githubUrl in request body');

  try {
     // Extract owner and repo from GitHub URL
     const [owner, repo] = githubUrl.split('/').slice(-2);
     console.log(`Owner: ${owner}, Repo: ${repo}`);
    // Fetch repository information from GitHub API
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
    const language = response.data.language;
    console.log(`language: ${language}`);
    


    // Generate Dockerfile based on language
    const dockerfileContent = dockerfileTemplates[language];
    if (!dockerfileContent) return res.status(400).send('Unsupported language or language not detected');

    // Create Dockerfile
    const fs = require('fs');
    fs.writeFileSync('Dockerfile', dockerfileContent);

    // Build Docker image
    const image = await docker.buildImage({
      context: '.',
      src: ['Dockerfile'],
    });

    res.send('Docker image built successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating Dockerfile or building Docker image');
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

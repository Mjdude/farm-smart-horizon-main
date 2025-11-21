import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { spawn } from 'child_process';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Simple prediction endpoint that delegates to Python
router.post('/predict', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save temp file
    const tempPath = path.join(__dirname, `../../public/temp_${Date.now()}.jpg`);
    const fs = require('fs');
    fs.writeFileSync(tempPath, req.file.buffer);

    // Call Python script for prediction
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../scripts/predict.py'),
      tempPath
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Cleanup temp file
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.error('Failed to delete temp file:', e);
      }

      if (code !== 0) {
        console.error('Python error (exit code ' + code + '):', errorOutput);
        return res.status(500).json({ 
          error: 'Prediction failed', 
          details: errorOutput || 'Python script exited with error',
          exitCode: code
        });
      }

      try {
        const result = JSON.parse(output);
        if (result.error) {
          console.error('Python returned error:', result.error);
          return res.status(500).json({ error: 'Prediction failed', details: result.error });
        }
        res.json(result);
      } catch (e) {
        console.error('Failed to parse Python output:', output);
        console.error('Parse error:', e);
        res.status(500).json({ error: 'Invalid prediction response', output: output });
      }
    });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;


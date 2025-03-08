const express = require('express');
const sharp = require('sharp');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

sharp.cache(false);
sharp.concurrency(10);

app.use(compression());
app.use(express.raw({ limit: '10mb', type: 'image/svg+xml' })); // Increase limit and set correct MIME type
// app.use(express.json({ limit: '10mb' })); // Allow JSON input

app.post('/convert', async (req, res) => {
    try {
        let svgBuffer = req.body;

        // Handle different input types (Buffer or JSON with svg property)
        if (typeof req.body === 'object' && req.body !== null && req.body.svg) {
            svgBuffer = Buffer.from(req.body.svg);
        } else if (!Buffer.isBuffer(svgBuffer)) {
            return res.status(400).send('Invalid SVG data.  Must be either SVG XML or JSON with "svg" property.');
        }

        const jpgBuffer = await sharp(svgBuffer, { density: 64 }) // Adjust density as needed
            .jpeg({ quality: parseInt(req.query.quality) || 50 }) // Get quality from query params or default to 40
            .toBuffer();

        res.set('Content-Type', 'image/jpeg');
        res.send(jpgBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error converting SVG to JPG: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// GET route for testing
app.post("/delete", (req, res) => {
    const hlsUrl = req.body.data.hlsUrl;
    const files = fs.readdirSync(publicDir);

    files.forEach((file) => {
        if (file.match(hlsUrl)) {
            fs.unlink(file, (err) => {
                if (err) {
                    console.error(`Error deleting file ${file}:`, err);
                } else {
                    console.log(`Deleted file: ${file}`);
                }
            });
        }
    });
});

// POST API to convert HLS to MP4
app.post("/convert", (req, res) => {
    const hlsUrl = req.body.data.hlsUrl;
    console.log("hlsUrl");
    if (!hlsUrl) {
        return res.status(400).json({ error: "HLS URL is required" });
    }

    const outputFilename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(publicDir, outputFilename);

    const ffmpegCommand = `ffmpeg -i "${hlsUrl}" -c copy -bsf:a aac_adtstoasc "${outputPath}"`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            // console.error("FFmpeg error:", error);
            return res.status(500).json({ error: "Conversion failed" });
        }
        const videoUrl = `${req.protocol}://${req.get(
            "host"
        )}/${outputFilename}`;
        res.json({ mp4Url: videoUrl });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

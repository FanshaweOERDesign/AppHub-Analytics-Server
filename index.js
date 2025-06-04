import express from 'express';
import cors from 'cors';
import * as dbrtns from './mongodb/dbrtns.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const self = process.env.SERVER_URL || 'http://localhost:3000';

const app = express();
app.use(cors({}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.userAgent = req.headers['user-agent'];
    req.referrer = req.headers['referer'] || req.headers['referrer'];
    next();
  });

  const allowedDomains = [
    'https://fanshaweoerdesign.github.io',
    self,
  ];

  // Middleware to validate the referer header
  function validateReferer(req, res, next) {
    const isValid = allowedDomains.some(domain => req.referrer.startsWith(domain));
    if (!isValid) {
        console.warn(`Blocked tracking pixel request from invalid referer: ${referer}`);
        return res.status(403).end(); // Forbidden
    }
    next();
  }

function sendTrackingPixel(res) {
    const gifBuffer = Buffer.from(
        'R0lGODlhAQABAAAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        'base64'
    );
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(gifBuffer);
}

app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Track unique visits with timestamp
app.get('/track-unique.gif', validateReferer, (req, res) => {

    const visit = {
        appId: req.query.appId,
        userIp: req.clientIp,
        userAgent: req.userAgent,
        referrer: req.referrer,
        timestamp: new Date().toISOString(),
    };
    dbrtns.trackVisitUnique(visit)
        .then(result => {
            // Send a 1x1 transparent GIF as the response
            sendTrackingPixel(res);
        })
        .catch(error => {
            res.status(500).json({ message: 'Error tracking visit', error });
        });
    

    }
);

// Get unique visits with timestamp
app.get('/unique-visits', (req, res) => {
    dbrtns.getUniqueVisits()
        .then(result => {
            res.status(200).json({ message: 'Unique visits retrieved successfully', result });
        })
        .catch(error => {
            res.status(500).json({ message: 'Error retrieving unique visits', error });
        });
    }
);

// Track simple number of visits, visitors
app.get('/track.gif', validateReferer, (req, res) => {
    
    const visit = {
        appId: req.query.appId,
        userIp: req.clientIp,
        userAgent: req.userAgent,
        referrer: req.referrer,
    };
    dbrtns.trackVisit(visit)
        .then(result => {
            // Send a 1x1 transparent GIF as the response
            sendTrackingPixel(res);

        })
        .catch(error => {
            res.status(500).json({ message: 'Error tracking visit', error });
        });
    }
);

app.get('/totals', (req, res) => {
    dbrtns.getVisitTotals()
        .then(result => {
            res.status(200).json({ message: 'Visit totals retrieved successfully', result });
        })
        .catch(error => {
            res.status(500).json({ message: 'Error retrieving visit totals', error });
        });
    }
);

app.get('/visitors', (req, res) => {
    dbrtns.getVisitorCounts()
        .then(result => {
            console.log('Visitor counts:', result);
            res.status(200).json({ message: 'Visitor counts retrieved successfully', result });
        })
        .catch(error => {
            res.status(500).json({ message: 'Error retrieving visitor counts', error });
        });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});



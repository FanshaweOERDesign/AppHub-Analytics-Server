import * as db from './mongodb.js';

const dbConn = await db.connect('AppHubTracker');

async function trackVisit(visit){
    try {
        
        const result = await db.findOne('visits', { appId: visit.appId, userIp: visit.userIp });
        if (result) {
            // Update the existing visit
            await db.updateOne('visits', { appId: visit.appId, userIp: visit.userIp }, { $inc: { numVisits: 1 } });

        } else {
            // Insert a new visit
            await db.insertOne('visits', {...visit, numVisits: 1});
        }
        return result;
    }
    catch (error) {
        console.error('Error adding visit:', error);
        throw error;
    }
}

async function getVisitTotals() {
    const visitTotals = {};
    try {
        const dbConn = await db.connect('AppHubTracker');
        const result = await db.findMany('visits', {});
        for (const visit of result) {
            const appId = visit.appId;
            if (!visitTotals[appId]) {
                visitTotals[appId] = 0;
            }
            visitTotals[appId] += visit.numVisits;
        }
        return visitTotals;
    } catch (error) {
        console.error('Error getting total number of visits:', error);
        throw error;
    }
}

async function getVisitorCounts() {
    const visitorCounts = {};
    try {
        const dbConn = await db.connect('AppHubTracker');
        const result = await db.findMany('visits', {});
        for (const visit of result) {
            const appId = visit.appId;
            if (!visitorCounts[appId]) {
                visitorCounts[appId] = new Set();
            }
            visitorCounts[appId].add(visit.userIp);
        }
        // Convert sets to counts
        for (const appId in visitorCounts) {
            visitorCounts[appId] = visitorCounts[appId].size;
        }
        return visitorCounts;
    } catch (error) {
        console.error('Error getting unique visitor counts:', error);
        throw error;
    }
}

async function trackVisitUnique(visit) {
    try {
        const result = await db.insertOne('uniqueVisits', visit);
        return result;
    } catch (error) {
        console.error('Error adding unique visit:', error);
        throw error;
    }          
}

async function getUniqueVisits() {
    try {
        const result = await db.findMany('uniqueVisits', {});
        return result;
    } catch (error) {
        console.error('Error getting unique visits:', error);
        throw error;
    }
}

export {trackVisit, getVisitTotals, getVisitorCounts, trackVisitUnique, getUniqueVisits};


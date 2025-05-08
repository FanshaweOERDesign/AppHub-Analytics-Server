//paste this code into the page of the app you want to track visits for
// This code will send a request to the server to track the visit
// change the endpoint to track unique visits to: /track-unique.gif

// track visits
(async function () {
    try{
        const params = new URLSearchParams({
          appId: window.location.pathname.split('/').filter(Boolean)[0] || 'unknown',
          t: Date.now()
    });
    await fetch(`https://apphub-analytics-server-production.up.railway.app/track.gif?${params.toString()}`); 
    } catch(err) {
        console.error(err);
    }
})();
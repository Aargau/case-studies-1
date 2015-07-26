var interactions = (function () {
    var hitBottom = false,
        hasScrolled = false,
        hasTrackedScroll = false,
        interval, listener;

    function scrollListener() {
        hasScrolled = true;
    }

    function scrollInterval() {
        if (!appInsights || !hasScrolled) {
            return;
        }

        if (hasScrolled && hitBottom) {
            if (interval) {
                window.clearInterval(interval);
            }
            if (listener) {
                window.removeEventListener('scroll', listener)
            }
        }

        if (!hasTrackedScroll) {
            hasTrackedScroll = true;
            appInsights.trackEvent('Page:Scrolled');
        }
        
        if (!hitBottom && ((window.innerHeight + window.scrollY) >= document.body.scrollHeight)) {
            hitBottom = true;
            appInsights.trackEvent('Page:End');
        }
    }

    listener = window.addEventListener('scroll', scrollListener);
    interval = window.setInterval(scrollInterval, 100);

    document.body.addEventListener('copy', function (e) {
        appInsights.trackEvent('Clipboard:Copy');
    })
    document.body.addEventListener('cut', function (e) {
        appInsights.trackEvent('Clipboard:Cut');
    })
}());

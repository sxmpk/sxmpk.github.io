(function () {
    document.querySelectorAll('[data-optional-media]').forEach(function (media) {
        media.addEventListener('error', function () {
            var panel = media.closest('.media-panel');
            if (panel) panel.remove();
        });
    });
}());

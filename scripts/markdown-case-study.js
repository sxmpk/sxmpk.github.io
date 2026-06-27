(function () {
    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section';
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderInline(text) {
        var placeholders = [];
        var escaped = escapeHtml(text);

        escaped = escaped.replace(/`([^`]+)`/g, function (_, code) {
            var token = '\u0000CODE' + placeholders.length + '\u0000';
            placeholders.push('<code>' + code + '</code>');
            return token;
        });

        escaped = escaped.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g, function (_, url) {
            return '<a href="' + url + '" target="_blank" rel="noreferrer">' + url + '</a>';
        });

        escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, function (_, label, url) {
            return '<a href="' + url + '" target="_blank" rel="noreferrer">' + label + '</a>';
        });

        escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
            return '<a href="' + url + '">' + label + '</a>';
        });

        placeholders.forEach(function (html, index) {
            escaped = escaped.replace('\u0000CODE' + index + '\u0000', html);
        });

        return escaped;
    }

    function appendParagraph(section, lines) {
        if (!lines.length) return;
        var p = document.createElement('p');
        p.innerHTML = renderInline(lines.join(' '));
        section.appendChild(p);
        lines.length = 0;
    }

    function appendList(section, items) {
        if (!items.length) return;
        var ul = document.createElement('ul');
        items.forEach(function (item) {
            var li = document.createElement('li');
            li.innerHTML = renderInline(item);
            ul.appendChild(li);
        });
        section.appendChild(ul);
        items.length = 0;
    }

    function parseMarkdown(markdown) {
        var fragment = document.createDocumentFragment();
        var sections = [];
        var currentSection = null;
        var paragraphLines = [];
        var listItems = [];
        var usedIds = {};

        markdown.split(/\r?\n/).forEach(function (line) {
            var trimmed = line.trim();
            var heading = trimmed.match(/^##\s+(.+)$/);
            var topHeading = trimmed.match(/^#\s+(.+)$/);
            var listItem = trimmed.match(/^-\s+(.+)$/);

            if (topHeading) return;

            if (heading) {
                if (currentSection) {
                    appendParagraph(currentSection, paragraphLines);
                    appendList(currentSection, listItems);
                }

                var title = heading[1].trim();
                var baseId = slugify(title);
                var id = baseId;
                var count = 2;
                while (usedIds[id]) {
                    id = baseId + '-' + count;
                    count += 1;
                }
                usedIds[id] = true;

                currentSection = document.createElement('section');
                currentSection.id = id;

                var h2 = document.createElement('h2');
                h2.textContent = title;
                currentSection.appendChild(h2);
                fragment.appendChild(currentSection);
                sections.push({ id: id, title: title });
                return;
            }

            if (!currentSection) return;

            if (!trimmed) {
                appendParagraph(currentSection, paragraphLines);
                appendList(currentSection, listItems);
                return;
            }

            if (listItem) {
                appendParagraph(currentSection, paragraphLines);
                listItems.push(listItem[1].trim());
                return;
            }

            appendList(currentSection, listItems);
            paragraphLines.push(trimmed);
        });

        if (currentSection) {
            appendParagraph(currentSection, paragraphLines);
            appendList(currentSection, listItems);
        }

        return { content: fragment, sections: sections };
    }

    function renderNav(nav, sections) {
        nav.textContent = '';
        sections.forEach(function (section) {
            var link = document.createElement('a');
            link.href = '#' + section.id;
            link.textContent = section.title;
            nav.appendChild(link);
        });
    }

    function renderFallback(container, nav, message) {
        container.textContent = '';
        var section = document.createElement('section');
        section.id = 'content-unavailable';
        var h2 = document.createElement('h2');
        h2.textContent = 'Content unavailable';
        var p = document.createElement('p');
        p.textContent = message;
        section.appendChild(h2);
        section.appendChild(p);
        container.appendChild(section);
        renderNav(nav, [{ id: 'content-unavailable', title: 'Content unavailable' }]);
    }

    document.querySelectorAll('[data-markdown]').forEach(function (container) {
        var nav = document.querySelector('.case-nav');
        var source = container.getAttribute('data-markdown');

        fetch(source)
            .then(function (response) {
                if (!response.ok) throw new Error('Unable to load ' + source);
                return response.text();
            })
            .then(function (markdown) {
                var parsed = parseMarkdown(markdown);
                container.textContent = '';
                container.appendChild(parsed.content);
                if (nav) renderNav(nav, parsed.sections);
            })
            .catch(function () {
                renderFallback(container, nav, 'Open this page through a local or hosted web server so the markdown source can be loaded.');
            });
    });
}());

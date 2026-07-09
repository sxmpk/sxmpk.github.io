(function () {
    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section';
    }

    function getSlug() {
        var params = new URLSearchParams(window.location.search);
        return params.get('slug') || window.location.hash.replace(/^#/, '');
    }

    function setText(selector, text) {
        var element = document.querySelector(selector);
        if (element) element.textContent = text || '';
    }

    function createLink(href, label, external) {
        var link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        if (external) {
            link.target = '_blank';
            link.rel = 'noreferrer';
        }
        return link;
    }

    function isExternalUrl(url) {
        return /^https?:\/\//.test(url);
    }

    function isSafeHref(url) {
        return /^(https?:|mailto:|#|\.{0,2}\/|[^:]+$)/.test(url);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderInlineMarkdown(text) {
        var codeSpans = [];
        var html = escapeHtml(text).replace(/`([^`]+)`/g, function (match, code) {
            var index = codeSpans.length;
            codeSpans.push('<code>' + code + '</code>');
            return '\u0000CODE' + index + '\u0000';
        });

        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, label, href) {
            var safeHref = isSafeHref(href) ? href : '#';
            var external = isExternalUrl(safeHref);
            return '<a href="' + escapeHtml(safeHref) + '"' + (external ? ' target="_blank" rel="noreferrer"' : '') + '>' + label + '</a>';
        });

        html = html
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');

        codeSpans.forEach(function (code, index) {
            html = html.replace('\u0000CODE' + index + '\u0000', code);
        });

        return html;
    }

    function createMarkdownElement(tagName, text) {
        var element = document.createElement(tagName);
        element.innerHTML = renderInlineMarkdown(text);
        return element;
    }

    function hasRenderableMedia(project) {
        return (project.media || []).some(function (item) {
            return item && item.srcUrl && /^(image|video|embed)$/.test(item.type);
        });
    }

    function renderActions(project) {
        var actions = document.querySelector('[data-project-actions]');
        if (!actions) return;
        actions.textContent = '';

        if (project.repositoryUrl) {
            actions.appendChild(createLink(project.repositoryUrl, 'GitHub repository', true));
        }

        if (hasRenderableMedia(project)) {
            actions.appendChild(createLink('#media', 'Product media'));
        }

        if (project.caseStudyContentUrl) {
            actions.appendChild(createLink(project.caseStudyContentUrl, 'Markdown source'));
        }
    }

    function renderLabels(project) {
        var labels = document.querySelector('[data-project-labels]');
        if (!labels) return;
        labels.textContent = '';
        labels.setAttribute('aria-label', project.title + ' technologies and project areas');

        (project.detailLabels || project.stack || []).forEach(function (item) {
            var label = document.createElement('span');
            label.className = 'tech-label';
            label.textContent = item;
            labels.appendChild(label);
        });
    }

    function appendMediaText(panel, item) {
        if (item.label) {
            var label = document.createElement('div');
            label.className = 'media-label';
            label.textContent = item.label;
            panel.appendChild(label);
        }

        if (item.title) {
            var title = document.createElement('div');
            title.className = 'media-title';
            title.textContent = item.title;
            panel.appendChild(title);
        }

        if (item.note) {
            var note = document.createElement('p');
            note.className = 'media-note';
            note.textContent = item.note;
            panel.appendChild(note);
        }
    }

    function createImagePanel(item) {
        var panel = document.createElement('div');
        panel.className = 'media-panel image-panel';

        var image = document.createElement('img');
        image.src = item.srcUrl;
        image.alt = item.alt || item.title || 'Project image';
        image.addEventListener('error', function () {
            panel.remove();
        });

        appendMediaText(panel, item);
        panel.appendChild(image);
        return panel;
    }

    function createVideoPanel(item) {
        var panel = document.createElement('div');
        panel.className = 'media-panel video-panel';

        var video = document.createElement('video');
        video.src = item.srcUrl;
        video.controls = true;
        video.preload = 'metadata';
        video.addEventListener('error', function () {
            panel.remove();
        });

        appendMediaText(panel, item);
        panel.appendChild(video);
        return panel;
    }

    function createEmbedPanel(item) {
        var panel = document.createElement('div');
        panel.className = 'media-panel embed-panel';

        var frame = document.createElement('iframe');
        frame.src = item.srcUrl;
        frame.title = item.title || 'Project video';
        frame.loading = 'lazy';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';

        appendMediaText(panel, item);
        panel.appendChild(frame);
        return panel;
    }

    function createMediaPanel(item) {
        if (!item || !item.srcUrl) return null;
        if (item.type === 'image') return createImagePanel(item);
        if (item.type === 'video') return createVideoPanel(item);
        if (item.type === 'embed') return createEmbedPanel(item);
        return null;
    }

    function renderMedia(project) {
        var media = document.querySelector('[data-project-media]');
        if (!media) return;
        media.textContent = '';

        (project.media || []).forEach(function (item) {
            var panel = createMediaPanel(item);
            if (panel) media.appendChild(panel);
        });

        if (!media.children.length) media.remove();
    }

    function isBlockStart(line) {
        return /^#{1,6}\s+/.test(line) ||
            /^```/.test(line) ||
            /^[-*]\s+/.test(line) ||
            /^\d+\.\s+/.test(line);
    }

    function createList(tagName, items) {
        var list = document.createElement(tagName);
        items.forEach(function (text) {
            var item = createMarkdownElement('li', text);
            list.appendChild(item);
        });
        return list;
    }

    function renderMarkdown(markdown) {
        var fragment = document.createDocumentFragment();
        var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
        var index = 0;

        while (index < lines.length) {
            var line = lines[index];

            if (!line.trim()) {
                index += 1;
                continue;
            }

            var fence = line.match(/^```\s*([a-z0-9_-]+)?\s*$/i);
            if (fence) {
                index += 1;
                var codeLines = [];
                while (index < lines.length && !/^```/.test(lines[index])) {
                    codeLines.push(lines[index]);
                    index += 1;
                }
                if (index < lines.length) index += 1;

                var pre = document.createElement('pre');
                var code = document.createElement('code');
                if (fence[1]) code.className = 'language-' + fence[1].toLowerCase();
                code.textContent = codeLines.join('\n');
                pre.appendChild(code);
                fragment.appendChild(pre);
                continue;
            }

            var heading = line.match(/^(#{1,6})\s+(.+)$/);
            if (heading) {
                var level = heading[1].length;
                var headingElement = createMarkdownElement('h' + level, heading[2]);
                headingElement.id = slugify(heading[2]);
                fragment.appendChild(headingElement);
                index += 1;
                continue;
            }

            if (/^[-*]\s+/.test(line)) {
                var unorderedItems = [];
                while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
                    unorderedItems.push(lines[index].replace(/^[-*]\s+/, ''));
                    index += 1;
                }
                fragment.appendChild(createList('ul', unorderedItems));
                continue;
            }

            if (/^\d+\.\s+/.test(line)) {
                var orderedItems = [];
                while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
                    orderedItems.push(lines[index].replace(/^\d+\.\s+/, ''));
                    index += 1;
                }
                fragment.appendChild(createList('ol', orderedItems));
                continue;
            }

            var paragraphLines = [];
            while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
                paragraphLines.push(lines[index].trim());
                index += 1;
            }
            fragment.appendChild(createMarkdownElement('p', paragraphLines.join(' ')));
        }

        return fragment;
    }

    function renderCaseNav(content, nav) {
        var headings = Array.prototype.slice.call(content.querySelectorAll('h2'));
        nav.textContent = '';

        headings.forEach(function (heading) {
            nav.appendChild(createLink('#' + heading.id, heading.textContent));
        });

        if (!headings.length) nav.remove();
    }

    function renderCaseStudy(markdown) {
        var content = document.querySelector('[data-case-study]');
        var nav = document.querySelector('[data-case-nav]');
        if (!content || !nav) return;

        content.textContent = '';
        content.appendChild(renderMarkdown(markdown));
        renderCaseNav(content, nav);

        if (!content.children.length) {
            content.appendChild(createMarkdownElement('p', 'No case study content has been added yet.'));
        }
    }

    function renderMissingProject(slug) {
        document.title = 'Project Not Found | Igor Borzyszkowski';
        setText('[data-project-title]', 'Project not found');
        setText('[data-project-summary]', 'Add a project YAML file to data/projects.yml for slug "' + slug + '".');
    }

    function renderProject(project) {
        document.title = project.title + ' Case Study | Igor Borzyszkowski';
        setText('[data-project-title]', project.title);
        setText('[data-project-summary]', project.detailSummary || project.summary);
        renderActions(project);
        renderLabels(project);
        renderMedia(project);
    }

    var slug = getSlug();
    if (!slug) {
        renderMissingProject('missing-slug');
        return;
    }

    window.SiteData.loadProjects()
        .then(function (projects) {
            var project = projects.find(function (item) {
                return item.slug === slug;
            });

            if (!project) {
                renderMissingProject(slug);
                return null;
            }

            renderProject(project);

            if (!project.caseStudyContentUrl) return null;
            return window.SiteData.fetchText(project.caseStudyContentUrl);
        })
        .then(function (markdown) {
            if (markdown) renderCaseStudy(markdown);
        })
        .catch(function () {
            setText('[data-project-title]', 'Project unavailable');
            setText('[data-project-summary]', 'Open this page through a local or hosted web server so YAML project data can be loaded.');
        });
}());

(function () {
    var siteRoot = (document.currentScript ? document.currentScript.src : '').replace(/scripts\/yaml-data\.js$/, '');

    function tokenize(source) {
        return source
            .replace(/\t/g, '    ')
            .split(/\r?\n/)
            .map(function (line) {
                var indent = line.match(/^ */)[0].length;
                return {
                    indent: indent,
                    text: line.slice(indent).trimEnd()
                };
            })
            .filter(function (line) {
                return line.text && line.text.charAt(0) !== '#';
            });
    }

    function parseScalar(value) {
        if (value === 'null') return null;
        if (value === 'true') return true;
        if (value === 'false') return false;

        var first = value.charAt(0);
        var last = value.charAt(value.length - 1);
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
            return value.slice(1, -1);
        }

        return value;
    }

    function isKeyValue(text) {
        return /^[^:]+:\s*/.test(text);
    }

    function parseKeyValue(text) {
        var match = text.match(/^([^:]+):(?:\s*(.*))?$/);
        if (!match) {
            throw new Error('Invalid YAML line: ' + text);
        }

        return {
            key: match[1].trim(),
            value: match[2] || ''
        };
    }

    function createParser(tokens) {
        var index = 0;

        function current() {
            return tokens[index];
        }

        function parseBlock(indent) {
            var line = current();
            if (!line || line.indent < indent) return null;
            if (line.text.indexOf('- ') === 0) return parseArray(indent);
            return parseObject(indent);
        }

        function parseArray(indent) {
            var items = [];

            while (current() && current().indent === indent && current().text.indexOf('- ') === 0) {
                var line = current();
                var rest = line.text.slice(2).trim();
                index += 1;

                if (!rest) {
                    items.push(current() && current().indent > indent ? parseBlock(current().indent) : null);
                    continue;
                }

                if (isKeyValue(rest)) {
                    var item = {};
                    assignValue(item, parseKeyValue(rest), indent);

                    if (current() && current().indent > indent) {
                        var continuation = parseObject(current().indent);
                        Object.keys(continuation).forEach(function (key) {
                            item[key] = continuation[key];
                        });
                    }

                    items.push(item);
                    continue;
                }

                items.push(parseScalar(rest));
            }

            return items;
        }

        function parseObject(indent) {
            var object = {};

            while (current() && current().indent === indent && current().text.indexOf('- ') !== 0) {
                var pair = parseKeyValue(current().text);
                index += 1;
                assignValue(object, pair, indent);
            }

            return object;
        }

        function assignValue(object, pair, indent) {
            if (!pair.value) {
                object[pair.key] = current() && current().indent > indent ? parseBlock(current().indent) : null;
                return;
            }

            object[pair.key] = parseScalar(pair.value);
        }

        return {
            parse: function () {
                return parseBlock(0);
            }
        };
    }

    function parseYaml(source) {
        return createParser(tokenize(source)).parse();
    }

    function dirname(path) {
        var index = path.lastIndexOf('/');
        return index === -1 ? '' : path.slice(0, index + 1);
    }

    function joinPath(base, path) {
        if (!path) return '';
        if (/^(https?:)?\/\//.test(path) || path.charAt(0) === '/') return path;
        return base + path;
    }

    function getYouTubeId(path) {
        var match = String(path).match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        return match ? match[1] : '';
    }

    function normalizeEmbedUrl(path) {
        var youtubeId = getYouTubeId(path);
        if (youtubeId) return 'https://www.youtube-nocookie.com/embed/' + youtubeId;
        return path;
    }

    function getSiteRoot() {
        return siteRoot;
    }

    function fetchYaml(path) {
        return fetch(path).then(function (response) {
            if (!response.ok) throw new Error('Unable to load ' + path);
            return response.text();
        }).then(parseYaml);
    }

    function fetchText(path) {
        return fetch(path).then(function (response) {
            if (!response.ok) throw new Error('Unable to load ' + path);
            return response.text();
        });
    }

    function normalizeMedia(project, basePath) {
        var siteRoot = getSiteRoot();
        project.media = (project.media || []).map(function (item) {
            var normalized = {};
            Object.keys(item).forEach(function (key) {
                normalized[key] = item[key];
            });

            if (normalized.src) {
                var source = normalized.type === 'embed' ? normalizeEmbedUrl(normalized.src) : normalized.src;
                normalized.srcUrl = joinPath(siteRoot, joinPath(basePath, source));
            }

            return normalized;
        });
    }

    function normalizeProject(project, sourcePath) {
        var basePath = dirname(sourcePath);
        project.basePath = basePath;
        var siteRoot = getSiteRoot();
        project.caseStudyUrl = joinPath(siteRoot, 'project/?slug=' + encodeURIComponent(project.slug));
        project.caseStudyContentUrl = project.caseStudyPath ? joinPath(siteRoot, joinPath(basePath, project.caseStudyPath)) : '';
        project.caseStudySourceUrl = project.caseStudyContentUrl;
        project.posterUrl = joinPath(siteRoot, joinPath(basePath, project.poster));
        normalizeMedia(project, basePath);
        return project;
    }

    function loadProjects() {
        var siteRoot = getSiteRoot();
        return fetchYaml(joinPath(siteRoot, 'data/projects.yml')).then(function (registry) {
            var paths = registry.projects || [];
            return Promise.all(paths.map(function (path) {
                return fetchYaml(joinPath(siteRoot, path)).then(function (project) {
                    return normalizeProject(project, path);
                });
            }));
        });
    }

    window.SiteData = {
        parseYaml: parseYaml,
        fetchYaml: fetchYaml,
        fetchText: fetchText,
        loadProjects: loadProjects,
        joinPath: joinPath
    };
}());

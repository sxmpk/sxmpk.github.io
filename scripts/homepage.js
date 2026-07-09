(function () {
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

    function renderStack(project, container) {
        var stackItems = project.stack || [];
        var stack = document.createElement('p');
        stack.className = 'tech-line';
        stack.setAttribute('aria-label', project.title + ' technologies');
        stack.appendChild(document.createTextNode('Stack: '));

        stackItems.forEach(function (item, itemIndex) {
            var label = document.createElement('span');
            label.textContent = item;
            stack.appendChild(label);

            if (itemIndex < stackItems.length - 1) {
                stack.appendChild(document.createTextNode(' / '));
            }
        });

        container.appendChild(stack);
    }

    function renderProject(project, index, list) {
        var section = document.createElement('section');
        var titleId = 'project-' + project.slug + '-title';
        section.className = 'project';
        section.setAttribute('aria-labelledby', titleId);

        var number = document.createElement('span');
        number.className = 'link-number';
        number.textContent = '[' + (index + 1) + ']';

        var body = document.createElement('div');
        body.className = 'project-body';

        var title = createLink(project.caseStudyUrl, project.title);
        title.className = 'project-title';
        title.id = titleId;

        var summary = document.createElement('p');
        summary.className = 'project-summary';
        summary.textContent = project.summary;

        var actions = document.createElement('div');
        actions.className = 'project-actions';
        actions.appendChild(createLink(project.caseStudyUrl, 'case study'));

        if (project.repositoryUrl) {
            actions.appendChild(createLink(project.repositoryUrl, 'repository', true));
        }

        body.appendChild(title);
        body.appendChild(summary);
        renderStack(project, body);
        body.appendChild(actions);

        section.appendChild(number);
        section.appendChild(body);
        list.appendChild(section);
    }

    function renderFallback(list, message) {
        list.textContent = '';
        var section = document.createElement('section');
        section.className = 'project';

        var number = document.createElement('span');
        number.className = 'link-number';
        number.textContent = '[!]';

        var body = document.createElement('div');
        body.className = 'project-body';

        var title = document.createElement('span');
        title.className = 'project-title';
        title.textContent = 'Projects unavailable';

        var summary = document.createElement('p');
        summary.className = 'project-summary';
        summary.textContent = message;

        body.appendChild(title);
        body.appendChild(summary);
        section.appendChild(number);
        section.appendChild(body);
        list.appendChild(section);
    }

    var list = document.getElementById('project-list');
    if (!list) return;

    window.SiteData.loadProjects()
        .then(function (projects) {
            list.textContent = '';
            projects.forEach(function (project, index) {
                renderProject(project, index, list);
            });
        })
        .catch(function () {
            renderFallback(list, 'Open this page through a local or hosted web server so YAML project data can be loaded.');
        });
}());

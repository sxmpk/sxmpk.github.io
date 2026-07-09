# CV Website

Igor Borzyszkowski static CV and project case-study site.

## Projects

Project pages are rendered from YAML and Markdown. There is one generic
case-study page at `project/index.html`; individual project directories should
contain content and assets only.

To add a project, add its YAML file to `data/projects.yml`:

```yaml
projects:
  - planqr/project.yml
  - next-project/project.yml
```

Then create the project directory:

```text
project-slug/
  project.yml
  case-study.md
  poster.png      optional media
  demo.mp4        optional media
```

The homepage reads `data/projects.yml`, loads every listed `project.yml`, and
links to `project/?slug=project-slug`. The case-study page then loads the
matching project's Markdown file from `caseStudyPath`. Omit optional YAML fields
when a project does not need them.

Example `project.yml`:

```yaml
slug: project-slug
title: Project Name
summary: Short homepage summary.
detailSummary: Longer project-page intro.
repositoryUrl: https://github.com/example/project
caseStudyPath: case-study.md
stack:
  - React
  - TypeScript
detailLabels:
  - Full-stack engineering
  - Deployment
media:
  - type: image
    src: poster.png
    alt: Project poster
    label: Image
    title: Project poster
  - type: video
    src: demo.mp4
    label: Video
    title: Product demo
  - type: embed
    src: https://www.youtube.com/watch?v=VIDEO_ID
    label: Video
    title: YouTube demo
```

The `media` list is optional. If it is missing or empty, the media section and
media navigation link are not shown. Supported media types are `image`, `video`,
and `embed`. Media paths are relative to the project directory unless they are
absolute URLs. YouTube watch, shorts, youtu.be, and embed URLs are converted to
privacy-mode embed URLs automatically.

Write long-form project content in `case-study.md`. Supported Markdown includes
headings, paragraphs, unordered and ordered lists, links, inline code, fenced
code blocks, bold text, and italic text. The side navigation is generated from
`##` headings, so project articles should usually start with `## Summary`.

## Resume

The downloadable resume is `resume/resume.pdf`. The LaTeX source is `resume/resume.tex`.

To rebuild the PDF:

```bash
cd resume
pdflatex -interaction=nonstopmode -halt-on-error resume.tex
pdflatex -interaction=nonstopmode -halt-on-error resume.tex
```

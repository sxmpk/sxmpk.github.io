# CV Website

Igor Borzyszkowski static CV and project case-study site.

## Projects

Each project should have its own route directory:

```text
project-slug/
  index.html
  case-study.md
  poster.png      optional
```

Add the project metadata to `data/projects.js` so it appears on the homepage.
Use the `poster` field only when a project has a poster or image asset.

## Resume

The downloadable resume is `resume/resume.pdf`. The LaTeX source is `resume/resume.tex`.

To rebuild the PDF:

```bash
cd resume
pdflatex -interaction=nonstopmode -halt-on-error resume.tex
pdflatex -interaction=nonstopmode -halt-on-error resume.tex
```

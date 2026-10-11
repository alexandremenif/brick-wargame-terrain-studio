# Reference: Maintaining specs/ui/ (UI Presentation & Studio)

## Purpose
The `specs/ui/` directory defines visual ergonomics, application studio layout, toolbars, inspector panels, and user interactions for the web frontend.

## Structure
* `index.md`: Visual hierarchy, studio layout zones, and transport connection.
* Component specifications: Modular Markdown files detailing UI layout, toolbars, viewports, inspector panels, status bars, and interaction flows.
* `features/*.feature`: Executable Playwright UI acceptance criteria.

## Golden Rules
* When adding a new UI panel or feature, create a dedicated Markdown file and link it in `index.md`.
* UI components communicate exclusively via service client contracts over transport.

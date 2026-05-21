# TaskFlow - ToDo App

TaskFlow is a responsive task management web app built with HTML, CSS, and JavaScript. It helps organize tasks by priority, deadline, completion state, search, filters, and manual drag-and-drop ordering.

Playable online version:

[Open TaskFlow](https://www.yhlinworks.com/projects/taskflow/)

## Features

- Add tasks with title, priority, due date, and optional description.
- Edit existing tasks.
- Mark tasks as completed or pending.
- Delete individual tasks.
- Clear all completed tasks.
- Search tasks by text.
- Filter tasks by:
  - All
  - Pending
  - Completed
  - Overdue
- Sort tasks by:
  - Manual order
  - Creation date
  - Priority
  - Due date
- Drag and drop tasks when using manual order.
- Task statistics:
  - Total tasks
  - Pending tasks
  - Completed tasks
- Reminder tags for due dates.
- Overdue, today, tomorrow, and upcoming task states.
- Dark and light theme toggle.
- Data persistence with `localStorage`.
- Responsive layout for desktop and mobile.
- Custom logo and favicon.

## Technologies

- HTML
- CSS
- JavaScript
- Browser `localStorage`

## Run Locally

This project is fully static. You can open it directly in a browser:

```text
index.html
```

Or serve it with a local server:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Project Structure

```text
TaskFlow/
|-- assets/
|   |-- favicon.png
|   |-- logo-clean.png
|   `-- logo.png
|-- index.html
|-- script.js
|-- style.css
`-- README.md
```

## Main Files

- `index.html`: App structure and UI elements.
- `style.css`: Layout, themes, responsive styles, and visual design.
- `script.js`: Task logic, filters, sorting, editing, persistence, and drag-and-drop.
- `assets/`: Logo and favicon files.

## Data Persistence

TaskFlow saves user data in the browser using `localStorage`.

Stored data includes:

- Tasks
- Theme preference
- Manual task order

Because the data is local to the browser, tasks are not shared across devices or browsers.

## GitHub Pages

The project can be published directly with GitHub Pages because it does not require a backend or build step.

If used inside a portfolio, place it under:

```text
projects/taskflow/
```

Then it can be accessed at:

```text
https://www.yhlinworks.com/projects/taskflow/
```

## Author

YanHao Lin

- Portfolio: [www.yhlinworks.com](https://www.yhlinworks.com)
- GitHub: [jimlin829](https://github.com/jimlin829)

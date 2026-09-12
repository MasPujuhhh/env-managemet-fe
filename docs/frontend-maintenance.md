# Frontend maintenance

To add a page, create a view under its feature folder, add typed API functions under `services/api`, add a route, and cover loading, empty, error, and success states. Reusable visual behavior belongs under `components/ui`; reusable behavior belongs in a composable. Keep API services free of UI logic.
